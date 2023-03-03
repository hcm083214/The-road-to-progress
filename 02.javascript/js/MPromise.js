/* 
实现 resolve 和 reject
    难点：
    1. 同时执行resolve 和 reject 时，promise 状态取决于resolve 和 reject执行的先后顺序
*/
(function () {
    console.log('start')
    const p1 = new Promise((resolve, reject) => {
        console.log("doing")
        resolve(1)
        reject(2)
    })
    console.log('end', p1)

    class MPromise {
        static PENDINGSTATUS = 'pending'
        static FULFILLESSTATUS = 'fulfilled'
        static REJECTEDSTATUS = 'rejected'
        constructor(executor) {
            this.PromiseState = MPromise.PENDINGSTATUS;
            this.PromiseResult = null;
            // resolve 和 reject 执行时 this 的值为 window，需要绑定 this
            executor(this.resolve.bind(this), this.reject.bind(this))
        }
        resolve(res) {
            // 通过if 判断状态，实现无法再次修改 promise 的状态
            if (this.PromiseState === MPromise.PENDINGSTATUS) {
                this.PromiseResult = res;
                this.PromiseState = MPromise.FULFILLESSTATUS;
            }
        }
        reject(err) {
            if (this.PromiseState === MPromise.PENDINGSTATUS) {
                this.PromiseResult = err;
                this.PromiseState = MPromise.REJECTEDSTATUS;
            }
        }
    }

    console.log('start')
    const p2 = new MPromise((resolve, reject) => {
        console.log("doing")
        resolve(1)
        reject(2)
    })
    console.log('end', p2)
});

/* 
then 的实现
    1. 异步执行
    2. 构造函数的参数 executor 执行时调用 resolve ，then 执行 onFulfilled
    3. 构造函数的参数 executor 执行时调用 reject ，then 执行 onRejected
*/
(function () {

    // console.log('start');
    // const p1 = new Promise((resolve, reject) => {
    //     resolve(1)
    // }).then(res => {
    //     console.log('p1->then', res)
    // })

    // const p2 = new Promise((resolve, reject) => {
    //     reject(2)
    // }).then(res => { }, err => {
    //     console.log('p2->then', err)
    // })

    // console.log('end')

    class MPromise {
        static PENDINGSTATUS = 'pending'
        static FULFILLESSTATUS = 'fulfilled'
        static REJECTEDSTATUS = 'rejected'
        constructor(executor) {
            this.PromiseState = MPromise.PENDINGSTATUS;
            this.PromiseResult = null;
            // +++ 以下代码块为新增
            // 存放then 函数中需要执行的 onFulfilled, onRejected 回调函数
            this.resolvedQueue = [];
            this.rejectedQueue = [];
            // +++
            // resolve 和 reject 执行时 this 的值为 window，需要绑定 this
            executor(this.resolve.bind(this), this.reject.bind(this));
        }
        resolve(res) {
            // 通过if 判断状态，实现无法再次修改 promise 的状态
            // +++ 以下代码块为新增
            if (this.PromiseState === MPromise.PENDINGSTATUS) {
                // 异步执行 resolvedQueue 队列中保存的 onFulfilled 函数
                const fn = () => {
                    this.PromiseResult = res;
                    this.PromiseState = MPromise.FULFILLESSTATUS;
                    this.resolvedQueue.length && this.resolvedQueue.forEach(cb => cb(res))
                }
                // 开启微队列
                resultHandlerAsync(fn)
            }
            // +++
        }
        reject(err) {
            if (this.PromiseState === MPromise.PENDINGSTATUS) {
                // +++ 以下代码块为新增
                // 异步执行 rejectedQueue 队列中保存的 onRejected 函数

                const fn = () => {
                    this.PromiseResult = err;
                    this.PromiseState = MPromise.REJECTEDSTATUS;
                    this.rejectedQueue.length && this.rejectedQueue.forEach(cb => cb(err))
                }
                // 开启微队列
                resultHandlerAsync(fn)
                // +++
            }
        }
        // +++ 以下代码块为新增
        then(onFulfilled, onRejected) {
            // then 函数用来注册回调函数，将要执行的 onFulfilled, onRejected 回调函数加入到队列中
            if (this.PromiseState === MPromise.PENDINGSTATUS) {
                this.resolvedQueue.push(onFulfilled)
                this.rejectedQueue.push(onRejected)
            }
        }
        // +++

    }

    // +++ 以下代码块为新增
    function resultHandlerAsync(cb) {
        console.log("🚀 ~ file: MPromise.js ~ line 127 ~ resultHandlerAsync ~ cb", cb)
        // 此函数会开启一个微任务，cb 放入到微任务中执行
        const observer = new MutationObserver(cb);
        observer.observe(document.body, { attributes: true });
        document.body.className = `${Math.random()}`;
    }
    // +++

    // 测试
    console.log('start')
    const p3 = new MPromise((resolve, reject) => {
        resolve(1)
    }).then(res => {
        console.log('p3->then', res)
    })

    const p4 = new MPromise((resolve, reject) => {
        reject(2)
    }).then(res => { }, err => {
        console.log('p4->then', err)
    })

    console.log('end')
});
/* 
    then 的链式调用
*/
(function () {

    // console.log('start')
    // new Promise(resolve => {
    //     resolve(1)
    // }).then(res => res + 1).then(res => { console.log("resolve(1) ~ then:return 1+1 ~ then: res", res) })

    // new Promise(resolve => {
    //     resolve(2)
    // }).then(res => { throw new Error(res + 1) }).then(res => { console.log(res) }, err => { console.log("resolve(2) ~ then:throw Err 2+1 ~ then: err", err) })

    // new Promise((resolve, reject) => {
    //     reject(3)
    // }).then(() => { }, err => err + 1).then(res => { console.log("reject(3) ~ then:return 3+1 ~ then: res", res) })

    // new Promise((resolve, reject) => {
    //     reject(4)
    // }).then(() => { },err => { throw new Error(err+1) }).then(res => { console.log(res) }, err => { console.log("reject(4) ~ then:throw Err 4+1 ~ then: err", err) })
    // console.log('end')

    class MPromise {
        static PENDINGSTATUS = 'pending'
        static FULFILLESSTATUS = 'fulfilled'
        static REJECTEDSTATUS = 'rejected'
        constructor(executor) {
            this.PromiseState = MPromise.PENDINGSTATUS;
            this.PromiseResult = null;
            // 存放then 函数中需要执行的 onFulfilled, onRejected 回调函数
            this.resolvedQueue = [];
            this.rejectedQueue = [];
            // resolve 和 reject 执行时 this 的值为 window，需要绑定 this
            executor(this.resolve.bind(this), this.reject.bind(this));
        }
        resolve(res) {
            // console.log('resolve')
            // +++ 以下代码有修改 
            if (this.PromiseState === MPromise.PENDINGSTATUS) {
                // 通过if 判断状态，实现无法再次修改 promise 的状态
                // 异步执行 resolvedQueue 队列中保存的 onFulfilled 函数
                // 开启微队列
                resultHandlerAsync(() => {
                    this.PromiseResult = res;
                    this.PromiseState = MPromise.FULFILLESSTATUS;
                    if (this.resolvedQueue.length) {
                        const cb = this.resolvedQueue.shift();
                        cb(res)
                    }
                })
            }
            // +++
        }
        reject(err) {
            if (this.PromiseState === MPromise.PENDINGSTATUS) {
                // 异步执行 rejectedQueue 队列中保存的 onRejected 函数
                const fn = () => {
                    this.PromiseResult = err;
                    this.PromiseState = MPromise.REJECTEDSTATUS;
                    if (this.rejectedQueue.length) {
                        const cb = this.rejectedQueue.shift();
                        cb(err)
                    }
                }
                // 开启微队列
                resultHandlerAsync(fn)
            }
        }
        then(onFulfilled, onRejected) {
            // then 函数用来注册回调函数，将要执行的 onFulfilled, onRejected 回调函数加入到队列中
            // +++ 以下代码有修改 
            return new MPromise((resolve, reject) => {
                if (this.PromiseState === MPromise.PENDINGSTATUS) {
                    // 改写目的：实现 onFulfilled 返回值，均会传递给下一次的 then 中 onFulfilled的参数
                    this.resolvedQueue.push((res) => {
                        try {
                            const result = onFulfilled(res);
                            resolve(result);
                        } catch (err) {
                            reject(err)
                        }

                    });
                    this.rejectedQueue.push((err) => {
                        try {
                            const result = onRejected(err);
                            resolve(result);
                        } catch (err) {
                            reject(err)
                        }
                    });
                }
            })
            // +++
        }
    }

    function resultHandlerAsync(cb) {
        // console.log('async')
        // 此函数会开启一个微任务，cb 放入到微任务中执行
        const observer = new MutationObserver(cb);
        observer.observe(document.body, { attributes: true });
        document.body.className = `${Math.random()}`;
    }

    console.log('start')
    debugger
    new MPromise(resolve => {
        resolve(1)
    })
        .then(res => res + 1)
        .then(res => { console.log("resolve(1) ~ then:return 1+1 ~ then: res", res) })

    new MPromise(resolve => {
        resolve(2)
    }).then(res => { throw new Error(res + 1) }).then(res => { console.log(res) }, err => { console.log("resolve(2) ~ then:throw Err 2+1 ~ then: err", err) })

    new MPromise((resolve, reject) => {
        reject(3)
    }).then(() => { }, err => err + 1).then(res => { console.log("reject(3) ~ then:return 3+1 ~ then: res", res) })

    new MPromise((resolve, reject) => {
        reject(4)
    }).then(() => { }, err => { throw new Error(err + 1) }).then(res => { console.log(res) }, err => { console.log("reject(4) ~ then:throw Err 4+1 ~ then: err", err) })
    console.log('end')
});
/* 
    then 参数非函数处理
*/
(function () {
    // 例子
    // 参数为 undefined
    new Promise((resolve, reject) => {
        resolve(1)
    }).then().then(res => { console.log("resolve(1) ~ undefined ~ then: res", res) })

    new Promise((resolve, reject) => {
        reject(2)
    }).then().then(undefined, err => { console.log("reject(2) ~ undefined ~ then: err", err) })

    // 参数返回 promise
    class MPromise {
        static PENDINGSTATUS = 'pending'
        static FULFILLESSTATUS = 'fulfilled'
        static REJECTEDSTATUS = 'rejected'
        constructor(executor) {
            this.PromiseState = MPromise.PENDINGSTATUS;
            this.PromiseResult = null;
            // 存放then 函数中需要执行的 onFulfilled, onRejected 回调函数
            this.resolvedQueue = [];
            this.rejectedQueue = [];
            // resolve 和 reject 执行时 this 的值为 window，需要绑定 this
            executor(this.resolve.bind(this), this.reject.bind(this));
        }
        resolve(res) {
            // console.log('resolve')
            if (this.PromiseState === MPromise.PENDINGSTATUS) {
                // 通过if 判断状态，实现无法再次修改 promise 的状态
                // 异步执行 resolvedQueue 队列中保存的 onFulfilled 函数
                // 开启微队列
                resultHandlerAsync(() => {
                    this.PromiseResult = res;
                    this.PromiseState = MPromise.FULFILLESSTATUS;
                    if (this.resolvedQueue.length) {
                        const cb = this.resolvedQueue.shift();
                        cb(res)
                    }
                })
            }
        }
        reject(err) {
            if (this.PromiseState === MPromise.PENDINGSTATUS) {
                // 异步执行 rejectedQueue 队列中保存的 onRejected 函数
                // 开启微队列
                resultHandlerAsync(() => {
                    this.PromiseResult = err;
                    this.PromiseState = MPromise.REJECTEDSTATUS;
                    if (this.rejectedQueue.length) {
                        const cb = this.rejectedQueue.shift();
                        cb(err)
                    }
                })
            }
        }
        then(onFulfilled, onRejected) {
            // then 函数用来注册回调函数，将要执行的 onFulfilled, onRejected 回调函数加入到队列中
            // +++ 以下代码有修改 
            //
            onFulfilled = (typeof onFulfilled === 'function') ? onFulfilled : res => res;
            onRejected = (typeof onRejected === 'function') ? onRejected : err => { throw err };
            // +++
            return new MPromise((resolve, reject) => {
                if (this.PromiseState === MPromise.PENDINGSTATUS) {
                    // 改写目的：实现 onFulfilled 返回值，均会传递给下一次的 then 中 onFulfilled的参数
                    this.resolvedQueue.push((res) => {
                        try {
                            const result = onFulfilled(res);
                            resolve(result);
                        } catch (err) {
                            reject(err)
                        }

                    });
                    this.rejectedQueue.push((err) => {
                        try {
                            const result = onRejected(err);
                            resolve(result);
                        } catch (err) {
                            reject(err)
                        }
                    });
                }
            })
        }
    }

    function resultHandlerAsync(cb) {
        // 此函数会开启一个微任务，cb 放入到微任务中执行
        const observer = new MutationObserver(cb);
        observer.observe(document.body, { attributes: true });
        document.body.className = `${Math.random()}`;
    }

    new MPromise((resolve, reject) => {
        resolve(1)
    }).then().then(res => { console.log("resolve(1) ~ undefined ~ then: res", res) })

    new MPromise((resolve, reject) => {
        reject(2)
    }).then().then(undefined, err => { console.log("reject(2) ~ undefined ~ then: err", err) })
});
/* 
    then 的参数 onFulfilled/onRejected 不同返回值处理
*/
(function () {
    // onFulfilled/onRejected 返回一个 promise 对象
    new Promise(resolve => {
        resolve(1)
    }).then(res => new Promise(resolve => resolve(11))).then(res => { console.log("resolve(1) ~ then:new Promise(resolve(11)) ~ then: res", res) })

    // onFulfilled/onRejected 返回一个 promise 对象值为 then 执行后的得到的对象
    const promise = new Promise((resolve, reject) => {
        resolve(2)
    })
    // const p1 = promise.then(value => {
    //     return p1
    // })
    // onFulfilled/onRejected 返回非 promise 的对象
    new Promise(resolve => {
        resolve(3)
    }).then(res => ({ a: 1 })).then(res => { console.log("resolve(3) ~ then:{a:1} ~ then: res", res) })
    // onFulfilled/onRejected 返回函数
    new Promise(resolve => {
        resolve(3)
    }).then(res => () => res + 1).then(res => { console.log("resolve(3) ~ then:() => res + 1 ~ then: res", res) })


    class MPromise {
        static PENDINGSTATUS = 'pending'
        static FULFILLESSTATUS = 'fulfilled'
        static REJECTEDSTATUS = 'rejected'
        constructor(executor) {
            this.PromiseState = MPromise.PENDINGSTATUS;
            this.PromiseResult = null;
            // 存放then 函数中需要执行的 onFulfilled, onRejected 回调函数
            this.resolvedQueue = [];
            this.rejectedQueue = [];
            // resolve 和 reject 执行时 this 的值为 window，需要绑定 this
            executor(this.resolve.bind(this), this.reject.bind(this));
        }
        resolve(res) {
            // console.log('resolve')
            if (this.PromiseState === MPromise.PENDINGSTATUS) {
                // 通过if 判断状态，实现无法再次修改 promise 的状态
                // 异步执行 resolvedQueue 队列中保存的 onFulfilled 函数
                // 开启微队列
                resultHandlerAsync(() => {
                    this.PromiseResult = res;
                    this.PromiseState = MPromise.FULFILLESSTATUS;
                    if (this.resolvedQueue.length) {
                        const cb = this.resolvedQueue.shift();
                        cb(res)
                    }
                })
            }
        }
        reject(err) {
            if (this.PromiseState === MPromise.PENDINGSTATUS) {
                // 异步执行 rejectedQueue 队列中保存的 onRejected 函数
                // 开启微队列
                resultHandlerAsync(() => {
                    this.PromiseResult = err;
                    this.PromiseState = MPromise.REJECTEDSTATUS;
                    if (this.rejectedQueue.length) {
                        const cb = this.rejectedQueue.shift();
                        cb(err)
                    }
                })
            }
        }
        then(onFulfilled, onRejected) {
            // then 函数用来注册回调函数，将要执行的 onFulfilled, onRejected 回调函数加入到队列中
            onFulfilled = (typeof onFulfilled === 'function') ? onFulfilled : res => res;
            onRejected = (typeof onRejected === 'function') ? onRejected : err => { throw err };
            const promise2 = new MPromise((resolve, reject) => {
                if (this.PromiseState === MPromise.PENDINGSTATUS) {
                    // 改写目的：实现 onFulfilled 返回值，均会传递给下一次的 then 中 onFulfilled的参数
                    this.resolvedQueue.push((res) => {
                        try {
                            const result = onFulfilled(res);
                            resolvePromise(promise2, result, resolve, reject);
                        } catch (err) {
                            reject(err)
                        }

                    });
                    this.rejectedQueue.push((err) => {
                        try {
                            const result = onRejected(err);
                            resolvePromise(promise2, result, resolve, reject);
                        } catch (err) {
                            reject(err)
                        }
                    });
                }
            })
            return promise2;
        }
    }

    function resultHandlerAsync(cb) {
        // 此函数会开启一个微任务，cb 放入到微任务中执行
        const observer = new MutationObserver(cb);
        observer.observe(document.body, { attributes: true });
        document.body.className = `${Math.random()}`;
    }

    /**
     * 对resolve()、reject() 进行改造增强 针对resolve()和reject()中不同值情况 进行处理
     * @param  {promise} promise2 promise1.then方法返回的新的promise对象
     * @param  {[type]} x         promise1中onFulfilled或onRejected的返回值
     * @param  {[type]} resolve   promise2的resolve方法
     * @param  {[type]} reject    promise2的reject方法
     */
    function resolvePromise(promise2, x, resolve, reject) {
        if (x === promise2) {
            return reject(new TypeError('Chaining cycle detected for promise'));
        }

        // 2.3.2 如果 x 为 Promise ，则使 promise2 接受 x 的状态
        if (x instanceof myPromise) {
            if (x.PromiseState === myPromise.PENDING) {
                /**
                 * 2.3.2.1 如果 x 处于等待态， promise 需保持为等待态直至 x 被执行或拒绝
                 *         注意"直至 x 被执行或拒绝"这句话，
                 *         这句话的意思是：x 被执行x，如果执行的时候拿到一个y，还要继续解析y
                 */
                x.then(y => {
                    resolvePromise(promise2, y, resolve, reject)
                }, reject);
            } else if (x.PromiseState === myPromise.FULFILLED) {
                // 2.3.2.2 如果 x 处于执行态，用相同的值执行 promise
                resolve(x.PromiseResult);
            } else if (x.PromiseState === myPromise.REJECTED) {
                // 2.3.2.3 如果 x 处于拒绝态，用相同的据因拒绝 promise
                reject(x.PromiseResult);
            }
        } else if (x !== null && ((typeof x === 'object' || (typeof x === 'function')))) {
            // 2.3.3 如果 x 为对象或函数
            try {
                // 2.3.3.1 把 x.then 赋值给 then
                var then = x.then;
            } catch (e) {
                // 2.3.3.2 如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise
                return reject(e);
            }
            /**
             * 2.3.3.3 
             * 如果 then 是函数，将 x 作为函数的作用域 this 调用之。
             * 传递两个回调函数作为参数，
             * 第一个参数叫做 `resolvePromise` ，第二个参数叫做 `rejectPromise`
             */
            if (typeof then === 'function') {
                // 2.3.3.3.3 如果 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
                let called = false; // 避免多次调用
                try {
                    then.call(
                        x,
                        // 2.3.3.3.1 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
                        y => {
                            if (called) return;
                            called = true;
                            resolvePromise(promise2, y, resolve, reject);
                        },
                        // 2.3.3.3.2 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
                        r => {
                            if (called) return;
                            called = true;
                            reject(r);
                        }
                    )
                } catch (e) {
                    /**
                     * 2.3.3.3.4 如果调用 then 方法抛出了异常 e
                     * 2.3.3.3.4.1 如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之
                     */
                    if (called) return;
                    called = true;

                    /**
                     * 2.3.3.3.4.2 否则以 e 为据因拒绝 promise
                     */
                    reject(e);
                }
            } else {
                // 2.3.3.4 如果 then 不是函数，以 x 为参数执行 promise
                resolve(x);
            }
        } else {
            // 2.3.4 如果 x 不为对象或者函数，以 x 为参数执行 promise
            return resolve(x);
        }
    }
    /* 
    作者：圆圆01
    链接：https://juejin.cn/post/7043758954496655397
    来源：稀土掘金
    著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
    */

    // onFulfilled/onRejected 返回一个 promise 对象
    new MPromise(resolve => {
        resolve(1)
    }).then(res => new Promise(resolve => resolve(11))).then(res => { console.log("resolve(1) ~ then:new Promise(resolve(11)) ~ then: res", res) })

    // onFulfilled/onRejected 返回一个 promise 对象值为 then 执行后的得到的对象
    const P = new Promise((resolve, reject) => {
        resolve(2)
    })
    // const p2 = P.then(value => {
    //     return p2
    // })
    // onFulfilled/onRejected 返回非 promise 的对象
    new MPromise(resolve => {
        resolve(3)
    }).then(res => ({ a: 1 })).then(res => { console.log("resolve(3) ~ then:{a:1} ~ then: res", res) })
    // onFulfilled/onRejected 返回函数
    new MPromise(resolve => {
        resolve(3)
    }).then(res => () => res + 1).then(res => { console.log("resolve(3) ~ then:() => res + 1 ~ then: res", res) })
});
/* 
    catch 和 finally 的实现 
*/
(function () {
    // 例子

    // new Promise((resolve, reject) => {
    //     reject(1)
    // }).catch(err => { console.log("reject(1) ~ then: err", err) })
    // new Promise((resolve, reject) => {
    //     reject(2)
    // }).catch().then(() => { }, err => { console.log("reject(2) ~ catch:undefined ~ then: err", err) })
    // new Promise((resolve, reject) => {
    //     reject(3)
    // }).catch(err => err + 1).finally((value) => { console.log("reject(3) ~ catch: err=>err+1 ~ finally:return 22", value); return 22 }).then(res => { console.log("reject(3) ~ catch: err=>err+1 ~ finally:return 22 ~ then: err", res) })

    // 参数返回 promise
    class MPromise {
        static PENDINGSTATUS = 'pending'
        static FULFILLESSTATUS = 'fulfilled'
        static REJECTEDSTATUS = 'rejected'
        constructor(executor) {
            this.PromiseState = MPromise.PENDINGSTATUS;
            this.PromiseResult = null;
            // 存放then 函数中需要执行的 onFulfilled, onRejected 回调函数
            this.resolvedQueue = [];
            this.rejectedQueue = [];
            // resolve 和 reject 执行时 this 的值为 window，需要绑定 this
            executor(this.resolve.bind(this), this.reject.bind(this));
        }
        resolve(res) {
            // console.log('resolve')
            if (this.PromiseState === MPromise.PENDINGSTATUS) {
                // 通过if 判断状态，实现无法再次修改 promise 的状态
                // 异步执行 resolvedQueue 队列中保存的 onFulfilled 函数
                // 开启微队列
                resultHandlerAsync(() => {
                    this.PromiseResult = res;
                    this.PromiseState = MPromise.FULFILLESSTATUS;
                    if (this.resolvedQueue.length) {
                        const cb = this.resolvedQueue.shift();
                        cb(res)
                    }
                })
            }
        }
        reject(err) {
            if (this.PromiseState === MPromise.PENDINGSTATUS) {
                // 异步执行 rejectedQueue 队列中保存的 onRejected 函数
                // 开启微队列
                resultHandlerAsync(() => {
                    this.PromiseResult = err;
                    this.PromiseState = MPromise.REJECTEDSTATUS;
                    if (this.rejectedQueue.length) {
                        const cb = this.rejectedQueue.shift();
                        cb(err)
                    }
                })
            }
        }
        then(onFulfilled, onRejected) {
            // then 函数用来注册回调函数，将要执行的 onFulfilled, onRejected 回调函数加入到队列中
            // +++ 以下代码有修改 
            //
            onFulfilled = (typeof onFulfilled === 'function') ? onFulfilled : res => res;
            onRejected = (typeof onRejected === 'function') ? onRejected : err => { throw err };
            // +++
            return new MPromise((resolve, reject) => {
                if (this.PromiseState === MPromise.PENDINGSTATUS) {
                    // 改写目的：实现 onFulfilled 返回值，均会传递给下一次的 then 中 onFulfilled的参数
                    this.resolvedQueue.push((res) => {
                        try {
                            const result = onFulfilled(res);
                            resolve(result);
                        } catch (err) {
                            reject(err)
                        }

                    });
                    this.rejectedQueue.push((err) => {
                        try {
                            const result = onRejected(err);
                            resolve(result);
                        } catch (err) {
                            reject(err)
                        }
                    });
                }
            })
        }
        catch(onRejected) {
            return this.then(undefined, onRejected)
        }
        finally(cb) {
            return new MPromise((resolve, reject) => {
                if (this.PromiseState === MPromise.PENDINGSTATUS) {
                    // 改写目的：实现 onFulfilled 返回值，均会传递给下一次的 then 中 onFulfilled的参数
                    this.resolvedQueue.push((res) => {
                        try {
                            cb()
                            resolve(res);
                        } catch (err) {
                            reject(err)
                        }
                    });
                    this.rejectedQueue.push((err) => {
                        try {
                            cb();
                            resolve(err);
                        } catch (err) {
                            reject(err)
                        }
                    });
                }

            })

        }
    }

    function resultHandlerAsync(cb) {
        // 此函数会开启一个微任务，cb 放入到微任务中执行
        const observer = new MutationObserver(cb);
        observer.observe(document.body, { attributes: true });
        document.body.className = `${Math.random()}`;
    }

    new MPromise((resolve, reject) => {
        reject(1)
    }).catch(err => { console.log("reject(1) ~ then: err", err) })
    new MPromise((resolve, reject) => {
        reject(2)
    }).catch().then(() => { }, err => { console.log("reject(2) ~ catch:undefined ~ then: err", err) })
    new MPromise((resolve, reject) => {
        reject(3)
    }).catch(err => err + 1).finally((value) => { console.log("reject(3) ~ catch: err=>err+1 ~ finally:return 22", value); return 22 }).then(res => { console.log("reject(3) ~ catch: err=>err+1 ~ finally:return 22 ~ then: err", res) })

});
/* 
    Promise.resolve Promise.reject 和 Promise.race  Promise.all的实现
*/
(function () {

    // Promise.resolve(1).then(res=>{console.log('Promise.resolve(1) ~ then:res',res)})
    // Promise.reject(2).catch(err=>{console.log('Promise.reject(2) ~ catch:err',err)})
    // const p1 = new Promise((resolve, reject) => {
    //     setTimeout(resolve, 500, 'one');
    // });

    // const p2 = new Promise((resolve, reject) => {
    //     setTimeout(resolve, 100, 'two');
    // });

    // const p3 = new Promise((resolve, reject) => {
    //     setTimeout(reject, 300, 'three');
    // });

    // Promise.race([p1, p2]).then((value) => {
    //     console.log('Promise.race', value);
    // });

    // Promise.all([p1, p2, p3]).then((value) => {
    //     console.log('Promise.all ~ then:res', value);
    // }).catch(err=>{console.log('Promise.all ~ catch:err', err)});

    // Promise.all([p1, p2]).then((value) => {
    //     console.log('Promise.all', value);
    // });

    class MPromise {
        static PENDINGSTATUS = 'pending'
        static FULFILLESSTATUS = 'fulfilled'
        static REJECTEDSTATUS = 'rejected'
        constructor(executor) {
            this.PromiseState = MPromise.PENDINGSTATUS;
            this.PromiseResult = null;
            // 存放then 函数中需要执行的 onFulfilled, onRejected 回调函数
            this.resolvedQueue = [];
            this.rejectedQueue = [];
            // resolve 和 reject 执行时 this 的值为 window，需要绑定 this
            executor(this.resolve.bind(this), this.reject.bind(this));
        }
        resolve(res) {
            // console.log('resolve')
            if (this.PromiseState === MPromise.PENDINGSTATUS) {
                // 通过if 判断状态，实现无法再次修改 promise 的状态
                // 异步执行 resolvedQueue 队列中保存的 onFulfilled 函数
                // 开启微队列
                resultHandlerAsync(() => {
                    this.PromiseResult = res;
                    this.PromiseState = MPromise.FULFILLESSTATUS;
                    if (this.resolvedQueue.length) {
                        const cb = this.resolvedQueue.shift();
                        cb(res)
                    }
                })
            }
        }
        reject(err) {
            if (this.PromiseState === MPromise.PENDINGSTATUS) {
                // 异步执行 rejectedQueue 队列中保存的 onRejected 函数
                // 开启微队列
                resultHandlerAsync(() => {
                    this.PromiseResult = err;
                    this.PromiseState = MPromise.REJECTEDSTATUS;
                    if (this.rejectedQueue.length) {
                        const cb = this.rejectedQueue.shift();
                        cb(err)
                    }
                })
            }
        }
        then(onFulfilled, onRejected) {
            // then 函数用来注册回调函数，将要执行的 onFulfilled, onRejected 回调函数加入到队列中
            onFulfilled = (typeof onFulfilled === 'function') ? onFulfilled : res => res;
            onRejected = (typeof onRejected === 'function') ? onRejected : err => { throw err };
            return new MPromise((resolve, reject) => {
                if (this.PromiseState === MPromise.PENDINGSTATUS) {
                    // 改写目的：实现 onFulfilled 返回值，均会传递给下一次的 then 中 onFulfilled的参数
                    this.resolvedQueue.push((res) => {
                        try {
                            const result = onFulfilled(res);
                            resolve(result);
                        } catch (err) {
                            reject(err)
                        }

                    });
                    this.rejectedQueue.push((err) => {
                        try {
                            const result = onRejected(err);
                            resolve(result);
                        } catch (err) {
                            reject(err)
                        }
                    });
                }
            })
        }
        catch(onRejected) {
            return this.then(undefined, onRejected)
        }
        finally(cb) {
            return new MPromise((resolve, reject) => {
                if (this.PromiseState === MPromise.PENDINGSTATUS) {
                    // 改写目的：实现 onFulfilled 返回值，均会传递给下一次的 then 中 onFulfilled的参数
                    this.resolvedQueue.push((res) => {
                        try {
                            cb()
                            resolve(res);
                        } catch (err) {
                            reject(err)
                        }
                    });
                    this.rejectedQueue.push((err) => {
                        try {
                            cb();
                            resolve(err);
                        } catch (err) {
                            reject(err)
                        }
                    });
                }
            })
        }
        static resolve(res) {
            return new MPromise(resolve => resolve(res))
        }
        static reject(res) {
            return new MPromise((resolve, reject) => reject(res))
        }
        static race(promiseList) {
            return new MPromise((resolve, reject) => {
                promiseList.forEach(p => p.then(res => resolve(res), err => reject(err)))
            })
        }
        static all(promiseList) {
            return new MPromise((resolve, reject) => {
                let promiseArr = [];
                promiseList.forEach(p => {
                    p.then(res => {
                        promiseArr.push(res)
                    }, err => {
                        throw new Error(err);
                        reject(err);
                    })
                })
                resolve(promiseArr);
            })
        }
    }

    function resultHandlerAsync(cb) {
        // 此函数会开启一个微任务，cb 放入到微任务中执行
        const observer = new MutationObserver(cb);
        observer.observe(document.body, { attributes: true });
        document.body.className = `${Math.random()}`;
    }

    MPromise.resolve(1).then(res => { console.log('Promise.resolve(1) ~ then:res', res) })
    MPromise.reject(2).catch(err => { console.log('Promise.reject(2) ~ catch:err', err) })
    const p1 = new MPromise((resolve, reject) => {
        setTimeout(resolve, 500, 'one');
    });

    const p2 = new MPromise((resolve, reject) => {
        setTimeout(resolve, 100, 'two');
    });

    const p3 = new MPromise((resolve, reject) => {
        setTimeout(reject, 300, 'three');
    });

    MPromise.race([p1, p2]).then((value) => {
        console.log('Promise.race', value);
    });

    Promise.all([p1, p2, p3]).then((value) => {
        console.log('Promise.all ~ then:res', value);
    }).catch(err => { console.log('Promise.all ~ catch:err', err) });

    MPromise.all([p1, p2]).then((value) => {
        console.log('Promise.all', value);
    });
})();

(function () {
    class MPromise {
        static PENDING = 'pending';
        static FULFILLED = 'fulfilled';
        static REJECTED = 'rejected';

        constructor(func) {
            this.PromiseState = MPromise.PENDING;
            this.PromiseResult = null;
            this.onFulfilledCallbacks = [];
            this.onRejectedCallbacks = [];
            try {
                func(this.resolve.bind(this), this.reject.bind(this));
            } catch (error) {
                this.reject(error)
            }
        }

        resolve(result) {
            console.log('resolve2')
            if (this.PromiseState === MPromise.PENDING) {
                setTimeout(() => {
                    this.PromiseState = MPromise.FULFILLED;
                    this.PromiseResult = result;
                    this.onFulfilledCallbacks.forEach(callback => {
                        callback(result)
                    })
                });
            }
        }

        reject(reason) {
            if (this.PromiseState === MPromise.PENDING) {
                setTimeout(() => {
                    this.PromiseState = MPromise.REJECTED;
                    this.PromiseResult = reason;
                    this.onRejectedCallbacks.forEach(callback => {
                        callback(reason)
                    })
                });
            }
        }

        then(onFulfilled, onRejected) {
            onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
            onRejected = typeof onRejected === 'function' ? onRejected : reason => {
                throw reason;
            };

            let promise2 = new MPromise((resolve, reject) => {
                if (this.PromiseState === MPromise.FULFILLED) {
                    setTimeout(() => {
                        try {
                            let x = onFulfilled(this.PromiseResult);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    });
                } else if (this.PromiseState === MPromise.REJECTED) {
                    setTimeout(() => {
                        try {
                            let x = onRejected(this.PromiseResult);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e)
                        }
                    });
                } else if (this.PromiseState === MPromise.PENDING) {
                    this.onFulfilledCallbacks.push(() => {
                        setTimeout(() => {
                            try {
                                let x = onFulfilled(this.PromiseResult);
                                resolvePromise(promise2, x, resolve, reject)
                            } catch (e) {
                                reject(e);
                            }
                        });
                    });
                    this.onRejectedCallbacks.push(() => {
                        setTimeout(() => {
                            try {
                                let x = onRejected(this.PromiseResult);
                                resolvePromise(promise2, x, resolve, reject);
                            } catch (e) {
                                reject(e);
                            }
                        });
                    });
                }
            })

            return promise2
        }
    }

    function resolvePromise(promise2, x, resolve, reject) {
        if (x === promise2) {
            return reject(new TypeError('Chaining cycle detected for promise'));
        }

        if (x instanceof MPromise) {
            if (x.PromiseState === MPromise.PENDING) {
                x.then(y => {
                    resolvePromise(promise2, y, resolve, reject)
                }, reject);
            } else if (x.PromiseState === MPromise.FULFILLED) {
                resolve(x.PromiseResult);
            } else if (x.PromiseState === MPromise.REJECTED) {
                reject(x.PromiseResult);
            }
        } else if (x !== null && ((typeof x === 'object' || (typeof x === 'function')))) {
            try {
                var then = x.then;
            } catch (e) {
                return reject(e);
            }

            if (typeof then === 'function') {
                let called = false;
                try {
                    then.call(
                        x,
                        y => {
                            if (called) return;
                            called = true;
                            resolvePromise(promise2, y, resolve, reject);
                        },
                        r => {
                            if (called) return;
                            called = true;
                            reject(r);
                        }
                    )
                } catch (e) {
                    if (called) return;
                    called = true;

                    reject(e);
                }
            } else {
                resolve(x);
            }
        } else {
            return resolve(x);
        }
    }
    console.log('start')
    new MPromise(resolve => {
        resolve(1)
    })
        .then(res => res + 1)
        .then(res => { console.log("resolve(1) ~ then:return 1+1 ~ then: res", res) })

    new MPromise(resolve => {
        resolve(2)
    }).then(res => { throw new Error(res + 1) }).then(res => { console.log(res) }, err => { console.log("resolve(2) ~ then:throw Err 2+1 ~ then: err", err) })

    new MPromise((resolve, reject) => {
        reject(3)
    }).then(() => { }, err => err + 1).then(res => { console.log("reject(3) ~ then:return 3+1 ~ then: res", res) })

    new MPromise((resolve, reject) => {
        reject(4)
    }).then(() => { }, err => { throw new Error(err + 1) }).then(res => { console.log(res) }, err => { console.log("reject(4) ~ then:throw Err 4+1 ~ then: err", err) })
    console.log('end')
});

(function () {
    console.log('start')
    function resultHandlerAsync(cb) {
        // console.log('async')
        // 此函数会开启一个微任务，cb 放入到微任务中执行
        const observer = new MutationObserver(cb);
        observer.observe(document.body, { attributes: true });
        document.body.className = `${Math.random()}`;
    }
    setTimeout(() => {
        console.log(21)
    })
    resultHandlerAsync(() => {
        console.log(11)
    })

    console.log('end')
});