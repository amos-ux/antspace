const e = require("/utils/util.js");
const cache = require("./utils/cache.js")
const ald = require('./utils/ald-stat.js')
let bool = false
App({
  // 生产环境
  baseUrl: "https://api.antspace.com/myhome/cloud/v1/",
  baseUrls:  "wss://api.antspace.com/myhome/cloud/v1/",

  // dev2
  // baseUrl: "http://10.0.0.12:8989/myhome/cloud/v1/",   
  // baseUrls:  "ws://10.0.0.12:8989/myhome/cloud/v1/", 

  // pp
  // baseUrl: "https://wongkimshing.iask.in/myhome/cloud/v1/",
  // baseUrls: "ws://10.0.0.31:31899/myhome/cloud/v1/",

  // test环境
  // baseUrl: "https://antspace-dev.oicp.vip/myhome/cloud/v1/",
  // baseUrls: "wss://antspace-dev.oicp.vip/myhome/cloud/v1/",

  // 测试环境
  // baseUrl: "http://10.0.0.31:31899/myhome/cloud/v1/",

  globalData: {
    //存储店铺号
    branchNo:"",
    seckillDetail: [],
    id: true,
    search: false,
    totalPrice: 0,//优惠价
    originaPrice: 0,//原价
    order: [],//购物车数据
    disPrice: 0,
    refreshOrder: true,//跳转订单是否刷新
    setMeal: [],
    comMeal: [],
    orderShow: false,
    commodityList: false,
    linkParam1: null,
    linkParam2: null,
    userInfa: null,
    appType: "",
    version: "110",
    orderData: [],
    screenBrightness: null,
    chonseStoreId: null,
    totalFee: null,
    payStatus: null,
    signingStatus: false,
    branch: {},
    message: [],  //售后服务
    messages: [], //申请退款
    invoice: [],  //申请开票
    invoiceState: [],//开票成功开票中
    user: false,
    quit: false,
    cardremind: true,//是否展示券提醒
    popUp:{},
    skip:false,
    number:"",   //弹窗数据
    mall:false,//是不是商城
  },
  onLaunch: function (e) {
    bool = true
    wx.clearStorage();
    let that = this
    wx.getSystemInfo({//  获取页面的有关信息                         
      success: function (res) {
        let ww = res.windowWidth;
        let hh = res.windowHeight;
        that.globalData.ww = ww;
        that.globalData.hh = hh;
      }
    });
    wx.getScreenBrightness({
      success: function (res) {
        that.globalData.screenBrightness = res.value;
      }
    });
  },
  onShow: function (res) {
//获取面对面邀请 内邀码
    if (res.query.scene){
      let code = res.query.scene
      let sence = code.split("-")
      cache.put("referenceCode", sence[1])
    }
    
    let that = this
    that.globalData.cardremind = true
    wx.checkSession({
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
        that.globalData.quit = true
        console.log("需要重新登录");
      }
    })
  },
  //获取屏幕[宽、高]
  screenSize: function () {
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.ww = res.windowWidth;
        that.globalData.hh = res.windowHeight;
      }
    })
  },
  /**
      * @param sx 起始点x坐标
      * @param sy 起始点y坐标
      * @param cx 控制点x坐标
      * @param cy 控制点y坐标
      * @param ex 结束点x坐标
      * @param ey 结束点y坐标
      * @param part 将起始点到控制点的线段分成的份数，数值越高，计算出的曲线越精确
      * @return 贝塞尔曲线坐标
     */
  bezier: function (points, part) {
    let sx = points[0]['x'];
    let sy = points[0]['y'];
    let cx = points[1]['x'];
    let cy = points[1]['y'];
    let ex = points[2]['x'];
    let ey = points[2]['y'];
    let bezier_points = [];
    // 起始点到控制点的x和y每次的增量
    let changeX1 = (cx - sx) / part;
    let changeY1 = (cy - sy) / part;
    // 控制点到结束点的x和y每次的增量
    let changeX2 = (ex - cx) / part;
    let changeY2 = (ey - cy) / part;
    //循环计算
    for (let i = 0; i <= part; i++) {
      // 计算两个动点的坐标
      let qx1 = sx + changeX1 * i;
      let qy1 = sy + changeY1 * i;
      let qx2 = cx + changeX2 * i;
      let qy2 = cy + changeY2 * i;
      // 计算得到此时的一个贝塞尔曲线上的点
      let lastX = qx1 + (qx2 - qx1) * i / part;
      let lastY = qy1 + (qy2 - qy1) * i / part;
      // 保存点坐标
      let point = {};
      point['x'] = lastX;
      point['y'] = lastY;
      bezier_points.push(point);
    }
    //console.log(bezier_points)
    return {
      'bezier_points': bezier_points
    };
  },
  onHide: function () {
    let that = this;
    wx.closeSocket();
    wx.setScreenBrightness({
      "value": that.globalData.screenBrightness
    });
  },
  getSystemInfo: function () {
    let e = this;
    wx.getSystemInfo({
      success: function (t) {
        t.model.indexOf("iPhone");
        t.model.indexOf("iPhone") > -1 ? e.globalData.appType = 2 : e.globalData.appType = 1,
          wx.setStorageSync("version", e.globalData.version), wx.setStorageSync("sysVersion", t.system),
          wx.setStorageSync("sysType", t.model), wx.setStorageSync("appType", e.globalData.appType);
      }
    });
  },
  getBranch: function () {
    let that = this;
  },
  getLocation: function (e, t) {
    wx.getLocation({
      type: "wgs84",
      success: function (t) {
        let a = (1e6 * t.latitude).toString(16),
          o = (1e6 * t.longitude).toString(16);
        if (a.length < 8)
          for (n = 0; n < 8 - a.length; n++) a = "0" + a;
        if (o.length < 8)
          for (let n = 0; n < 8 - o.length; n++) o = "0" + o;
        e(a + o);
      },
      fail: function () {
        t(null);
      }
    });
  },
  showToast: function (e, t, a) {
    let o = t;
    a = parseInt(a) ? parseInt(a) : 3e3, o.setData({
      toastText: e,
      isShowToast: !0
    }), setTimeout(function () {
      o.setData({
        isShowToast: !1
      });
    }, a);
  },
  /**
   * 防抖函数 非立即执行
   * 规定时间内 最后一次点击有效
   */
  debounce: function (fn, interval) {
    let timeout;
    let gapTime = interval || 1000;//间隔时间，如果interval不传，则默认1000ms
    return function () {
      let context = this;
      let args = arguments;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        fn.apply(context, args)
      }, gapTime);
    }
  },
  /**
   * 防抖函数 立即执行
   * 规定时间内 第一次点击有效
   */
  debounce1: function (fn, interval) {
    let timeout;
    let gapTime = interval || 1000;//间隔时间，如果interval不传，则默认1000ms
    return function () {
      let context = this;
      let args = arguments;
      if (timeout) clearTimeout(timeout);
      let callNow = !timeout;
      timeout = setTimeout(() => {
        timeout = null;
      }, gapTime)
      if (callNow) fn.apply(context, args)
    }
  },
  // 节流函数
  throttle: function (fn, interval) {
    let enterTime = 0;//触发的时间
    let gapTime = interval || 300;//间隔时间，如果interval不传，则默认300ms
    return function () {
      let context = this;
      let backTime = new Date();//第一次函数return即触发的时间
      if (backTime - enterTime > gapTime) {
        fn.call(context, arguments);
        enterTime = backTime;//赋值给第一次触发的时间，这样就保存了第二次触发的时间
      }
    };
  },
  // 数组去重
  unique: function (arr) {
    return Array.from(new Set(arr))
  },
  // 数组去空
  trimSpace: function (arr) {
    return arr.filter(item => item);
  },
  // 将时间戳改成真实时间
  timeTrans: function (date) {
    let total = date;
    let day = parseInt(total / (24 * 60 * 60)); //计算整数天数
    let afterDay = total - day * 24 * 60 * 60; //取得算出天数后剩余的秒数
    let hour = parseInt(afterDay / (60 * 60)); //计算整数小时数
    let afterHour = total - day * 24 * 60 * 60 - hour * 60 * 60; //取得算出小时数后剩余的秒数
    let min = parseInt(afterHour / 60); //计算整数分
    let afterMin = total - day * 24 * 60 * 60 - hour * 60 * 60 - min * 60; //取得算出分后剩余的秒数
    hour = hour < 10 ? "0" + parseInt(hour) : parseInt(hour)
    min = min < 10 ? "0" + parseInt(min) : parseInt(min)
    afterMin = afterMin < 10 ? "0" + parseInt(afterMin) : parseInt(afterMin)
    return [hour, min, afterMin]
  },
});