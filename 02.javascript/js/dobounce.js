/* https://css-tricks.com/debouncing-throttling-explained-examples/ */
function ajax(e) {
    //用console.log模拟发射请求
    console.log(e.target.value);
}
function debounce(fn, wait, immediately = true) {
    // 防抖:只取一次，在一定时间内连续触发多次，只有一次有效,多次触发会清除掉之前需要执行的函数.
    // 按照函数执行的先后顺序可以分为立即执行和非立即执行
    let timer = null;
    return function (...args) {
        if (timer) clearTimeout(timer);
        if (immediately) {
            !timer && fn(...args);
            timer = setTimeout(() => {
                timer = null;
            }, wait)

        } else {
            timer = setTimeout(() => {
                fn(...args);
                timer = null;
            }, wait)
        }
    }
}
const _ajax = debounce(ajax, 500, false);
document.querySelector('input').addEventListener('input', _ajax);



function throttle(fn, wait, type = 'timestamp') {
    // 节流：到点执行，在规定时间内（例如 500ms），只执行一次，500ms 后再次执行（只在500ms执行，501ms都不行）
    // 有时间戳(timestamp)和定时器(timer)两种实现方式
    let flag = type === 'timestamp' ? 0 : null;
    return function (...args) {
        if (type === 'timestamp') {
            let nowTime = Date.now();
            if (nowTime - flag === wait) {
                flag = nowTime;
                fn(...args);
            }
        } else {
            !flag &&
                (flag = setTimeout(() => {
                    flag = null;
                    fn(...args);
                }), wait)
        }
    }
}
const _ajax2 = throttle(ajax, 500, 'timer');
window.addEventListener('scroll', _ajax2)



const _ = {}
_.debounce = function (func, wait, immediate) {
    var timeout, result;

    var later = function (context, args) {
        timeout = null;
        if (args) result = func.apply(context, args);
    };

    var debounced = restArgs(function (args) {
        if (timeout) clearTimeout(timeout);
        if (immediate) {
            var callNow = !timeout;
            timeout = setTimeout(later, wait);
            if (callNow) result = func.apply(this, args);
        } else {
            timeout = _.delay(later, wait, this, args);
        }

        return result;
    });

    debounced.cancel = function () {
        clearTimeout(timeout);
        timeout = null;
    };

    return debounced;
};
_.throttle = function (func, wait, options) {
    var timeout, context, args, result;
    var previous = 0;
    if (!options) options = {};

    var later = function () {
        previous = options.leading === false ? 0 : _.now();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null; //显示地释放内存，防止内存泄漏
    };

    var throttled = function () {
        var now = _.now();
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };

    throttled.cancel = function () {
        clearTimeout(timeout);
        previous = 0;
        timeout = context = args = null;
    };

    return throttled;
};

function isObject(value) {
    const type = typeof value
    return value != null && (type === 'object' || type === 'function')
}
function debounce(func, wait, options) {
    let lastArgs,
        lastThis,
        maxWait,
        result,
        timerId,
        lastCallTime

    let lastInvokeTime = 0
    let leading = false
    let maxing = false
    let trailing = true

    // Bypass `requestAnimationFrame` by explicitly setting `wait=0`.通过显式设置' wait=0 '绕过' requestAnimationFrame '。
    const useRAF = (!wait && wait !== 0 && typeof root.requestAnimationFrame === 'function')

    if (typeof func !== 'function') {
        throw new TypeError('Expected a function')
    }
    wait = +wait || 0
    if (isObject(options)) {
        leading = !!options.leading
        maxing = 'maxWait' in options
        maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait
        trailing = 'trailing' in options ? !!options.trailing : trailing
    }

    function invokeFunc(time) {
        const args = lastArgs
        const thisArg = lastThis

        lastArgs = lastThis = undefined
        lastInvokeTime = time
        result = func.apply(thisArg, args)
        return result
    }
    // 启动延时
    function startTimer(pendingFunc, wait) {
        if (useRAF) {
            root.cancelAnimationFrame(timerId)
            return root.requestAnimationFrame(pendingFunc)
        }
        return setTimeout(pendingFunc, wait)
    }

    function cancelTimer(id) {
        if (useRAF) {
            return root.cancelAnimationFrame(id)
        }
        clearTimeout(id)
    }

    function leadingEdge(time) {
        // Reset any `maxWait` timer.
        lastInvokeTime = time
        // Start the timer for the trailing edge.
        timerId = startTimer(timerExpired, wait)
        // Invoke the leading edge.
        return leading ? invokeFunc(time) : result
    }
    //计算剩余的延时时间：
    //1. 不存在maxWait：(上一次debouncedFunc调用后)延时不能超过wait
    //2. 存在maxWait：func调用不能被延时超过maxWait
    //根据这两种情况计算出最短时间
    function remainingWait(time) {
        const timeSinceLastCall = time - lastCallTime
        const timeSinceLastInvoke = time - lastInvokeTime
        const timeWaiting = wait - timeSinceLastCall

        return maxing
            ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
            : timeWaiting
    }

    //判断当前时间是否能调用func:
    //1.首次调用debouncedFunc
    //2.距离上一次debouncedFunc调用后已延迟wait毫秒
    //3.func调用总延迟达到maxWait毫秒
    //4.系统时间倒退
    function shouldInvoke(time) {
        const timeSinceLastCall = time - lastCallTime
        const timeSinceLastInvoke = time - lastInvokeTime

        return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
            (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait))
    }
    // 延时器回调
    function timerExpired() {
        const time = Date.now()
        // 如果满足时间条件，结束延时
        if (shouldInvoke(time)) {
            return trailingEdge(time)
        }
        // Restart the timer.没满足时间条件，计算剩余等待时间，继续延时
        timerId = startTimer(timerExpired, remainingWait(time))
    }
    //延时结束后
    function trailingEdge(time) {
        timerId = undefined

        // Only invoke if we have `lastArgs` which means `func` has been
        // debounced at least once.
        if (trailing && lastArgs) {
            return invokeFunc(time)
        }
        lastArgs = lastThis = undefined
        return result
    }

    function cancel() {
        if (timerId !== undefined) {
            cancelTimer(timerId)
        }
        lastInvokeTime = 0
        lastArgs = lastCallTime = lastThis = timerId = undefined
    }

    function flush() {
        return timerId === undefined ? result : trailingEdge(Date.now())
    }

    function pending() {
        return timerId !== undefined
    }

    function debounced(...args) {
        const time = Date.now()
        const isInvoking = shouldInvoke(time)

        lastArgs = args
        lastThis = this
        lastCallTime = time

        if (isInvoking) {
            //timerId不存在有两种原因：
            //1. 首次调用
            //2. 上次延时调用结束
            if (timerId === undefined) {
                return leadingEdge(lastCallTime)
            }
            // 存在func调用最长延时限制时，执行func并启动下一次延时，可实现throttle
            if (maxing) {
                // Handle invocations in a tight loop.
                timerId = startTimer(timerExpired, wait)
                return invokeFunc(lastCallTime)
            }
        }
        if (timerId === undefined) {
            timerId = startTimer(timerExpired, wait)
        }
        return result
    }
    debounced.cancel = cancel
    debounced.flush = flush
    debounced.pending = pending
    return debounced
}
function throttle(func, wait, options) {
    let leading = true
    let trailing = true

    if (typeof func !== 'function') {
        throw new TypeError('Expected a function')
    }
    if (isObject(options)) {
        leading = 'leading' in options ? !!options.leading : leading
        trailing = 'trailing' in options ? !!options.trailing : trailing
    }
    return debounce(func, wait, {
        leading,
        trailing,
        'maxWait': wait
    })
}
/** 
 * 
 * 
 * 提示：理解debounce的时候可以暂时忽略maxWait，后面会解释maxWait的作用。
debouncedFunc是如何工作的：

首次调用
执行leadingEdge函数，leading选项为true时表示在延时之前调用func，然后启动延时器。
延时器的作用是：在延时结束之后执行trailingEdge函数，trailing选项为true时表示在延迟结束之后调用func，最终结束一次func调用延迟的过程。


再次调用
如果上一次的func延时调用已经结束，再次执行leadingEdge函数来启动延时过程。
否则，忽略此次调用。(如果设置了maxWait且当前满足调用的时间条件，那么立即调用func并且启动新的延时器)


如果leading和trailing选项同时为true，那么func在一次防抖过程能被调用多次。
lodash在debounce的基础上添加了maxWait选项，用于规定func调用不能延迟超过maxWait毫秒，也就是说每段maxWait时间内func一定会被调用一次。
所以只要设置了maxWait选项，那么效果就等同于函数节流了。
这一点也可以通过lodash的throttle源码得到验证: throttle的wait作为debounce的maxWait传入。
*/