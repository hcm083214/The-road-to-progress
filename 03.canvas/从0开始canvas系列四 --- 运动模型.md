# 【扩展】匀速/加速/弹性运动

要了解这运动，首先你必须得对速度（v），位移（s），时间（t），加速度（a）完全了解，如果你完全了解上述概念，那你就可以直接跳过往下看，不清楚那就往下看吧

`s=vt`

相信接受过九年义务教育的你，对于这个公式不会陌生吧，但是你真的完全了解它吗

上述公式仅适用于匀速运动，且s和v都是矢量，正负代表方向

- 匀速直线运动

  即速度大小和方向不变的运动，其相同时间位移量变化一致，即

  `v=Δs/Δt` 为定值，速度是矢量，他有大小和方向

  s=vt或者s = s1+v*t  

  ```
  代码中的匀速直线运动
  s = s1+v*t  --> s=s+v
  s记录每一此变化后的位移
  v记录速度，定值
  因为每一次物体变化都是用setInterval/requestAnimationFrame进行画面更新渲染的，
  可以认为每次时间都是固定的，既然固定可以认为每一次的t=1
  ```

  

  <img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ce0c87e010d6467886ff3f1536df5eae~tplv-k3u1fbpfcp-zoom-1.image" style="zoom:50%;" />

- 加速运动

  - 匀变速直线运动

    加速运动，讲此之前我们需要先对加速度有一定的了解，**注意加速度和速度不是同一个东西**

    > 加速度是速度变化量与发生这一变化所用时间的比值a=Δv/Δt，是描述物体速度变化快慢的物理量，通常用a表示，单位是m/s^2

  ```
  如果一个物体正处在匀加速直线运动中，其速度一直在变化
  
  假设加速度a=2，初始速度v0=0
  1s后速度v=2，位移s=1 ,Δs = 1
  2s后速度v=4，位移s=4 ,Δs = 1+2
  3s后速度v=6，位移s=9 ,Δs = 1+2+2
  4s后速度v=8，位移s=16 ,Δs = 1+2+2+2
  ```

  ​	变化后的速度大小`v = v0 + at`(v0代表初始速度)

  ​	位移公式为：`s=V0t+(at^2)/2` 或者 s = s1 + a*t（

  ```
  代码中的匀变速直线运动
  s = s1+a*t  --> v=v+a s=s+v
  s记录每一此变化后的位移
  a记录加速度，定值
  ```

- 弹性运动（仅考虑垂直/水平碰撞）

  - 弹性碰撞

    弹性碰撞指的是物体在碰撞过程中，物体运动方向（速度方向）瞬间发生改变，碰撞之后动能**不会**发生损失，（弹性碰撞只在分子、原子以及更小的微粒之间才会出现）

    ```js
    代码中的弹性碰撞
    v = -v;
    a = -a;
    v:速度
    a:加速度
    ```

  - 非弹性碰撞

    非弹性碰撞指的是在物体碰撞过程中，物体运动方向（速度方向）瞬间发生改变，现实情况状态下，碰撞之后动能**会**发生损失，相应的速度也会变小，如果时加速运动，加速度大小也会相应减少

    ```js
    代码中的非弹性碰撞
    v = -f*v;
    a = -f*a;
    v:速度
    a:加速度
    f:动能衰减率（0<f<1）
    ```



# 运动绘制

在canvas中，我们要怎么要来绘制运动的物体呢，上文已经讲过需要用到setTimeOut/setInterval/requestAnimationFrame，对于setTimeOut/setInterval，想必大家都很熟悉，那么requestAnimationFrame呢，如果不清楚的话，那我帮你们从mdn摘抄下来，省的再翻资料，会加入点自己理解，如果介意请移步[requestAnimationFrame](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame)了解

## 【扩展】requestAnimationFrame

> **`requestAnimationFrame(callback)`** 告诉浏览器——你希望执行一个动画，并且要求浏览器在下次重绘之前调用指定的回调函数更新动画。该方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行

```js
window.requestAnimationFrame(callback);

callback
	下一次重绘之前更新动画帧所调用的函数(即上面所说的回调函数)。该回调函数会被传入DOMHighResTimeStamp参数，该参数与performance.now()的返回值相同，它表示requestAnimationFrame() 开始去执行回调函数的时刻。
```

requestAnimationFrame相较于setTimeout，其无法设定执行时间，设定为浏览器刷新的时间，并且当你更换页面后回调函数是不会执行的

用此方法时，要保证一直执行，在函数内部调用requestAnimationFrame，该函数作为requestAnimationFrame的回调函数

```js
let start = new Date();
function render(){
    let now = new Date();
    console.log(now-start);// 16/17
    start = now;
    requestAnimationFrame(render);
}
render();
```

优缺点对比

- setTimeOut(fn,time) 和setInterval(fn,time)

  优点：使用方便，动画的时间间隔可以自定义。

  缺点：隐藏浏览器标签后，会依旧运行，造成资源浪费。与浏览器刷新频率不同步。

- requestAnimationFrame(fn)

  优点：性能更优良。隐藏浏览器标签后，便不会运行。与浏览器刷新频率同步。

  缺点：动画的时间间隔无法自定义



有了上面的知识，那么我们开始的任务，用canvas画出下面的运动动画

公共代码如下，功能是画出小球和两条碰撞线和中线

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e2cc582b8e2c456aa18bd42e98641a9f~tplv-k3u1fbpfcp-zoom-1.image)

```js
const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const [width, height] = [window.innerWidth, window.innerHeight];
canvas.width = width;
canvas.height = height;
const C = 2 * Math.PI;
const startPosX = -650 

class Ball {
    constructor(x, y, r, color) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color;
    }
    draw(ctx) {
        // console.log(this.y)
        ctx.clearRect(0, 0, width, height);

        ctx.save();
        ctx.translate(width / 2, 0);//原点坐标左移

        //画出中线和两条碰撞线
        ctx.save()
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, height);
        ctx.moveTo(-startPosX, 0);
        ctx.lineTo(-startPosX, height);
        ctx.moveTo(startPosX, 0);
        ctx.lineTo(startPosX, height);
        ctx.stroke();
        ctx.restore()

        //画球
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, C);
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }
}
const ball = new Ball(startPosX + 30, 50, 30, 'gray');
ball.draw(ctx);
```



## 匀速运动

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/89c88a67dc5c4c92b2735f62f9aa9aea~tplv-k3u1fbpfcp-zoom-1.image" style="zoom:50%;" />

```js
// 匀速直线运动
let v = 5;
uniformMotion();

function uniformMotion() {
    ball.x += v;
    if (Math.abs(ball.x) > -startPosX - 30) {
        v = -v;
    }
    ball.draw(ctx);
    requestAnimationFrame(uniformMotion);
}
```



## 加速运动

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5fee4378ad5e4772899b79f543e83afe~tplv-k3u1fbpfcp-zoom-1.image)

```js
//匀变速直线运动
let a = 0.1;
let v = 0;
uniformVariableSpeed(); 

function uniformVariableSpeed() {
    v += a;
    ball.x += v;
    if (Math.abs(ball.x) > -startPosX) {
        ball.x = startPosX + 30;
        v = 0;
    }
    ball.draw(ctx);
    requestAnimationFrame(uniformVariableSpeed);
}
```



## 弹性运动

<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5fee4378ad5e4772899b79f543e83afe~tplv-k3u1fbpfcp-zoom-1.image" style="zoom:50%;" />

```js
// 非弹性碰撞
let v = 10;
let f = 0.2;
inelasticCollision(); 

function inelasticCollision() {
    ball.x += v;
    console.log("inelasticCollision -> v", v)
    if (Math.abs(ball.x) > startPosX - 30) {//撞墙判断
        v = -f * v; // 碰撞后非弹性碰撞，速度的变化
        if (Math.abs(v) < 1) {
            v = 0;
        }
        ball.x = ball.x > 0 ? 620 : -620; //从接触墙开始运动
    }
    ball.draw(ctx);
    requestAnimationFrame(inelasticCollision);
}
```

