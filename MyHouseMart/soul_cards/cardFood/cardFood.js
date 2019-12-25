let request = require('../../utils/soul_chen')
var cache = require("../../utils/cache.js");
var call = require("../../utils/call.js");
let utils = require('../../utils/util.js')
let app = getApp()
let item,itemLIst,show
Page({
  data: {
    DiamondZone: [], //金刚区
    banner: [], //轮播数据
    hide: 'none', //购物车动画是否隐藏
    SINGLE: [], //单品主推
    ITEMRANK: [], //商品排行
    ITEMCLS: [], //类别推荐
    Advancesale: false,
    specification: false,
    dateAdvancesale: [], //预售事件段
    extOptions: [],
    hide_good_box: true,
    shopLength: 0,
    item: [],
    weather: '',
    dateTime: [],
    wendu: '',
    specification: [],
    option: false,
    options: [],
    extOptions: [],
  },
  onLoad(options) {
    let that = this
    console.log(app.globalData.show)
    itemLIst = JSON.parse(options.item)
    item=JSON.parse(options.item)
    this.setData({
      itemLIst:itemLIst,
      item:item
    })
    console.log(item)
    that.http()
    wx.setNavigationBarTitle({
      title: item.bizLineName
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: item.bizLineCode == 'OUTFOOD' || item.bizLineCode == 'COFFEE' ? '#ffffff' : '#FFEC14'
    })
    let data = {}
    call.getData(`/service-item/trolley/queryTrolleyCount?branchNo=${app.globalData.show ? "888888" : app.globalData.branch.branchNo}&sessionId=${cache.get("sessionId", this)}`, data, (res) => {
      this.setData({
        shopLength: res.respData
      })
    })
    this.busPos = {};
    this.busPos['x'] = 20; //购物车的位置
    this.busPos['y'] = app.globalData.hh - 50;
  },
  onShow() {

    let data = {}
    call.getData(`/service-item/trolley/queryTrolleyCount?branchNo=${app.globalData.branch.branchNo}&sessionId=${cache.get("sessionId", this)}`, data, (res) => {
      this.setData({
        shopLength: res.respData
      })
    })
  },
  // 购物车动画
  startAnimation: function() {
    var index = 0,
      that = this,
      bezier_points = that.linePos['bezier_points'],
      len = bezier_points.length - 1;
    this.setData({
      hide_good_box: false,
      bus_x: that.finger['x'],
      bus_y: that.finger['y']
    })
    this.timer = setInterval(function() {
      index++;
      that.setData({
        bus_x: bezier_points[index]['x'],
        bus_y: bezier_points[index]['y']
      })
      if (index >= len) {
        clearInterval(that.timer);
        that.setData({
          hide_good_box: true,
        })
      }
    }, 25);
  },
  onReady() {},
  dateChen(engNum) {
    switch (engNum + 1) {
      case 1:
        return '一'
      case 2:
        return '二'
      case 3:
        return '三'
      case 4:
        return '四'
      case 5:
        return '五'
      case 6:
        return '六'
      case 7:
        return '七'
      case 8:
        return '八'
      case 9:
        return '九'
      case 10:
        return '十'
      case 11:
        return '十一'
      case 12:
        return '十二'
    }
  },
  // 获取天气接口
  http() {
    let that = this
    if (item.bizLineCode == 'COFFEE') {
      wx.request({
        url: 'https://wis.qq.com/weather/common?source=xw&weather_type=forecast_1h|forecast_24h|index|alarm|limit|tips&province=%E5%B9%BF%E4%B8%9C&city=%E6%B7%B1%E5%9C%B3',
        header: {
          'content-type': 'application/json'
        },
        success(res) {
          console.log(res)
          let weather
          switch (res.data.data.forecast_1h['0'].weather) {
            case '晴':
              weather = '../../images/weather2.svg'
              break;
            case '阴':
              weather = '../../images/weather3.svg'
              break;
            case '多云':
              weather = '../../images/weather1.svg';
              break;
            default:
              weather = '../../images/weather4.svg';
          }
          let date = new Date()
          that.setData({
            weather,
            wendu: res.data.data.forecast_1h['0'].degree,
            dateTime: [date.getDate() < 10 ? '0' + date.getDate() : date.getDate(), that.dateChen(date.getMonth()), date.getFullYear()]
          })
        }
      })
    }
    wx.showNavigationBarLoading()
    wx.showLoading({
      title: '初始化...',
      mask: true
    })
    let data = {
      'branchNo': app.globalData.show ? "888888" : app.globalData.branch.branchNo,
      'blId': item.blId,
      'kkStatus': 'Y'
    }
    let Advertisement = {
      'branchNo': app.globalData.show ? "888888" : app.globalData.branch.branchNo,
      'code': 'business_home_banner1',
      'bizLine': item.bizLineCode
    }
    let SINGLE = {
      "branchNo": app.globalData.show ? "888888" : app.globalData.branch.branchNo,
      "blId": item.blId,
      "templateType": "SINGLE"
    }
    let ITEMRANK = {
      "branchNo": app.globalData.show ? "888888" : app.globalData.branch.branchNo,
      "blId": item.blId,
      "templateType": "ITEMRANK"
    }
    let ITEMCLS = {
      "branchNo": app.globalData.show ? "888888" : app.globalData.branch.branchNo,
      "blId": item.blId,
      "templateType": "ITEMCLS"
    }
    Promise.all([
      request.request('/service-item/public/template/kingkong/find/list', data, 'GET', false),
      request.request('/service-item/adverBanner/getWaterBarAdver', Advertisement, 'GET', false)
    ]).then(res => {
      this.setData({
        DiamondZone: res[0].respData,
        banner: res[1].respData,
      })
    })
    Promise.all(
      [
        request.request('/service-item/public/screen/push/item', ITEMRANK, 'POST', false),
        request.request('/service-item/public/screen/push/item', ITEMCLS, 'POST', false),
        request.request('/service-item/public/screen/push/item', SINGLE, 'POST', false),
      ]).then(res => {
      this.setData({
        ITEMRANK: res[0].respData != null ? res[0].respData[0] : [],
        ITEMCLS: res[1].respData,
        SINGLE: res[2].respData,
      })
      wx.hideLoading()
      wx.hideNavigationBarLoading()
    })
  },
  onHide(){
    app.globalData.show= false
  },
  onUnload(){
    app.globalData.show = false
  },

  toChoose(e) {
    wx.navigateTo({
      url: '/soul_cards/Choose/Choose?itemChild=' + JSON.stringify(e.currentTarget.dataset.item) + '&item=' + JSON.stringify(item)
    })
  },
  check(e) { //查看预售
    let stTimes = e.target.dataset.item
    if (stTimes.stTimes != null || stTimes.stTimes.leng != 0) {
      this.setData({
        Advancesale: true,
        dateAdvancesale: stTimes.stTimes
      })
    }
  },
  close() {
    this.setData({
      Advancesale: false
    })
  },
  //图片点击
  imgOclick(e) {
    let items = this.data.banner.advers[e.target.dataset.index].link
    // let parms=JSON.stringify({})
    const url = items.split('?')[0]
    const arr = items.split('?')[1].split('&')
    let item = {
      blId: arr[0],
      bizLineName: arr[1]
    }
    wx.navigateTo({
      url: url + '?item=' + JSON.stringify(item)
    })
  },
  specification() {
    this.setData({
      specification: false
    })
  },
  //关闭规格
  over() {
    this.setData({
      specification: false
    })
  },
  toShop(e) {
    let details = e.currentTarget.dataset.item
    console.log(e.currentTarget.dataset.item)
    details.remarksName = details.remarksName.replace("'", "").replace("&", "").replace("=", "");
    details.itemName = details.itemName.replace("'", "").replace("&", "").replace("=", "");
    wx.navigateTo({
      url: "/pages/goodsDetails/goodsDetails?details=" + JSON.stringify(details),
    })
  },
  toggleToast(e) {
    this.setData({
      shopLength: e.detail
    })
  },
  hide(e) {
    this.setData({
      option: e.detail
    })
  },
  shoppingcart(e) {
    let that = this
    wx.getSetting({
      success(res) {
        if (res.authSetting["scope.userInfo"]) {
          let data = {
            "sessionId": cache.get("sessionId", null),
            "itemNo": e.currentTarget.dataset.item.itemNo,
            "quantity": "1",
            "branchNo": app.globalData.show ? "888888" : app.globalData.branch.branchNo,
            "blId": e.currentTarget.dataset.item.blId,
            "isCombined": e.currentTarget.dataset.item.isCombined,
            "combSubItems": e.currentTarget.dataset.item.combSubItems
          }
          let item = e.target.dataset.item
          let option = item.extOptions
          let specification = item
          if(item.extOptions==null||item.extOptions.length==0){
            call.postData("/service-item/trolley/addItemToTrolley", data, (res) => {
              that.setData({
                shopLength: that.data.shopLength + 1
              })
              if (!that.data.hide_good_box) return;
              that.finger = {};
              var topPoint = {};
              that.finger['x'] = e.touches["0"].clientX;
              that.finger['y'] = e.touches["0"].clientY;
              if (that.finger['y'] < that.busPos['y']) {
                topPoint['y'] = that.finger['y'] - 150;
              } else {
                topPoint['y'] = that.busPos['y'] - 150;
              }
              topPoint['x'] = Math.abs(that.finger['x'] - that.busPos['x']) / 2;
              if (that.finger['x'] > that.busPos['x']) {
                topPoint['x'] = (that.finger['x'] - that.busPos['x']) / 2 + that.busPos['x'];
              } else {
                topPoint['x'] = (that.busPos['x'] - that.finger['x']) / 2 + that.finger['x'];
              }
              that.linePos = app.bezier([that.finger, topPoint, that.busPos], 20);
              that.startAnimation();
            }, (rest) => {
              wx.showToast({
                title: rest.respDesc,
                icon: 'none'
              })
            })
          }else{
            that.setData({
              specification: specification,
              options: option,
              option: true //显示规格
            })
          }
      
        } else {
          wx.navigateTo({
            url: '/pages/register/register',
          })
        }
      }
    })
  },
  shut(i) {
    let item = i.target.dataset.item,
      index = i.target.dataset.index,
      extOptions = this.data.extOptions
    for (let i = 0; i < item.options.length; i++) { //防止选择多个
      item.options[i].isShow = false
    }
    item.options[index].isShow = true;
    for (let i = 0; i < extOptions.extOptions.length; i++) {
      if (extOptions.extOptions[i].dataName == item.dataName) {
        extOptions.extOptions[i].options = item.options
        this.setData({
          extOptions: extOptions
        })
      }
    }
  },
  joinCart() {
    this.setData({ //购物车数量+1
      shopLength: this.data.shopLength + 1
    })
    console.log(this.data.extOptions) //加入购物车
  },
  Router(e) {
    let items = e.currentTarget.dataset.item
    console.log(e.currentTarget.dataset.item)
    const url = items.link.split('?')[0]
    const arr = items.link.split('?')[1].split('&')
    let item = {
      blId: arr[0],
      bizLineName: arr[1]
    }
    wx.navigateTo({
      url: url + '?item=' + JSON.stringify(item)
    })

    // `${e.currentTarget.dataset.item.path}?item=${e.currentTarget.dataset.item.link}`
  },
  RouterShop() {
    wx.navigateTo({
      url: '/pages/commonCart/commonCart'
    })
  },
  // 跳转到搜索详情页
  toSearch: function() {
    const that = this;
    wx.navigateTo({
      url: `/pages/shopSearch/shopSearch?blId=${that.data.item.blId}`,
    })
  },
  onShareAppMessage: function(options) {
    console.log(options)
    var that = this;
    // 设置转发内容
    var shareObj = {
      title: "我家小程序",
      path: '/pages/register/register', // 默认是当前页面，必须是以‘/’开头的完整路径
      imgUrl: '', //转发时显示的图片路径，支持网络和本地，不传则使用当前页默认截图。
      success: function(res) {　 // 转发成功之后的回调　　　　　

      },

    };

    return shareObj;
  },
})