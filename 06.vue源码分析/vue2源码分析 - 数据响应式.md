[vue源码入门系列一 - vue的初始化](https://juejin.cn/post/7036996683187617823)

[vue源码入门系列二 - 数据响应式](https://juejin.cn/post/7047052812819103752)

vue源码入门系列三 - 数据响应式二

下图为为前文分析过的 vue data 的响应式过程，本文从源码仔细分析整个数据响应式如何实现。

![vue-initState-7](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b36a909afbfc44969d9dc402449c7d7a~tplv-k3u1fbpfcp-watermark.image?)

数据进行响应式是从 initState ，过程会针对 props,methods,data,computed 和 watch 做数据的初始化处理，并将他们转换为响应式对象，接下来我们会逐步分析每一个过程。

```js
// core/instance/state.js
function initState(vm) {
  vm._watchers = [];
  var opts = vm.$options;
  // 初始化props
  if (opts.props) { initProps(vm, opts.props); }
  // 初始化methods
  if (opts.methods) { initMethods(vm, opts.methods); }
  // 初始化data
  if (opts.data) {
    initData(vm);
  } else {
    // 如果没有定义data，则创建一个空对象，并设置为响应式
    observe(vm._data = {}, true /* asRootData */);
  }
  // 初始化computed
  if (opts.computed) { initComputed(vm, opts.computed); }
  // 初始化watch
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}
```

## props 的数据响应式

回顾下 props 的用法：父组件将传递的数据作为子组件的属性，子组件通过 props 属性注册 key 值来接收数据。

```html
<div id='app'>
    <child :name=name></child>
</div>
<script>
    debugger
    Vue.component('child',{
        props:['name'],
        template:`<p>{{name}}</p>`
    });
	new Vue({
        data:{
            name:'zhangsan'
        }
    }).mount('#app')
</script>
```
把断点打在起始位置和 initProps 函数位置，得到 props 的响应式的调用栈

![vue-reactive-1](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/922d421cc3ae44808a99a3f627e70555~tplv-k3u1fbpfcp-watermark.image?)

从上面的调用栈中，可以看出整个组件会先将模板字符串变为 render 函数，render 函数执行 with 语句生成vNode，通过 patch 算法将 vNode 转变为真实 DOM。在 patch 过程中如果碰到的是自定义的子组件时，会重新调用 _init 方法进行数据的初始化。**props 数据响应式也是通过 defineReactive 给数据添加 getter 和 setter**。

```js
// core/instance/state.js
function initProps(vm: Component, propsOptions: Object) {
    debugger
  // 得到 propsData ，如果没有则设置为空对象
  // $options 中的 propsData 从何而来？？？
  const propsData = vm.$options.propsData || {}
  const props = vm._props = {}
  // keys用来作为缓存，prop更新可以使用数组迭代，而不是动态对象键枚举。
  const keys = vm.$options._propKeys = []

  for (const key in propsOptions) {
    keys.push(key)
    const value = validateProp(key, propsOptions, propsData, vm)
    defineReactive(props, key, value)
    if (!(key in vm)) {
      proxy(vm, `_props`, key)
    }
  }
}
```

对于 $options 中的 propsData 从何而来，在 _render 函数内打上断点

```js
// core/instance/render.js
Vue.prototype._render = function (): VNode {
  const vm: Component = this
  const { render, _parentVnode } = vm.$options
	// ...省略
  debugger
  vnode = render.call(vm._renderProxy, vm.$createElement)
	// ...省略
  return vnode
}

(function anonymous(
) {
with(this){return _c('div',{attrs:{"id":"app"}},[_c('child',{attrs:{"name":name}})],1)}
})
```

调用 render 函数执行 with 语句，得到如下调用栈

![vue-reactive-2](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8f4bc788b7554f23acb0e2788de63751~tplv-k3u1fbpfcp-watermark.image?)

propsData 则是执行 extractPropsFromVNodeData 函数得到。对于 props 的处理， extractPropsFromVNodeData 会对 attrs 属性进行规范校验后，最后会把校验后的结果以 propsData 属性的形式传入 Vnode 构造器中。总结来说， props 传递给占位符组件的写法，会以 propsData 的形式作为子组件 Vnode 的属性存在。

```js
// core/vdom/create-component.js
export function createComponent (
  Ctor: Class<Component> | Function | Object | void,
  data: ?VNodeData,
  context: Component,
  children: ?Array<VNode>,
  tag?: string
): VNode | Array<VNode> | void {

  data = data || {}

  // 提取 props 数据
  const propsData = extractPropsFromVNodeData(data, Ctor, tag)
  
  const vnode = new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, tag, children },
    asyncFactory
  )

  return vnode
}
```

HTML对大小写是不敏感的，所有的浏览器会把大写字符解释为小写字符，因此我们在使用 DOM 中的模板时，cameCase(驼峰命名法)的 props 名需要使用其等价的kebab-case (短横线分隔命名) 命代替。即： `<child :aB="test"></child> `需要写成 `<child :a-b="test"></child>`

```js
// core/vdom/helpers/extract-props.js
export function extractPropsFromVNodeData (
  data: VNodeData,
  Ctor: Class<Component>,
  tag?: string
): ?Object {
  // 子组件props选项
  const propOptions = Ctor.options.props
  const res = {}
  // data.attrs针对编译生成的render函数，data.props针对用户自定义的render函数
  const { attrs, props } = data
  if (isDef(attrs) || isDef(props)) {
    for (const key in propOptions) {
        // aB （小驼峰）形式转成 a-b 形式
      const altKey = hyphenate(key)
      if (process.env.NODE_ENV !== 'production') {
        const keyInLowerCase = key.toLowerCase()
        if (
          key !== keyInLowerCase &&
          attrs && hasOwn(attrs, keyInLowerCase)
        ) {
			// 警告	
        }
      }
        //处理 props 和 attrs 属性
      checkProp(res, props, key, altKey, true) ||
      checkProp(res, attrs, key, altKey, false)
    }
  }
  return res
}
```



## data 的数据响应式

数据响应化从 observe 开始，传入的参数为任何类型，

```js
// 
export function observe (value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  //!观察者,已经存在直接返回，不存在则创建新的实例
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}
```

