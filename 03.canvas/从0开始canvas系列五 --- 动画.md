# 动画绘制

什么是动画，说白点就是将一连串连续动作的图片，每张图片已一种很快的转换速度，在同一位置展示在我们眼前，因为视觉残留给人一种动态的错觉

再简单点可以这么说，一秒内有很多张连续的图片在我们眼前出现，我们看到的就是动画

那么放在canvas中，动画又是怎么实现的呢

## 绘制步骤

上文说过，动画就是多张连续图片短时间内出现在视觉内，在canvas中要实现这种方式，我们可以拆解为以下步骤

1. 清理画布：`ctx.clearRect(0,0,canvas.width,canvas.height)`
2. 保存 canvas 上下文对象的状态：`ctx.save()`
3. 绘制动画图形：…
4. 恢复 canvas 上下文对象的状态：`ctx.restore()`
5. 以上步骤重复调用：`setInterval(fn,time)`或者`requestAnimationFrame(fn)`

## 案例---匀速运动的小球

```js
{
    const canvas = document.querySelector('#canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const C = 2 * Math.PI

    class Ball { //创建小球类
        constructor() {
            this.x = 0;
            this.y = 0;
            this.r = 10;//小球半径
            this.vx = 0; //x方向初始速度
            this.vy = 0.1; //y方向初始速度
        }
        drawBall() { //绘制小球
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, C);
            ctx.fill();
            ctx.restore();
        }
    }
    /**
     * @description: 初始化小球
     */
    const ball = new Ball();
    ball.x = 100;
    ball.y = 100;
    ball.drawBall();

    let startTime = new Date();
    uniformMotion();

    function uniformMotion() {
        /**
         * @description: 小球运动动画
         */
        let nowTime = new Date();
        diffTime = nowTime-startTime;
        startTime = nowTime;
        ball.y += ball.vy*diffTime;
        if (ball.y > canvas.height - ball.r) {
            ball.y = ball.r / 2
        }
        ball.drawBall();
        requestAnimationFrame(uniformMotion);
    }
}
```

# 动画交互

在HMTL页面中，我们免不了和元素的交互，那么在canvas中，我们怎么去和图形交互呢

在页面交互中，是通过赋予指定元素事件类型达到与用户交互的目的，canvas中也是通过事件类型来达到交互目的，其实现方式为事件委托形式，委托对象为canvas

## 图形选择

既然是事件委托，那么真正的事件委托图形该怎么选择呢，总体思路其实很简单，即鼠标是否移动到图形上

对于一些简单的图形我们可以通过大小/位置来判断，下面我们就来举例说明下



公共代码

```js
const canvas = document.querySelector('#canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');
const C = 2 * Math.PI

class Round { //创建圆类
    constructor() {
        this.x = 0;
        this.y = 0;
        this.r = 10;
        this.endRadius = C;
        this.startRadius = 0;
    }
    drawRound() { //绘制圆形
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y, this.r, this.startRadius, this.endRadius);
        ctx.fill();
        ctx.restore();
    }
}

class Rectangle {//矩形
    constructor() {
        this.x = 0;
        this.y = 0;
        this.w = 100;
        this.h = 50;
    }
    drawRectangle() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.beginPath();
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.restore();
    }
}

class Triangle { //三角形类
    constructor(p1X, p1Y, p2X, p2Y, p3X, p3Y) {
        this.p1X = p1X;
        this.p1Y = p1Y;
        this.p2X = p2X;
        this.p2Y = p2Y;
        this.p3X = p3X;
        this.p3Y = p3Y;
    }
    drawTriangle() {
        let {
            p1X,
            p1Y,
            p2X,
            p2Y,
            p3X,
            p3Y
        } = this
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(p1X, p1Y);
        ctx.lineTo(p2X, p2Y);
        ctx.lineTo(p3X, p3Y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}
/**
 * @description: 初始化矩形
 */
const rect = new Rectangle();
rect.x = 100;
rect.y = 100;
rect.drawRectangle();

/**
 * @description: 初始化圆形
 */
const ball = new Round();
ball.x = 100;
ball.y = 100;
ball.r = 50;
ball.drawRound();

/**
 * @description: 初始化扇形
 */
const sector = new Round();
sector.x = 100;
sector.y = 100;
sector.r = 50;
sector.startRadius = -C / 16;
sector.endRadius = C / 3;
sector.drawRound();

/**
 * @description: 初始化三角形
 */
const triangle1 = new Triangle(50, 50, 450, 50, 250, 200)
triangle1.drawTriangle();

canvas.addEventListener('mousemove', mouseMoveHandle);

function mouseMoveHandle(e) {
    let selected = false;
    // selected = isSelected(e, 'rect');//鼠标是否滑过矩形
    // selected = isSelected(e, 'round');//鼠标是否滑过圆形
    //selected = isSelected(e, 'sector'); //鼠标是否滑过扇形
    selected = isSelected(e, 'triangle'); //鼠标是否滑过扇形
}

function isSelected(e, type) {
    let selected = false;
    if (type === 'rect') { 
        ...
    }else if (type === 'round') {
           ...
    }else if (type === 'sector') {
           ...
    }else{
        ...
    }
}
```



- 矩形

  位置：x, y

  尺寸：w, h

  ```js
  if (type === 'rect') { //矩形
      let disX = e.clientX - rect.x;
      let disY = e.clientY - rect.y;
      if (disX > 0 && disX < rect.w &&  //鼠标位置到矩形起始点的距离 < 宽和高
          disY > 0 && disY < rect.h
      ) {
          selected = true;
      }
  }
  ```

  

- 圆形

  圆心位置：center

  半径： radius

  ```js
  if (type === 'round') { //圆形
      let disX = e.clientX - ball.x;
      let disY = e.clientY - ball.y;
      disR = Math.sqrt(disX * disX + disY * disY);
      if (disR > 0 && disR < ball.r) { // 鼠标到圆心的距离 < 半径
          selected = true;
      }
  } 
  ```

  

- 扇形

  圆心位置： center

  半径： radius

  起始弧度： startAngle

  结束弧度： endAngle

  ```js
  if (type === 'sector') { //扇形
      let disX = e.clientX - ball.x;
      let disY = e.clientY - ball.y;
      let dir = Math.atan2(disY, disX);
      let disR = Math.sqrt(disX * disX + disY * disY);
      if (disR > 0 && disR < sector.r &&   // 鼠标到圆心的距离 < 半径
          dir > sector.startRadius && dir < sector.endRadius  // 起始弧度 < 鼠标与圆心连线弧度 < 结束弧度
      ) {
          selected = true;
      }
  }
  ```

- 复杂图形

  `isPointInPath(x,y)`
  
  x：检测点的X坐标
  
  y：检测点的Y坐标
  
  > isPointInPath(x,y) 是canvas 2d中的内置方法，它可以判断一个点位是否在路径中。
  >
  > isPointInPath(x,y) 面向的对象是路径，所以对文字、fillRect()、strokeRect()不好使。
  
  ```js
  {
      selected = ctx.isPointInPath(e.clientX, e.clientY)
  }
  ```
  
  注意：isPointInPath仅判断当前路径，`ctx.beginPath()`开启新的路径后又是已此路径作为判断
  
  ```js
  ctx.beginPath();
  ctx.moveTo(50, 50);
  ctx.lineTo(450, 50);
  ctx.lineTo(250, 200);
  ctx.closePath();
  ctx.stroke();
  
  const [x, y] = [200, 100];
  
  const bool = ctx.isPointInPath(x, y);
  console.log("bool", bool)//true
  
  ctx.beginPath();
  const bool2 = ctx.isPointInPath(x, y);
  console.log("bool2", bool2)//false
  ```
  
  

​	