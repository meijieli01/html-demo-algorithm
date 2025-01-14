# Smile-Common

功能部分

UI提出来，便于不同平台的使用

**Incisal**
切缘下唇曲线

**Cervical**
颈缘上唇曲线

**微笑窗**
按照下唇曲线来移动

**图片旋转的含义**
所有点都是在图片未旋转前定位的？
显示也是按照如此点来定位的，旋转图片的含义是什么呢？

图片旋转只是用户摆正头像的位置情况，不需要后台给出数据

**色调、亮度等调整的是何含义？**
如何调整？

应该不是转换，而是相对于原来的色彩做变换，是小范围的调整

**切缘和颈缘曲线的点**
```js
// 更新曲线采样点
const idMapUpper = [13,11,21,23], idMapLower = [14,13,11,21,23,24];

```
        
## 曲线

[catmull](https://github.com/actionnick/cat-rom-spline)
[gl-vec2](https://github.com/stackgl/gl-vec2)
[参考小程序1](https://blog.csdn.net/iamlujingtao/article/details/128289849)
[参考小程序2](https://gitee.com/dhzx/canvas-operation/tree/master)
[Polyfill for DOM Geometry Interfaces Module Level 1](https://github.com/jarek-foksa/geometry-polyfill/blob/master/geometry-polyfill.js)

## 问题

### scale是负值
调整时，如果超过最大值，可能产生负值，得到的scale就是一个负的，应用到轮廓线上就产生突变了。
需要控制，不能存储负值以避免突变的结果
