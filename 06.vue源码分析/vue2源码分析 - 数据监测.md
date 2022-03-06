# vue源码入门系列二 - 数据响应式

[vue源码入门系列一 - vue的初始化](https://juejin.cn/post/7036996683187617823)

vue源码入门系列二 - 数据响应式

## 数据变化监听

> 当你把一个普通的 JavaScript 对象传入 Vue 实例作为 `data` 选项，Vue 将遍历此对象所有的 property，并使用 [`Object.defineProperty`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 把这些 property 全部转为 [getter/setter](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Working_with_Objects#定义_getters_与_setters)。

以上是官网关于 vue 响应式实现原理的说明，对 data 中的数据响应化时，同时还包括了如下操作

1. data 数据响应化，能直接从 vue 实例上访问 data 内的数据

```js
const vm = new Vue({data:{name:'zhangsan',obj:{a:1}}});
vm.name // 或者 this.a
```

2. 当 data 内某个数据的值修改后，其值也是响应式的，如果值为对象会进行深度监听
3. data 作为 _data 属性挂载到实例对象上，值为 `{__ob__ : Observer}` 保存的是 data 的 observer 实例

![vue-initState-1](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e8bcbe2018b14de1bbf7c623e1d291a6~tplv-k3u1fbpfcp-watermark.image?)

### 对象的监听

**利用 `Object.defineProperty` 添加 getter 和 setter 实现数据监听**

```js
function defineReactive(obj,key){
    let val = obj[key];
    Object.defineProperty(obj,key,{
        enumerable: true,
        configurable: true,
        get(){
            console.log(`${obj}中的${key}被调用,值为${console.dir(val)}`);
            return val;
        },
        set(newVal){
            console.log(`${obj}中的${key}被修改为${newVal}`);
            val = newVal;
        }
    })
};

const obj = {name:'zhangsan'};
defineReactive(obj,'name');
```

![vue-initState-2](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a2b367e22c204648b8e7688f08374ea9~tplv-k3u1fbpfcp-watermark.image?)

**深度监听对象内的所有属性**

对象的深度监听递归是一种思路，通过源码分析，通过函数的循环调用同样可以实现。

```js
function defineReactive(obj,key){
    let val = obj[key];
    Object.defineProperty(obj,key,{
        enumerable: true,
        configurable: true,
        get(){
            console.log(`${obj}中的${key}被调用,值为${console.dir(val)}`);
            return val;
        },
        set(newVal){
            console.log(`${obj}中的${key}被修改为${newVal}`);
            val = newVal;
        }
    })
    // 深度监听
    observe(val)
}
// walk 函数实现对象内所有属性进行响应化处理
function walk(obj){
    const keys = Object.keys(obj);
    for(let i=0;i<keys.length;i++){
        defineReactive(obj,keys[i]);
    }
};

// observe 函数实现数据监听
function observe(data){
    // 如果监听的数据不是对象，则不在进行数据响应化
    if(typeof data !== 'object') return;
    walk(data);
};

const data = {name:'zhangsan',obj:{a:1,b:{c:2}}};
observe(data);
```

![vue-initState-3](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a2ab240293e747838b05eac3000818b4~tplv-k3u1fbpfcp-watermark.image?)

**data 中数据修改为对象后，仍能实现数据监听，实现响应式**

```js
function defineReactive(obj,key){
    let val = obj[key];
    Object.defineProperty(obj,key,{
        enumerable: true,
        configurable: true,
        get(){
            console.log(`${obj}中的${key}被调用,值为${console.dir(val)}`);
            return val;
        },
        set(newVal){
            console.log(`${obj}中的${key}被修改为${newVal}`);
            val = newVal;
            // 对新值实现数据监听
            observe(newVal);
        }
    })
    observe(val)
};

function walk(obj){
    const keys = Object.keys(obj);
    for(let i=0;i<keys.length;i++){
        defineReactive(obj,keys[i]);
    }
};

function observe(data){
    if(typeof data !== 'object') return;
    walk(data);
};

const data = {name:'zhangsan',obj:{a:1,b:{c:2}}};
observe(data);
```

![vue-initState-4](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7fe2dd1f198e41ad825ac79a82a20cf6~tplv-k3u1fbpfcp-watermark.image?)

**Vue 实例代理访问 data 中的数据**

从源码中可以知道对数据进行响应式处理的处理要经过如下函数的执行调用

`new Vue  → this._init (来自 initMixin) → initState → initData → observe  `

接下来我们会构建一个简易的 MVue 构造函数来代替 Vue，实现上述的调用过程，实例对象直接能访问 data 中的数据就在 initData 中通过代理的方式实现。
实例对象的代理实现方面还是挺巧妙的，先将需要访问的 data 数据保存在实例对象的 _data 属性上，通过 proxy 函数进行代理，当访问实例对象上的属性时，其实是访问 _data 的数据，而 _data 数据来自 data，具体实现可以看下面的示意图

![vue-initState-5](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4371cb26261e45d2989cbccbb4960fe8~tplv-k3u1fbpfcp-watermark.image?)

```js
function proxy(target,sourceKey,key,enumerable){
    Object.defineProperty(target,key,{
        enumerable: !!enumerable,
        configurable: true, 
        get(){
            return this[sourceKey][key];
        },
        set(newVal){
            this[sourceKey][key] = newVal;
        }
    });
}

function initData(vm){
    let data = vm.$options.data;
    data = vm._data = data;
    const keys = Object.keys(data);
    let i = keys.length;
    while(i--){
        let key = keys[i];
        // 数据代理
        // 给实例对象设置代理，能从 data 中访问数据,
        // eg: vm.key = vm._data.key = data.key
        proxy(vm,"_data",key);
    }
    // 数据监听
    observe(data);
}

// initState 函数初始化数据，实现数据响应式动作，数据包括传入的 data， props ， computed ，watch ， methods
// 因为目前只研究 data 的响应式过程，所以仅执行 initData 函数
function initState(vm){
    initData(vm);
}

// initMixin 函数在原型上挂载 _init 方法
function initMixin(Vue){
    Vue.prototype._init = function(options){
        const vm = this;
        vm.$options = options;
        initState(vm)
    }
}

function MVue(options){
    this._init(options)
};
initMixin(MVue);

const data = {name:'zhangsan',obj:{a:1,b:{c:2}}};
const mvm = new MVue({data});
```

### 数组的监听

vue 对于数组的监听是通过重写 7 个数组方法来达成的，实现思路是先通过保存数组的原型对象，重写 7 个数组方法，在内部调用刚才保存的原型对象上的方法返回值，同时监听数组的变化。

实现方式简化为如下代码：

```js
// 通过 Object.defineProperty 定义对象
function def(obj, key, value, enumerable) {
    Object.defineProperty(obj, key, {
        enumerable: !!enumerable,
        configurable: true,
        writable: true,
        value
    })
}

// 保存 Array 的原型对象，以此为原型链创建新的对象,该对象的原型链又重新指向了 Array 的原型对象
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);

// 定义需要重写的数组方法
const methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
];
methodsToPatch.forEach(method => {
    def(arrayMethods, method, function(...args) {
        const result = arrayProto[method].apply(this, args);
        // 有三种方法push\unshift\splice能够插入新项，现在要把插入的新项也要变为observe的
        let inserted;

        switch (methodName) {
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                // splice格式是splice(下标, 数量, 插入的新项)
                inserted = args.slice(2);
                break;
        }

        // 判断有没有要插入的新项，让新项也变为响应的
        if (inserted) {
            observeArray(inserted);
        }
        return result;
    })
})

function observeArray(arr) {
    for (let i = 0; i < arr.length; i++) {
        observe(arr[i])
    }
};

function observe(data) {
    if (typeof data !== 'object') return;
    if (Array.isArray(data)) {
        //重新定义7种数组原型方法
        data.__proto__ = arrayMethods;
        //对 arr 里的数据进行监听
        observeArray(data)
    } else {
        walk(data);
    }
};
```

### Observer 类

Vue 源码中对象的监听功能都整合在 Observer 类中，通过 observe 函数实例化一个 ob 对象，挂载到被监听的对象上。

Observer 类（观察者）是给对象的属性添加 getter 和 setter，进行依赖收集和派发更新。

```js
// 判断对象上是否包含某一属性
function hasOwn(obj, props) {
    return Object.hasOwnProperty(obj, props);
}
// 判断给定的数据是否未对象
function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}
// 对数据进行监听
function observe(data) {
    // 如果不是对象不进行监听
    if (!isObject(data)) return;
    let ob;
    // 判断监听的对象属性是否含有 '__ob__' 标志，如果有直接返回，没有则进行实例化一个 'ob'对象
    if (hasOwn(data, '__ob__') && data.__ob__ instanceof Observer) {
        ob = data.__ob__
    } else {
        ob = new Observer(data);
    }
    return ob;
}
// Observer 类给对象的属性添加 getter 和 setter
class Observer {
    constructor(value) {
        this.value = value;
        // 给数据贴上 __ob__ 属性，值为 Observer 实例，如果有 __ob__ 属性，则不再 observe
        // 这边有个细节，"__ob__" enumerable 需要设置为 false，防止遍历 __ob__ 里面的属性进行响应化操作导致死循环
        def(value, '__ob__', this)
        if (Array.isArray(value)) {
            // 重构7个数组方法
            value.__proto__ = arrayProto;
            this.observeArray(value);
        } else {
            this.walk(value);
        }
    }
    observeArray(arr) {
        for (let i = 0; i < arr.length; i++) {
            observe(arr[i])
        }
    };
    walk(obj) {
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            defineReactive(obj, keys[i]);
        }
    };
}
```

整个数据变化监听可以通过如下思维导图进行理解：

![vue-initState-7](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b36a909afbfc44969d9dc402449c7d7a~tplv-k3u1fbpfcp-watermark.image?)

## 观察者模式

> **观察者模式**是一种行为设计模式， 允许你定义一种订阅机制， 可在对象事件发生时通知多个 “观察” 该对象的其他对象。

源码中 watcher 是订阅者（可以理解为 Watcher 实例就是一个依赖），每个 watcher 实例必须包括 update 方法。

mount 过程中执行 render 函数（template 模板字符串最终也会转变为 render 函数）调用 h 函数（封装好的 with 语句），此时会读取 h 函数（或模板）使用到的 key（键），触发 getter 实例化 Dep 依赖管理对象，调用 Dep 实例的 depend 方法将 watcher 添加到对应的 Dep 实例对象的 subs 数组中进行存储，这个过程就是依赖收集。

当改变对象属性值时，调用对应 Dep 实例对象的 notify 方法执行 subs 数组中的每个 watcher 对象的 updata 方法。

**data 中对象个数（包括自身）决定 observer 数量,  key 的个数决定 dep 数量，组件个数决定 watcher 数量。**

![vue-initState-6](https://cn.vuejs.org/images/data.png)

### 依赖管理 Dep

依赖管理`Dep`，类里有一个叫 `depend` 方法，该方法用于收集依赖项（也就是 data 中的属性的值为对象）；一个 `notify` 方法，该方法用于触发依赖项的执行，也就是说只要在之前使用 `dep` 方法收集的依赖项，当调用 `notfiy` 方法时会被触发执行。

静态属性 Dep.target , 存储 watcher 实例，同时用于判断是否需要收集依赖，当 Dep.target 被赋值时，说明该对象已经进行 watcher 的实例化，此时才能执行依赖收集。

```js
class Dep{
    constructor(){
        this.subs = [];
    },
    depend(){
        if(Dep.target){
            this.subs.push(Dep.target);
        }
    },
    notify(){
        const subs = this.subs;
        for (var i = 0; i < subs.length; i++) {
            subs[i].updata();
        }
    },
}
Dep.target = null;
```

### 依赖本身 Watcher

vue2 DOM 视图的更新的最小单元是组件，一个组件只有一个 watcher ，watcher 中记录着这个依赖监听的状态，以及如何更新操作的 update 方法。如果是组件，update 会执行 vm._update 调用 patch 算法做到仅更新改变的 DOM 元素，其他未改动的 DOM 元素进行复用。如果是调用的 $watch 方法，update 会执行用户传入的方法。

```js
let  uid_watcher = 0;
class Watcher {
    constructor(vm, expOrFn, cb) {
        this.id = uid_watcher++;
        this.vm = vm;
        this.getter = parsePath(expOrFn);
        this.cb = cb;
        // 用来触发依赖收集
        this.value = this.get();
    }
    get() {
        // 标记 Dep.target,能够进行依赖收集
        Dep.target = this;
        // 触发 getter 方法，进行依赖收集
        let value;
        const obj = this.vm;
        value = this.getter(obj);
        // 清除 Dep.target,防止进行依赖收集
        Dep.target = null;
        return value
    }
    update() {
        this.run();
    }
    run() {
        const value = this.getter(this.vm);

        if (value !== this.value || typeof value == 'object') {
            const oldValue = this.value;
            this.value = value;
            this.cb.call(this.target, value, oldValue);
        }
    }
}

// 组件
new Watcher(vm, updateComponent, noop, { before: () => {} }, true);
updateComponent = function () {
 vm._update(vm._render(), hydrating);
};
// $watch
var watcher = new Watcher(vm, expOrFn, cb, options)
Vue.prototype.$watch = function(expOrFn,cb){
    const vm = this;
    const watcher = new Watcher(vm,expOrFn,cb);
}
```

### 依赖收集与派发更新

依赖收集必须被 watcher 才能执行，vue2 中只会对组件实例进行 watcher，初始化过程中依赖收集是在 createElement（h 函数）调用时因访问对象触发 getter 而进行。除了初始化过程中会进行依赖收集外，当使用实例方法 vm.$watch 的时候也会进行。前者太复杂，先看看后者怎么实现。

```js
function defineReactive(obj, key) {
    let val = obj[key];
    let childOb = observe(val);
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get() {
            console.log(`${obj}中的${key}被调用,值为${val}`);
            if(Dep.target){
                // 依赖收集
                dep.depend();
                console.log('dep', dep);
                // 如果子属性是对象则接着收集依赖
                if(childOb){
                    childOb.dep.depend();
                }
            }
            return val;
        },
        set(newVal) {
            console.log(`${obj}中的${key}被修改为${newVal}`);
            // 判断数据更改前后是否一致，如果数据相等则不进行任何派发更新操作
            if (newVal === value || (newVal !== newVal && value !== value)) return
            val = newVal;
            observe(newVal);
            // 派发更新
            dep.notify();
        }
    })
};

function stateMixin(Vue){
    // 简化版 $watch 实现
    Vue.prototype.$watch = function(expOrFn,cb){
        const vm = this;
        const watcher = new Watcher(vm,expOrFn,cb);
    }
}

function MVue(options) {
    this._init(options)
};
initMixin(MVue);
stateMixin(MVue);
```

```js
// example
const data = {
    name: 'zhangsan',
    obj: {
        a: 1,
        b: {
            c: 2
        }
    },
    arr: [1, 2, 3]
};

const mvm = new MVue({
    data
});
```

```js
//依赖收集
mvm.$watch('name')
mvm.$watch('name')
mvm.$watch('obj.b.c')
```

![vue-initState-11](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6871699e58054a20b44b389c2d21111a~tplv-k3u1fbpfcp-watermark.image?)

![vue-initState-12](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/327b706b55f14b33b3adc8e481b218b2~tplv-k3u1fbpfcp-watermark.image?)

```js
// 派发更新
mvm.$watch('name',(newVal,val)=>{
	console.log('newVal, val', newVal, val)
})
```

![vue-initState-13](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ccc6177b90be4d48a41acc1b266100e5~tplv-k3u1fbpfcp-watermark.image?)

参考资料

[深入响应式原理](https://cn.vuejs.org/v2/guide/reactivity.html)

[Vue原理实现](https://vue-course-doc.vercel.app/)

[设计模式](https://refactoringguru.cn/design-patterns/observer)