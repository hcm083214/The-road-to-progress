# vue源码入门学习系列一 - vue的初始化

本文从一个很简单的demo，通过 debugger ，断点 ， console.log 方式一步步了解 vue 初始化的过程，同时结合一些原理面刨析的视频，试图去初步了解 vue 初始化过程中都干了什么，关于思维导图部分只是整理一些我认为关键的函数，可能不是很对。

![Vue 初始化.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/574c6644ad934904821db679ed79a896~tplv-k3u1fbpfcp-watermark.image?)

## Vue 的静态属性和方法

引入 Vue 后通过 `console.dir(Vue)`，获得其静态属性及方法，也叫做全局 API ：

![vue-init-3.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ad6f8bdeeccb449db1b70f1372e3aa24~tplv-k3u1fbpfcp-watermark.image?)

## initGlobalAPI

- 全局 API

	- [Vue.extend](https://cn.vuejs.org/v2/api/#Vue-extend)
	- [Vue.nextTick](https://cn.vuejs.org/v2/api/#Vue-nextTick)
	- [Vue.set](https://cn.vuejs.org/v2/api/#Vue-set)
	- [Vue.delete](https://cn.vuejs.org/v2/api/#Vue-delete)
	- [Vue.directive](https://cn.vuejs.org/v2/api/#Vue-directive)
	- [Vue.filter](https://cn.vuejs.org/v2/api/#Vue-filter)
	- [Vue.component](https://cn.vuejs.org/v2/api/#Vue-component)
	- [Vue.use](https://cn.vuejs.org/v2/api/#Vue-use)
	- [Vue.mixin](https://cn.vuejs.org/v2/api/#Vue-mixin)
	- [Vue.observable](https://cn.vuejs.org/v2/api/#Vue-observable)

Vue 提供了的全局 api 方法，这些都是在 initGlobalAPI 中定义的。

```js
// core/index.js
initGlobalAPI(Vue)

// core/global-api/index.js
export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }

  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 2.6 explicit observable API
  Vue.observable = <T>(obj: T): T => {
    observe(obj)
    return obj
  }
  const ASSET_TYPES = [
      'component',
      'directive',
      'filter'
    ]
  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue

  extend(Vue.options.components, builtInComponents)
  // 定义Vue.use()
  initUse(Vue)
  // 定义Vue.mixin()
  initMixin(Vue)
  // 定义Vue.extend()
  initExtend(Vue)
  // 定义Vue.components, Vue.directive, Vue.filter
  initAssetRegisters(Vue)
}
```

## Vue 构造函数

从源码中看，Vue 的构造函数很简单，仅调用了 实例的 _init 方法，在导入 Vue 时会先执行 5 个函数， _init 方法则是通过执行 initMixin 函数得到的。执行 stateMixin， eventsMixin，lifecycleMixin，renderMixin 得到原型实例方法

```js
// core/instance/index.js
function Vue (options) {
  this._init(options)
}

initMixin(Vue) 
stateMixin(Vue) 
eventsMixin(Vue) 
lifecycleMixin(Vue) 
renderMixin(Vue) 

export default Vue
```

## 原型实例方法的定义

### initMixin

initMixin 定义 Vue 原型上的 init 方法，通过执行 initMixin(Vue) 函数后，_init 会挂载到 vue 的原型 prototype 上的。

```typescript
// core/instance/init.js
export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
      //...中间代码省略，待执行时进行说明
  }
}
```

### stateMixin

- 实例 property
  - [vm.$data](https://cn.vuejs.org/v2/api/#vm-data)
  - [vm.$props](https://cn.vuejs.org/v2/api/#vm-props)

- 实例方法 / 数据
  - [vm.$watch](https://cn.vuejs.org/v2/api/#vm-watch)
  - [vm.$set](https://cn.vuejs.org/v2/api/#vm-set)
  - [vm.$delete](https://cn.vuejs.org/v2/api/#vm-delete)

stateMixin 方法会定义跟数据相关的属性方法，例如代理数据的访问，我们可以在实例上通过 this.$data 和 this.$props 访问到 data,props 的值，并且也定义了使用频率较高的 vm.$set,vm.$delte ,vm.$watch等方法，针对这三个方法内部源码及实现方式是怎么样的，这次暂且不提，等理解数据响应式的原理后再重新学习。

this.$data 和 this.$props 在vm实例属性上可以看出需要点击才能显示值，从源码中可以看出这两个属性的功能是通过 Object.defineProperty 代理了 _data, _props的访问 

![vue-init-2.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/166b5ed11d4446a89a64375c705998d5~tplv-k3u1fbpfcp-watermark.image?)

```js
// core/instance/state.js
export function stateMixin (Vue: Class<Component>) {

  const dataDef = {}
  dataDef.get = function () { return this._data }
  const propsDef = {}
  propsDef.get = function () { return this._props }
  // 代理了_data,_props的访问  
  Object.defineProperty(Vue.prototype, '$data', dataDef)
  Object.defineProperty(Vue.prototype, '$props', propsDef)

  Vue.prototype.$set = set
  Vue.prototype.$delete = del

  Vue.prototype.$watch = function (
    expOrFn: string | Function,
    cb: any,
    options?: Object
  ): Function {
    const vm: Component = this
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {}
    options.user = true
    const watcher = new Watcher(vm, expOrFn, cb, options)
    if (options.immediate) {
      try {
        cb.call(vm, watcher.value)
      } catch (error) {
        handleError(error, vm, `callback for immediate watcher "${watcher.expression}"`)
      }
    }
    return function unwatchFn () {
      watcher.teardown()
    }
  }
}
```

### eventsMixin

- 实例方法 / 事件
  - [vm.$on](https://cn.vuejs.org/v2/api/#vm-on)
  - [vm.$once](https://cn.vuejs.org/v2/api/#vm-once)
  - [vm.$off](https://cn.vuejs.org/v2/api/#vm-off)
  - [vm.$emit](https://cn.vuejs.org/v2/api/#vm-emit)

eventsMixin 会对原型上的事件相关方法如 vm.$on,vm.$once,vm.$off,vm.$emit 进行定义

```js
// core/instance/events.js
export function eventsMixin (Vue: Class<Component>) {
    Vue.prototype.$on = function (event: string | Array<string>, fn: Function): Component {}
    Vue.prototype.$once = function (event: string, fn: Function): Component {}
    Vue.prototype.$off = function (event?: string | Array<string>, fn?: Function): Component {}
    Vue.prototype.$emit = function (event: string): Component {}
}
```

### lifecycleMixin 和 renderMixin

- 实例方法 / 生命周期
  - [vm.$forceUpdate](https://cn.vuejs.org/v2/api/#vm-forceUpdate)
  - [vm.$nextTick](https://cn.vuejs.org/v2/api/#vm-nextTick)
  - [vm.$destroy](https://cn.vuejs.org/v2/api/#vm-destroy)

lifecycleMixin,renderMixin 两个都可以算是对生命周期渲染方法的定义，例如 $forceUpdate 触发实例的强制刷新， $nextTick 将回调延迟到下次 DOM 更新循环之后执行等

```js
// core/instance/lifecycle.js
export function lifecycleMixin (Vue: Class<Component>) {
    Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {}
    Vue.prototype.$forceUpdate = function () {}
    Vue.prototype.$destroy = function () {}
}
// core/instance/render.js
export function renderMixin (Vue: Class<Component>) {
    Vue.prototype.$nextTick = function (fn: Function) {}
    Vue.prototype._render = function (): VNode {}
}
```

总结：引入 Vue 后，Vue 内部的执行顺序：会先进行原型实例方法的定义，接着再定义全局 API 

![vue-init-4.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/154e05724ff044778079e7865b8a1666~tplv-k3u1fbpfcp-watermark.image?)

## 初始化过程

```js
const vm = new Vue({
  data: {
    name: 'zhangsan',
  }
}).$mount("#app");

console.log(vm)
```

通过 new 关键字得到一个实例对象 vm，其值如下：

![vue-init-1.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ab208e9d6ddc4bbe8a07677fe8241b3c~tplv-k3u1fbpfcp-watermark.image?)

已 $ 开头是给用户使用的属性和方法，已 _ 开头则是 vue 内部使用的，不是以上两种开头则是  data 或者 computed 定义的数据。本文这些属性和方法都是在什么创建，通过追寻以上属性的创建初步窥探 vue 初始化过程中都发生了什么。

```js
// core/instance/init.js
let uid = 0
export function initMixin (Vue: Class<Component>) {
    Vue.prototype._init = function (options?: Object) {
      const vm: Component = this;
      vm._uid = uid++;
      // a flag to avoid this being observed
      vm._isVue = true
      // merge options
      if (options && options._isComponent) {
        // optimize internal component instantiation
        // since dynamic options merging is pretty slow, and none of the
        // internal component options needs special treatment.
        initInternalComponent(vm, options)
      } else {
        vm.$options = mergeOptions(
          resolveConstructorOptions(vm.constructor),
          options || {},
          vm
        )
     }
    vm._renderProxy = vm
    vm._self = vm
    initLifecycle(vm) 
    initEvents(vm)  
    initRender(vm)  
    callHook(vm, 'beforeCreate')
    initInjections(vm) 
    initState(vm)  
    initProvide(vm) 
    callHook(vm, 'created')
  }
  if (vm.$options.el) {
      vm.$mount(vm.$options.el)
  }
}
```

在执行 _init 函数时，在实例对象上会添加如下属性 ` _uid, _isVue, _self, _renderProxy `

```js
/** 
 *	_uid 用来记录 Vue 构造函数调用的次数，组件在初始化的时候同样会调用 _init 方法，从这个参数可以得到目前共创建了多少的组件
 */
// core/instance/init.js
vm._uid = uid++;
// core/global-api/extend.js
Vue.extend = function (extendOptions) {
	//...
  var Sub = function VueComponent (options) {
    this._init(options);
  };

	//...
  return Sub
};
```

```js
/**
 * _isVue 用来标记该对象是否是vue，如果是 vue 那么不进行数据响应化
 */
// a flag to avoid this being observed
vm._isVue = true

/**
 * _self 用来暴露 vm 实例，拿到其属性和方法
 */
// expose real self
vm._self = vm
```

### beforeCreate前

- 实例 property
  - [vm.$options](https://cn.vuejs.org/v2/api/#vm-options)

> vm.$options 用于当前 Vue 实例的初始化选项。需要在选项中包含自定义 property 时会有用处

```js
// core/instance/init.js

// 选项合并，将合并后的选项赋值给实例的$options属性
vm.$options = mergeOptions(
    resolveConstructorOptions(vm.constructor),// 返回Vue构造函数自身的配置项
    options || {},
    vm
)
```

#### initLifecycle

- 实例 property
  - [vm.$parent](https://cn.vuejs.org/v2/api/#vm-parent)
  - [vm.$root](https://cn.vuejs.org/v2/api/#vm-root)
  - [vm.$children](https://cn.vuejs.org/v2/api/#vm-children)
  - [vm.$refs](https://cn.vuejs.org/v2/api/#vm-refs)

```js
// core/instance/lifecycle.js
export function initLifecycle (vm: Component) {
  const options = vm.$options

  // locate first non-abstract parent
  let parent = options.parent
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    parent.$children.push(vm)
  }

  vm.$parent = parent
  vm.$root = parent ? parent.$root : vm

  vm.$children = []
  vm.$refs = {}

  vm._watcher = null
  vm._inactive = null
  vm._directInactive = false
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}
```

#### initEvents

对父组件传入事件添加监听

```js
// core/instance/events.js
export function initEvents (vm: Component) {
  vm._events = Object.create(null)
  vm._hasHookEvent = false
  // init parent attached events
  const listeners = vm.$options._parentListeners
  if (listeners) {
    updateComponentListeners(vm, listeners)
  }
}
```

#### initRender

- 实例 property
  - [vm.$slots](https://cn.vuejs.org/v2/api/#vm-slots)
  - [vm.$scopedSlots](https://cn.vuejs.org/v2/api/#vm-scopedSlots)

```js
// core/instance/render.js
export function initRender (vm: Component) {
  vm._vnode = null // the root of the child tree
  vm._staticTrees = null // v-once cached trees
  const options = vm.$options
  const parentVnode = vm.$vnode = options._parentVnode // the placeholder node in parent tree
  const renderContext = parentVnode && parentVnode.context
  vm.$slots = resolveSlots(options._renderChildren, renderContext)
  vm.$scopedSlots = emptyObject

  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)

  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)

  const parentData = parentVnode && parentVnode.data

  /* istanbul ignore else */
  if (process.env.NODE_ENV !== 'production') {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$attrs is readonly.`, vm)
    }, true)
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$listeners is readonly.`, vm)
    }, true)
  } else {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true)
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true)
  }
}
```

### created前

#### initInjections

获取注入数据并做响应化

```js
// core/instance/inject.js
export function initInjections (vm: Component) {
  const result = resolveInject(vm.$options.inject, vm)
  if (result) {
    toggleObserving(false)
    Object.keys(result).forEach(key => {
      /* istanbul ignore else */
      if (process.env.NODE_ENV !== 'production') {
        defineReactive(vm, key, result[key], () => {
          warn(
            `Avoid mutating an injected value directly since the changes will be ` +
            `overwritten whenever the provided component re-renders. ` +
            `injection being mutated: "${key}"`,
            vm
          )
        })
      } else {
        defineReactive(vm, key, result[key])
      }
    })
    toggleObserving(true)
  }
}
```

#### initState

初始化 props,methods,data,computed,watch

```js
// core/instance/state.js
export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```

#### initProvide

注入数据处理

```js
// core/instance/inject.js
export function initProvide (vm: Component) {
  const provide = vm.$options.provide
  if (provide) {
    vm._provided = typeof provide === 'function'
      ? provide.call(vm)
      : provide
  }
}
```

## 挂载过程

挂载过程主要分为两部

1.  将真实 DOM （template） 转化为 render 函数
2. render 函数通过 patch 算法，将 render 函数及 vue 内涉及到的插值及指令转变为真实 DOM

### template 转为 render 函数

当调用 `vm.$mount(el)` 方法时，因为使用的是带有编译器版本的 vue，vue 对于 `$mount` 原型方法有重写（之前的方法保存为 mount  函数，在 ` $mount` 内部进行调用），功能是通过 `compileToFunctions` 函数得到 render 函数。在得到 render 函数前，会先通过 `parse` 函数将 DOM 转变为抽象语法树 ast，然后通过 `generate` 函数将 ast 转变为 render 函数。 

![vue-init-5.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2f7670a89c40496bb8013f613c57564f~tplv-k3u1fbpfcp-watermark.image?)

`Vue.prototype.$mount` 方法：得到 render 函数，并调用 mount 函数

```js
// platforms/web/compiler/index.js
const { compile, compileToFunctions } = createCompiler(baseOptions);
export { compile, compileToFunctions }

// platforms/web/entry-runtime-with-compiler.js
import { compileToFunctions } from './compiler/index'
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el)

  const options = this.$options
  // resolve template/el and convert to render function
  if (!options.render) {
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') { //! template:#app
          template = idToTemplate(template)
        }
      } else if (template.nodeType) { //!元素节点
        template = template.innerHTML
      } else {
        return this
      }
    } else if (el) {
      template = getOuterHTML(el)
    }
    if (template) {
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns
    }
  }
  return mount.call(this, el, hydrating)
}
```

`createCompiler` 函数：调用 parse 函数得到 抽象语法树 ast ，ast 通过 generate 函数得到 render 函数

```js
// compiler/index
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    optimize(ast, options)
  }
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
```

### mountComponent

mount 方法通过 call 绑定 this为 Vue， 并调用 `mountComponent` 方法。`mountComponent` 会先调用 `beforeMount` 钩子，然后定义 `updateComponent `方法（调用 patch 算法，该方法会在 `new Watcher` 中调用 get 方法执行 `updateComponent ` 方法），创建 `watcher` ，最后调用 `mounted` 方法。

`updateComponent `方法会调用原型方法 `_render` 将 render 函数转化为虚拟节点 vNode，调用原型方法 `_update` 方法执行 patch 算法得到真实 DOM 并挂载到页面。

![vue-init-6.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4b30eef496644569b1ec4e878116657d~tplv-k3u1fbpfcp-watermark.image?)

```js
// platforms/web/entry-runtime-with-compiler.js
import { compileToFunctions } from './compiler/index'
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el)
    //...
  return mount.call(this, el, hydrating)
}

// platforms/web/runtime/index.js
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
```

mountComponent 方法：先调用 beforeMount 钩子，定义 updateComponent ，创建 watcher ，最后调用 mounted 钩子

```js
// core/instance/lifecycle.js
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode
  }
  callHook(vm, 'beforeMount')

  let updateComponent
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    updateComponent = () => {
      const name = vm._name
      const id = vm._uid
      const vnode = vm._render()
      vm._update(vnode, hydrating)
    }
  } else {
    updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }
  }

  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  hydrating = false

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}
```

Watcher  类，梳理初始化流程中重点关注 `get` 方法，因为 `get` 方法在初始化过程中会调用 `updateComponent` 方法

```js
// core/observer/watcher.js
export default class Watcher {
    //...
  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean
  ) {
        //...
    // parse expression for getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = noop
      }
    }
    this.value = this.lazy
      ? undefined
      : this.get()        
    }  
  get () {
    pushTarget(this)
    let value
    const vm = this.vm

    value = this.getter.call(vm, vm) 
      // this.getter = expOrFn = updateComponent = ()=>{vm._update(vm._render(), hydrating)}

      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value)
      }
      popTarget()
      this.cleanupDeps()

    return value
  }    
}
```

原型方法 `_render` 执行得到 vNode， `_update`  方法执行调用 patch 算法

```js

// core/instance/render.js
// vm._render() = Vue.prototype._render()
export function renderMixin (Vue: Class<Component>) {
    Vue.prototype._render = function (): VNode {}
}

// core/instance/lifecycle.js
// vm._update = Vue.prototype._update
export function lifecycleMixin (Vue: Class<Component>) {
  Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    const vm: Component = this
    const prevEl = vm.$el
    const prevVnode = vm._vnode
    const restoreActiveInstance = setActiveInstance(vm)
    vm._vnode = vnode
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode)
    }
    restoreActiveInstance()
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el
    }
    // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.
  }
}
```

