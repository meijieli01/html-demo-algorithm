# Change Log

## 2021.9.17
threeLoader中如果url相同，在加载过程中得到的可能是一个geometry对象，目前并没有区分，及把geometry.clone()一次来获取独立的
这个问题是在生产系统中保持器的问题，同一个模型的数据，暂时不拷贝多份

## 2021.9.16
函数的默认值不要使用在参数中，因为vue2不支持
```js
function badFunc(a, b = {}) {

}
function goodFunc(a, b) {
    b = b || {}
}
```

