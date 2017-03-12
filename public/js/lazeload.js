/**
 * @author beidan
 * @description 图片懒加载
 */
;(function () {
    /*
     * 函数功能：函数节流
     * fn  需要调用的函数
     * delay  函数需要延迟处理的时间
     * mustRunDelay  超过该时间，函数一定会执行
     * */
    var throttle = function (fn, delay, mustRunDelay) {
        var timer;  //使用闭包存储timer
        var t_start;
        //闭包返回的函数
        return function (val) {
            var args = arguments, t_curr = +new Date();  //使用+new Date() 将字符串转换成数字
            clearTimeout(timer);
            if (!t_start) {  // 使用!t_start 如果t_start=undefined或者null 则为true
                t_start = t_curr;
            }
            if (t_curr - t_start >= mustRunDelay) {
                fn.apply(null, args);
                t_start = t_curr;
            } else {
                timer = setTimeout(function () {
                    fn.apply(null, args);
                }, delay);
            }
        }
    };

    function LazyLoad() {
    }

    var download_count = 0,
        ele_obj = [];

    LazyLoad.prototype = {
        //放一些初始化的方法
        init: function () {
            this.initElementMap();
            this.lazy();
            this.throttleLoad();
        },
        getPosition: {
            /*
             获取屏幕可视窗口大小
             document.documentElement.clientHeight    IE/CH支持
             document.body.client    低版本混杂模式
             获取当前元素相对于窗口顶部的距离
             element.offsetTop
             滚动条滚动的距离
             document.documentElement.scrollTop   兼容ie低版本的标准模式
             document.body.scrollTop 兼容混杂模式；
             */
            Viewport: function () {
                if (document.compatMode == "BackCompat") {
                    //此时浏览器客户区宽度是document.body.clientWidth；
                    var Height = document.body.clientHeight;
                } else {
                    //浏览器客户区宽度是document.documentElement.clientWidth。
                    var Height = document.documentElement.clientHeight;
                }
                return Height;
            },
            ScrollTop: function () {
                if (document.compatMode == "BackCompat") {
                    var elementScrollTop = document.body.scrollTop;

                } else {
                    var elementScrollTop = document.documentElement.scrollTop == 0 ? document.body.scrollTop : document.documentElement.scrollTop;

                }
                return elementScrollTop;
            },
            ElementViewTop: function (ele) {
                if (ele) {
                    var actualTop = ele.offsetTop;
                    var current = ele.offsetParent;
                    while (current !== null) {
                        actualTop += current.offsetTop;
                        current = current.offsetParent;
                    }
                    return actualTop - this.ScrollTop();
                }
            }
        },
        //从所有相关元素中找出有lazy_src属性的元素
        initElementMap: function () {
            var el = document.getElementsByTagName('img');
            for (var j = 0, len2 = el.length; j < len2; j++) {
                //查找有lazy_src标签的img
                if (typeof (el[j].getAttribute("lazy_src"))) {
                    ele_obj.push(el[j]);
                    download_count++;
                }
            }
        },
        //防止多次加载
        lazy: function () {
            if (!download_count) return;
            var innerHeight = LazyLoad.prototype.getPosition.Viewport();
            for (var i = 0, len = ele_obj.length; i < len; i++) {
                var t_index = LazyLoad.prototype.getPosition.ElementViewTop(ele_obj[i]); //得到图片相对document的距上距离
                if (t_index < innerHeight) {
                    ele_obj[i].src = ele_obj[i].getAttribute("lazy-src");
                    ele_obj[i].removeAttribute("lazy-src");
                    delete ele_obj[i];
                    download_count--;
                }
            }
        },
        /*使用函数节流优化性能*/
        throttleLoad: function () {
            var throttle1 = throttle(LazyLoad.prototype.lazy, 200, 500);
            window.onscroll = window.onload = function () {
                throttle1();
            }
        },
    };
    window.LazyLoad = LazyLoad;
})()

