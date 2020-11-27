想象下这样的一个场景，假如你手中有一张彩票，刮开一看，一百万，做梦的感觉有没有

想不想梦想成真，学了以下内容，你想要多少就能刮多少

# 合成

说到合成，我脑子里浮现的第一印象就是本身不存在，要由多种物品重新结合生成

那么在canvas中，合成又代表什么呢？

> 通过canvas提供的图形绘制方法，已绘图像和将绘图像进行组合搭配，重叠部分做不同处理的过程

## 透明度合成 

- globalAlpha

  设置图形的透明度，效果和`ctx.fillStyle ='RGBA()'`一样

  其和css中的opacity一样，可以脱离RGBA单独设置透明度

```js
ctx.globalAlpha = value;

/*
value
	数字在 0.0  （完全透明）和 1.0 （完全不透明）之间。 默认值是 1.0。 如果数值不在范围内，包括Infinity 和NaN ，无法赋值，并且 globalAlpha 会保持原有的数值。
*/
```



```js
    const canvas=document.getElementById('canvas');
    //canvas充满窗口
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    //画笔
    const  ctx=canvas.getContext('2d');

    /*透明度合成 globalAlpha，取值范围[0,1]*/
    ctx.save();
    ctx.globalAlpha=0.5;
    ctx.fillRect(50,50,300,200);
    ctx.fillRect(150,150,300,200);
    ctx.restore();

    ctx.save();
    ctx.fillStyle='RGBA(0,0,0,.5)';
    ctx.fillRect(550,50,300,200);
    ctx.fillRect(650,150,300,200);
    ctx.restore();

    ctx.fillRect(250,250,300,200);
```

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6c5ba45781104a308e0db9ddabccdeb9~tplv-k3u1fbpfcp-watermark.image)

可以看出两个图形重叠部分透明度是在叠加的

```js
ctx.save()
ctx.fillStyle = '#000';
//ctx.fillStyle = '#FFF';
// set transparency value
ctx.globalAlpha = 0.2;
// Draw semi transparent circles
for (i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.arc(250, 250, 10 + 10 * i, 0, Math.PI * 2, true);
    ctx.fill();
}
ctx.restore();
```

<img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4a2dcd32917d44c9a5079ef9653c8f1c~tplv-k3u1fbpfcp-watermark.image" style="zoom:50%;" />

## 全局合成

- globalCompositeOperation

  全局合成是canvas 画布中的已绘图像（source）和将绘图像（destination）的融合方式
  
  ```js
  ctx.globalCompositeOperation = type;
  /* type值
   * source-atop         新图形只在与现有画布内容重叠的地方绘制
   * source-in           新图形只在新图形和目标画布重叠的地方绘制。其他的都是透明的。
   * source-out          在不与现有画布内容重叠的地方绘制新图形。
   * source-over 默认     这是默认设置，并在现有画布上下文之上绘制新图形。
   * destination-atop    现有的画布只保留与新图形重叠的部分，新的图形是在画布内容后面绘制的
   * destination-in      现有的画布内容保持在新图形和现有画布内容重叠的位置。其他的都是透明的
   * destination-out     现有内容保持在新图形不重叠的地方。
   * destination-over    在现有的画布内容后面绘制新的图形。
   * lighter             两个重叠图形的颜色是通过颜色值相加来确定的。
   * copy                只显示新图形。
   * xor				   图像中，那些重叠和正常绘制之外的其他地方是透明的
   * ...
   * */
  ```
  
  [更多type属性值](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation)
  
  - 快速记忆
  
  前面8个type值，是不是很像，对于这8个，用下面的方式记忆更快
  
  source：已绘图像
  
  destination：将绘图像
  
  atop：顶部
  
  in：里面
  
  out：外面
  
  over：覆盖
  
  |      |            source            |         destination          |
  | :--: | :--------------------------: | :--------------------------: |
  | atop | **已绘图像顶部显示**将绘图像 | **将绘图像顶部显示**已绘图像 |
  |  in  | **已绘图像内部显示**将绘图像 | **将绘图像内部显示**已绘图像 |
  | out  | **已绘图像外部显示**将绘图像 | **将绘图像外部显示**已绘图像 |
  | over | 将绘图像**覆盖已绘图像显示** | 已绘图像**覆盖将绘图像显示** |
  
  - 案列说明
  
  ```js
  /*
  *先画一个黄色的正方形
  *设置全局合成的属性
  *再绘制一个绿色的圆
  */
  
  //正方形
  ctx.save();
  ctx.fillStyle = 'orange';
  ctx.fillRect(100, 100, 200, 200);
  //设置全局合成属性
  // ctx.globalCompositeOperation = 'source-atop';
  //圆
  ctx.beginPath();
  ctx.arc(300, 300, 100, 0, Math.PI * 2);
  ctx.fillStyle = 'green';
  ctx.fill();
  ctx.restore();
  
  /**
   * @description: 绘制透明遮罩层
   */   
  //正方形
  ctx.save();
  ctx.save();
  ctx.font='bold 12px arial';
  ctx.fillText('source',100,110);
  ctx.fillStyle = 'orange';
  ctx.globalAlpha = 0.1;
  ctx.fillRect(100, 100, 200, 200);
  ctx.restore();
  //圆
  ctx.beginPath();
  ctx.save();
  ctx.font='bold 12px arial';
  ctx.fillText('destination',300,370);
  ctx.fillStyle = 'green';
  ctx.globalAlpha = 0.1;
  ctx.arc(300, 300, 100, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();
  ```
  
  |      |                            source                            |                         destination                          |
  | :--: | :----------------------------------------------------------: | :----------------------------------------------------------: |
  | atop | <img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ed4ae798edbf40b4a205deedbd75db2c~tplv-k3u1fbpfcp-watermark.image" style="zoom:50%;" />**已绘图像顶部显示**将绘图像 | <img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/781bdc49995b45479bf897def2562e5e~tplv-k3u1fbpfcp-watermark.image" style="zoom:50%;" />**将绘图像顶部显示**已绘图像 |
  |  in  | <img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eac9a2a9ada44da2bf63f722b353f489~tplv-k3u1fbpfcp-watermark.image" style="zoom:50%;" />**已绘图像内部显示**将绘图像 | <img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4f60e72aafb14c2a9da6f6fd7185cbff~tplv-k3u1fbpfcp-watermark.image" style="zoom:50%;" />**将绘图像内部显示**已绘图像 |
  | out  | <img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b808dd8b1d3647e38738170f4e20b4d7~tplv-k3u1fbpfcp-watermark.image" style="zoom:50%;" />**已绘图像外部显示**将绘图像 | <img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dd05118b6a6143eaa42617fee25c6cab~tplv-k3u1fbpfcp-watermark.image" style="zoom:50%;" />**将绘图像外部显示**已绘图像 |
  | over | <img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/796b3fe909f943e591fa649a20221233~tplv-k3u1fbpfcp-watermark.image" style="zoom:50%;" />将绘图像**覆盖已绘图像显示** | <img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/81788ecd3abe451798c0d4b2e05aa6ef~tplv-k3u1fbpfcp-watermark.image" style="zoom:50%;" />已绘图像**覆盖将绘图像显示** |
  
  |                           lighter                            |                             copy                             |                             xor                              |
  | :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: |
  | <img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5c1d2659978041599f2b998bc9328428~tplv-k3u1fbpfcp-watermark.image" style="zoom:50%;" />![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7f48aa827dd8474d9f8c143256e37175~tplv-k3u1fbpfcp-watermark.image) | <img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7f48aa827dd8474d9f8c143256e37175~tplv-k3u1fbpfcp-watermark.image" style="zoom:50%;" /> | <img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d9d54270ec784233b0a4e80f7a29e41b~tplv-k3u1fbpfcp-watermark.image" style="zoom:50%;" /> |
  
  

# 裁剪

路径裁剪就是在画布上设置一个路径，让我们之后绘制的图像只显示在这个路径之中。

路径裁剪的步骤：

1.定义路径

2.ctx.clip()

绘制其他图形

```js
ctx.save();
ctx.beginPath();
ctx.arc(300, 300, 200, 0, Math.PI * 2);
ctx.stroke();

ctx.clip();

ctx.fillRect(50, 50, 600, 200);
ctx.fillStyle = '#00acec';
ctx.fillRect(200, 50, 600, 600);
ctx.beginPath();
ctx.fillStyle = 'red';
ctx.fillRect(50, 250, 600, 600);
ctx.restore();

/*
*以下代码不受裁剪路径影响
*/
// ctx.fillStyle = 'red';
// ctx.fillRect(50,250,600,600);
```



# 案例---刮刮卡

![GIF 2020-10-16 19-40-55](C:\Users\pc\Desktop\前端学习\05.前端技术积累\03.canvas\assets\系列二\GIF 2020-10-16 19-40-55.gif)

```html
<style>
    #canvas{
        margin: 100px;
        background-image: url("./images/ggl-back.png");
    }
</style>

<canvas id="canvas"></canvas>
<script>
    const canvas=document.getElementById('canvas');
    const ctx=canvas.getContext('2d');

    /*图像尺寸，遮罩图和背景图尺寸一样*/
    const [width,height]=[395,188];
    canvas.width=width;
    canvas.height=height;

    /*建立图像源*/
    const img=new Image();
    img.src='./images/ggl-mask.png';
    img.onload=function(){
        /*绘制遮罩层*/
        ctx.drawImage(img,0,0);
    };

    /*
    * 线对象 Line
    *   ctx 上下文对象
    *   drawing 是否正在绘图
    *
    *   鼠标按下 moveTo(x,y)
    *       记录正在绘图的状态 drawing
    *       保存状态
    *       设置全局合成属性globalCompositeOperation 为destination-out
    *       线宽lineWidth为30
    *       moveTo()设置路径起点
    *   鼠标移动 lineTo(x,y)
    *       lineTo()绘制下一个点
    *       stroke()描边
    *   鼠标抬起 restore()
    *       状态还原
    *       取消正在绘图的状态
    * */
    class Line{
        constructor(ctx){
            this.ctx=ctx;
            this.drawing=false;
        }
        moveTo(x,y){
            const {ctx}=this;
            this.drawing=true;
            ctx.save();
            ctx.lineWidth=30;
            ctx.globalCompositeOperation='destination-out';
            ctx.beginPath();
            ctx.moveTo(x,y);
        }
        lineTo(x,y){
            const {ctx}=this;
            ctx.lineTo(x,y);
            ctx.stroke();
        }
        restore(){
            this.ctx.restore();
            this.drawing=false;
        }
    }


    /*实例化线对象 Line*/
    const line=new Line(ctx);


    /*==========鼠标事件===========*/
    /*鼠标按下*/
    canvas.addEventListener('mousedown',function(event){
        //鼠标左键按下
        if(event.buttons===1) {
            //获取鼠标位置
            const {x, y} = getMousePos(event);
            //绘制起点
            line.moveTo(x,y);
        }
    });
    /*鼠标移动*/
    canvas.addEventListener('mousemove',function(event){
        //鼠标左键按下且处于绘图状态
        if(event.buttons===1&&line.drawing) {
            //获取鼠标位置
            const {x, y} = getMousePos(event);
            //绘制下一个点
            line.lineTo(x,y);
        }
    });
    /*鼠标抬起*/
    canvas.addEventListener('mouseup',function(event){
        //鼠标左键按下
        if(event.buttons===1) {
            //状态还原
            line.restore();
        }
    });


    //获取鼠标在canvas中的位置
    function getMousePos(event){
        //获取鼠标位置
        const {clientX,clientY}=event;
        //获取canvas 边界位置
        const {top,left}=canvas.getBoundingClientRect();
        //计算鼠标在canvas 中的位置
        const x=clientX-left;
        const y=clientY-top;
        return {x,y};
    }


</script>
```

