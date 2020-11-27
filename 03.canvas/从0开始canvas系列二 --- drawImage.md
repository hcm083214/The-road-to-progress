# canvas画布简单案例

经过[第一期从0开始canvas系列](https://juejin.im/post/6876411520391970829)，相信大家对于canvas都有了一定的了解，下面我们通过一个案例巩固下上一期的canvas

案例一：霓虹灯特效

![GIF 2020-9-27 11-31-51](.\assets\GIF 2020-9-27 11-31-51.gif)

```html
<canvas id="canvas"></canvas>
<script>
    const canvas = document.getElementById('canvas');
    //canvas充满窗口
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    //画笔
    const ctx = canvas.getContext('2d');
    //颜色数组
    const colors = ['red', 'yellow'];
    function drawLove() {
        //画之前先擦拭掉
        ctx.clearRect(0,0,window.innerWidth,window.innerHeight)
        ctx.save()//画之前保存之前的状态
        ctx.translate(300, 300);//移动坐标轴
        ctx.strokeStyle = colors[0];//设置描边颜色
        ctx.lineWidth = 20;//设置描边宽度
        ctx.setLineDash([30]);//设置描边虚线样式
        ctx.beginPath();//开始路径
        ctx.moveTo(0, 0)
        ctx.bezierCurveTo(
            -200, -50,
            -180, -300,
            0, -200
        );
        ctx.bezierCurveTo(180,-300,200,-50,0,0);
        // ctx.moveTo(0, 0)
        // ctx.bezierCurveTo(
        //     200, -50,
        //     180, -300,
        //     0, -200
        // );
        ctx.shadowColor = 'orange';
        for(let i=50;i>0;){
            ctx.shadowBlur = i+2;
            i=i-10;
            ctx.stroke();
        }
        //设置setLineDash移动虚实线，并再次stroke
        ctx.lineDashOffset= 30;
        ctx.strokeStyle = colors[1];
        for(let i=50;i>0;){//创建阴影部分
            ctx.shadowBlur = i;
            i=i-10;
            ctx.stroke();
        }
        ctx.restore()
    }
    const timer = setInterval(function(){
        colors.reverse();
        drawLove();
    },1000)
</script>
```

上文已经讲过对于绘制简单图形的方法，想想window自带的画图工具，除了绘制简单的图形外，是不是还可以插入文字和图片，本文就针对以下两点来进行阐述

# canvas文本

## canvas文本的绘制方法

和绘制图形一样，canvas 提供了两种方法来渲染文本:

### 填充

`fillText(text, x, y [, maxWidth\])`

在指定的(x,y)位置填充指定的文本，绘制的最大宽度是可选的.

### 描边

`strokeText(text, x, y [, maxWidth\])`

在指定的(x,y)位置绘制文本边框，绘制的最大宽度是可选的.

```js
    const canvas=document.getElementById('canvas');
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    const ctx=canvas.getContext('2d');

    const text='点赞加关注';
    ctx.font='100px arial';
    //描边宽度
    ctx.lineWidth=3;
    //描边色
    ctx.strokeStyle='red';
    //获取文字宽度
    const measure=ctx.measureText(text);

    /*填充文字 fillText(text, x, y ,maxWidth)*/
    ctx.fillText(text,100,300,1000);

    /*描边文字 strokeText(text, x, y ,maxWidth)*/
     ctx.strokeText(text,100,450,measure.width/2);
```

![1](.\assets\系列二\1.png)

## canvas文本的属性

### 字体（font）

`ctx.font=value;`

当前我们用来绘制文本的样式. 这个字符串使用和 CSS `font` 属性相同的语法. 默认的字体是 `10px sans-serif`。

```js
/*font：设置文本的字号、字体等属性*/
ctx.font='bold 100px arial';

/*绘制文本*/
ctx.fillText('晚上好',100,200);
```

### 水平对齐（textAlign）

`ctx.textAlign=value`

文本对齐选项. 可选的值包括：`start`, `end`, `left`, `right` or `center`. 默认值是 `start`。都是相对于moveTo的位置来说

```js
/*
* textAlign 文字水平对齐方式
*   start：基于文本起始位对齐，默认
*   end：基于文本结束位对齐
*   left：左对齐
*   right：右对齐
*   center：居中对齐
* */
    ctx.textAlign='start';
    ctx.fillText('start起始位置',300,100);
    ctx.textAlign='left';
    ctx.fillText('left左边',300,150);
    ctx.textAlign='end';
    ctx.fillText('end终止位置',300,200);
    ctx.textAlign='right';
    ctx.fillText('right右边',300,250);
    ctx.textAlign='center';
    ctx.fillText('center中心位置',300,300);
```

![image-20200927132015484](C:\Users\pc\Desktop\前端学习\05.前端技术积累\03.canvas\assets\系列二\2.png)

### 垂直对齐（textBaseline）

`ctx.textBaseline=value`

基线对齐选项. 可选的值包括：`top`, `hanging`, `middle`, `alphabetic`, `ideographic`, `bottom`。默认值是 `alphabetic。`

![image-20200927132247365](C:\Users\pc\Desktop\前端学习\05.前端技术积累\03.canvas\assets\系列二\3.png)

## 案例

### 艺术字

![image-20200927134212048](C:\Users\pc\Desktop\前端学习\05.前端技术积累\03.canvas\assets\系列二\4.png)

```js
    const canvas=document.getElementById('canvas');
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    const ctx=canvas.getContext('2d');

    /*文字内容*/
    const text='canvas';

    /*文字位置*/
    const [x,y]=[50,200];

    /*字体属性，文字加粗，大小：200px，字体：arial*/
    ctx.font='bold 200px arial';

    /*投影，颜色：rgba(0,0,0,0.6)，垂直偏移：2，模糊：40*/
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowOffsetX = 2;
    ctx.shadowBlur = 40;

    /*填充文字，颜色：#a76921*/
    ctx.fillStyle = '#a76921';
    ctx.fillText(text,x,y);

    /*实线描边文字，颜色：#f0d5ac，线宽：8*/
    ctx.lineWidth = 8;
    ctx.strokeStyle='#f0d5ac'
    ctx.strokeText(text,x,y);

    /*虚线描边文字，颜色：#333，线宽：1，线段长度[5,3]*/
    ctx.setLineDash([5,3]);
    ctx.lineWidth = 1;
    ctx.strokeStyle='#333'
    ctx.strokeText(text,x,y);

```

# canvas图像---drawImage

除了对文字的处理，canvas也提供了对图片的操作能力

> canvas可以用于动态的图像合成或者作为图形的背景，以及游戏界面（Sprites）等等。浏览器支持的任意格式的外部图片都可以使用，比如PNG、GIF或者JPEG。 你甚至可以将同一个页面中其他canvas元素生成的图片作为图片源。

## 图像处理

canvas对于图像的处理是通过drawImage来完成的，根据参数不同，实现的功能也不一样

### 绘制图片

`drawImage(image, x, y)`

其中 `image` 是 image 或者 canvas 对象，`x` 和 `y 是其在目标 canvas 里的起始坐标。`

```js
const canvas=document.getElementById('canvas');
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;
const ctx=canvas.getContext('2d');

const img=new Image();
img.src='./images/lena.jpg';
img.onload=function(){
    /*图像尺寸*/
    const {width,height}=img;
    /*绘图+移动 drawImage(image, x, y) */
    ctx.drawImage(img,100,50);
};
```

![image-20200927142123024](.\assets\系列二\5.png)

### 缩放

`drawImage` 方法的又一变种是增加了两个用于控制图像在 canvas 中缩放的参数。

`drawImage(image, x, y, width, height)`

这个方法多了2个参数：`width` 和 `height，`这两个参数用来控制 当向canvas画入时应该缩放的大小

```js
    img.onload=function(){
        /*图像尺寸*/
        const {width,height}=img;
        /*绘图+移动+缩放 drawImage(image, x, y,width,height) */
        ctx.drawImage(img,100,50,width,height);//width,height控制缩放大小
    };
```

| `drawImage(image, x, y, width/2, height/2)`       | `drawImage(image, x, y, width, height)`           | `drawImage(image, x, y, width*2, height*2)`       |
| ------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| ![image-20200927143341565](.\assets\系列二\8.png) | ![image-20200927143230821](.\assets\系列二\7.png) | ![image-20200927143131959](.\assets\系列二\6.png) |



### 裁剪

`drawImage` 方法的第三个也是最后一个变种有8个新参数，用于控制做切片显示的。

`drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)`

第一个参数和其它的是相同的，都是一个图像或者另一个 canvas 的引用。其它8个参数最好是参照下图的图解，前4个是定义图像源的切片位置和大小，后4个则是定义切片的目标显示位置和大小。

![image-20200927144616720](.\assets\系列二\9.png)

```js
    const canvas=document.getElementById('canvas');
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    const ctx=canvas.getContext('2d');

    const img=new Image();
    img.src='./images/lena.jpg';
    
    img.onload=function(){
        /*图像尺寸*/
        const {width,height}=img;
        ctx.drawImage(
            img,
            //裁剪部分，前面两个参数是裁剪起始坐标，后面两个参数是裁剪的宽高
            width/2,height/2,width,height,
            //绘制缩放部分，前面两个参数是图片绘制的起始坐标，后面两个参数是缩放比例
            100,100,width,height,
        )
    };
```

绘制过程如下

| 裁剪图例                                                     | 绘制缩放图例                                                 |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| ![image-20200927150342683](C:\Users\pc\Desktop\前端学习\05.前端技术积累\03.canvas\assets\系列二\10.png) | ![image-20200927150431171](C:\Users\pc\Desktop\前端学习\05.前端技术积累\03.canvas\assets\系列二\11.png) |

### 案例

利用雪碧图+drawImage制作动画

<img src=".\assets\系列二\GIF 2020-9-27 15-51-43.gif" alt="GIF 2020-9-27 15-51-43" style="zoom:50%;" />

原理：利用人眼视觉残留，将雪碧图每一个小照片在相同时间间隔内移动到第一张画面的位置，到最后一张后立即跳到第一张，一直重复这个动作

```js
const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

//图片数量 8
const len = 8;
//宽高 256
const size = 256;
//当前帧
let fm = 0;

//建立图像源
const img = new Image()
img.src = './images/bomb.jpg'
img.onload = drawBomb;

function drawBomb() {
    setInterval(function(){
        ctx.drawImage(img,
            size * fm, 0, size, size,
            100, 100, size, size
        );
        fm++;
        if(fm%8===0) fm=0;
    },100)
}
```

