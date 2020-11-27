# 从0开始canvas系列

[从0开始canvas系列一 --- canvas画布](https://juejin.im/post/6876411520391970829)

[从0开始canvas系列二 --- 文本和图像](https://juejin.im/post/6877164274817597447)

从0开始canvas系列三 --- 图像像素级操作

# 图像像素级操作

## imageData对象

大家都知道图片是由许多的像素点构成的，canvas对图像的操作也是基于像素点的，所有的像素点信息都可以存放在imageData实例中

> **`ImageData()`** 构造函数返回一个新的实例化的 `ImageData` 对象， 此对象由给定的类型化数组和指定的宽度与高度组成

```js
new ImageData([array], width, height);

/*
array
	包含图像隐藏像素的 Uint8ClampedArray 数组。如果数组没有给定，指定大小的黑色矩形图像将会被创建。
width
	无符号长整型（unsigned long）数值，描述图像的宽度。
height
    无符号长整型（unsigned long）数值，描述图像的高度。
*/
```

### Uint8ClampedArray

> Uint8ClampedArray**（8位无符号整型固定数组）** 类型化数组表示一个由值固定在0-255区间的8位无符号整型组成的数组，其有以下特性
>
> - 如果你指定一个在 [0,255] 区间外的值，它将被替换为0或255；
>
> - 如果你指定一个非整数，那么它将被设置为最接近它的整数。
>
> - （数组）内容被初始化为0

为了深入理解Uint8ClampedArray，我们来看看width/height =1（1个像素）的imageData实例有什么东西

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/29156ce9ba8d4546b4f2f0c1623f2bbe~tplv-k3u1fbpfcp-zoom-1.image)

可以看到**Uint8ClampedArray的4个数字，存储的就是图像每个像素点RGBA的属性值**，可以通过imageData.data获得

## 像素操作

### 像素获取(getImageData)

- getImageData

```js
ctx.getImageData(x, y, w, h);

/*
x
	将要被提取的图像数据矩形区域的左上角 x 坐标。
y
	将要被提取的图像数据矩形区域的左上角 y 坐标。
w
	将要被提取的图像数据矩形区域的宽度。
h
	将要被提取的图像数据矩形区域的高度。
*/
```

### 像素还原图像(putImageData)

- putImageData

```js
ctx.putImageData(imagedata, 
                 dx, dy, //图片相对原点位置
                 X, Y, //裁剪起始坐标
                 W, H//裁剪大小
                );
```

示意图如下：

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/42a0b84caa254477a8dacd35fb8a24cb~tplv-k3u1fbpfcp-zoom-1.image" style="zoom:50%;" />

#### 案例

```js
    const canvas=document.getElementById('canvas');
    //canvas充满窗口
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    const ctx=canvas.getContext('2d');

    const img=new Image();
    img.src='./images/dog.jpg';
    img.onload=function(){
        //获取图片宽高
        const {width,height}=img;

        /*1.在canvas 中绘制图像*/
        ctx.drawImage(img,0,0);

        /*2.从canvas 中获取图像的ImageData*/
        const imgDt=ctx.getImageData(0,0,width,height);

        console.log(imgDt)
        /*3.在canvas 中显示ImageData*/
        ctx.putImageData(
            imgDt,
            //图像位置
            0,height,
            //裁剪区域
            width/2,height/2,width/2,height/2
        );
    };
```

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bfe3c005bbd943dba01a955c68cb63f1~tplv-k3u1fbpfcp-zoom-1.image" style="zoom:50%;" />

### 像素处理

如果我们想要针对单独像素进行处理怎么办呢，还记得前文说过的Uint8ClampedArray数组中存在RGBA的信息吗，我们可以利用其进行遍历处理像素

- 逐像素遍历

  ```js
  for(let i=0;i<arr.length;i+=4){
          let r=data[i+0];
          let g=data[i+1];
          let b=data[i+2];
          let a=data[i+3];
          console.log(r,g,b,a)
  }
  ```

- 行列遍历

  ```js
  for(let y=0;y<h;y++){
     for(let x=0;x<w;x++){
          let ind=(y*w+x)*4;
          let r=data[ind];
          let g=data[ind+1];
          let b=data[ind+2];
          let a=data[ind+3];
          console.log(r,g,b,a)
      }
  }
  ```

#### 图像置灰

要点：灰度算法 const lm =0.299***r** + 0.587***g** + 0.114***b** ;

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/768e74f7ece44c86a0870cec7c3fdf84~tplv-k3u1fbpfcp-zoom-1.image" style="zoom:50%;" />

```js
    const canvas=document.getElementById('canvas');
    //canvas充满窗口
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    const ctx=canvas.getContext('2d');

    const img=new Image();
    img.src='./images/lena.jpg';
    img.onload=draw;

    /*灰度算法: 0.299*r+0.587*g+0.114*b */

    function draw(){
        //图像尺寸
        const {width,height}=img;
        console.log("draw -> width,height", width,height)

        /*1.在canvas 中绘制图像*/
        ctx.drawImage(img,0,0);

        /*2.从canvas 中获取图像的ImageData*/
        const imgDt=ctx.getImageData(0,0,width,height);
        const data=imgDt.data;

        /*像素遍历*/
        for(let i=0;i<data.length;i+=4){
            const [r,g,b]=[
                data[i],
                data[i+1],
                data[i+2],
            ]
            const lm=0.299*r+0.587*g+0.114*b;
            data[i]=lm;
            data[i+1]=lm;
            data[i+2]=lm;
        }

        /*3.在canvas 中显示ImageData*/
        ctx.putImageData(imgDt,width,0);

    }
```

#### 马赛克

要点：获取一区域的像素颜色，然后将此颜色赋给此区域的所有像素。

<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1a5544cddd0c4ad0b1ed4dd84c872c66~tplv-k3u1fbpfcp-zoom-1.image" style="zoom:50%;" />

```js
    const canvas=document.getElementById('canvas');
    //canvas充满窗口
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    const ctx=canvas.getContext('2d');

    //图像源
    const img=new Image();
    img.src='./images/lena.jpg';
    img.onload=render;

    //色块尺寸
    let size=5;

    function render() {
        //图像尺寸
        const {width,height}=img;

        /*1.在canvas 中绘制图像*/
        ctx.drawImage(img,0,0);

        /*2.从canvas 中获取图像的ImageData*/
        const imgDt=ctx.getImageData(0,0,width,height);
        const data=imgDt.data;

        /*行列遍历*/
        for(let y=0;y<height;y+=size){
            for(let x=0;x<width;x+=size){
                const i=(y*width+x)*4;
                const [r,g,b]=[
                    data[i],
                    data[i+1],
                    data[i+2],
                ]
                ctx.fillStyle=`RGB(${r},${g},${b})`;
                ctx.fillRect(x,y,size,size);
            }
        }
    }
```

# 【补充】画布变换

关注过canvas系列的朋友，在前面两章中接触过ctx.rotate和ctx.transform，其效果和css3的transform差不多，画布的变化特性相较css3没有那么复杂，目前我们就先学习下以下三个特性

- 移动： translate(x,y)

- 旋转： rotate(angle)

- 缩放： scale(x,y)

这三个特性都是相较于原点坐标的

|                        translate(x,y)                        |                        rotate(angle)                         |                          scale(x,y)                          |
| :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: |
| ![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1be989abda82408d826f82736a1a2e04~tplv-k3u1fbpfcp-zoom-1.image) | ![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f27f0db4b7544856b64de31279f0c0dd~tplv-k3u1fbpfcp-zoom-1.image) | ![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e409667072445bfa8251cf33e03e6b2~tplv-k3u1fbpfcp-zoom-1.image) |

注意：在图形变换前一定要保存好变换前的状态，变换完之后恢复之前的状态，这操作就好比PS的图层，变换操作内都是独立的存在

看下以下的例子

```js
canvas.width = 500;
canvas.height = 500;
const ctx = canvas.getContext('2d');


ctx.fillStyle = 'green';
ctx.fillRect(50, 50, 100, 100);

ctx.fillStyle = 'blue';
// ctx.save()  //加不加有什么区别
ctx.translate(100, 100);
ctx.fillRect(50, 50, 100, 100);
// ctx.restore()  //加不加有什么区别

ctx.fillStyle = 'blue';
// ctx.save()  //加不加有什么区别
ctx.translate(100, 200);
ctx.fillRect(50, 50, 100, 100);
// ctx.restore()  //加不加有什么区别
```

|             ctx.save()和ctx.restore() 两次都不加             |              ctx.save()和ctx.restore() 两次都加              |
| :----------------------------------------------------------: | :----------------------------------------------------------: |
| ![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f76bfc8eb43749a99aec70bfa27020b6~tplv-k3u1fbpfcp-zoom-1.image) | ![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7a1e731d51724ba69326eac46c6bb00f~tplv-k3u1fbpfcp-zoom-1.image) |