// pages/newOrder/newOrder.js
var app = getApp();
var cache = require("../../utils/cache.js");
import QRCode from '../../utils/qrcode.js'
import request from '../../utils/my_page'
var call = require("../../utils/call.js")
var orderData = [],timer
Page({

  /**user/order/calculate/price
  
   * 页面的初始数据
   */
  data: {
    quit: false,
    qrcodeIndex: "000000000000000",
    yard: false,
    nav: [{
      name: "全部",
      type: 'All'
    }, {
      name: "待支付",
      type: "Paid"
    }, {
      name: "配货中",
      type: "Catgo"
    }, {
      name: "待自提/配送中",
      type: "Distribution"
    }, {
      name: "售后/退款",
      type: "Refund"
    }],
    i: 0,
    pageNumber: 1,
    pageSize: 5,
    status: "",
    ordeMessage: [],
    total: 0,
    userAuthorization: true,
    model:false,
    payOff:true
  },
  qrcode(data) {
    new QRCode('myQrcode', {
      text: data,
      width: 150,
      height: 150,
    })
  },
  //导航栏点击
  clickNav(e) {
    if (this.data.userAuthorization){
      let type = e.currentTarget.dataset.type
      let index = e.currentTarget.dataset.index
      let pageSize = this.data.pageSize
      if (index != this.data.i) {
        this.setData({
          i: index
        })
        if (type == "All") { //全部
          orderData = []
          this.setData({
            status: "",
            pageNumber: 1
          })
          this.orderData(this.data.pageNumber, pageSize, this.data.status)
        } else if (type == "Paid") { //待支付
          orderData = []
          this.setData({
            status: "UNPAID",
            pageNumber: 1
          })
          this.orderData(this.data.pageNumber, pageSize, this.data.status)
        } else if (type == "Catgo") { //配货中
          orderData = []
          this.setData({
            status: "PICKING",
            pageNumber: 1
          })
          this.orderData(this.data.pageNumber, pageSize, this.data.status)
        } else if (type == "Distribution") { //待自提/配货中
          orderData = []
          this.setData({
            status: "DISPATCHING",
            pageNumber: 1
          })
          this.orderData(this.data.pageNumber, pageSize, this.data.status)
        } else if (type == "Refund") { //售后/退款
          orderData = []
          this.setData({
            status: "COMPLETED_AFTER",
            pageNumber: 1
          })
          this.orderData(this.data.pageNumber, pageSize, this.data.status)
        }
      }
    }
  },
  onShow() {
    if (app.globalData.quit) {
      this.setData({
        quit: false
      })
    }
    let that = this
    wx.getSetting({
      success(res) {
        // that.orderData(1, 5, that.data.nav[that.data.i].type)
        if (res.authSetting["scope.userInfo"]) { //true  代表已经获取信息
          that.setData({
            userAuthorization: true
          })
          console.log(app.globalData.refreshOrder)
          if (app.globalData.refreshOrder) {
            orderData = []
            setTimeout(() => {
              that.orderData(1, 5, that.data.status)
            }, 100)
            app.globalData.refreshOrder = false
          }
        } else {
          that.setData({
            userAuthorization: false
          })
        }
      }
    })
  },
  //获取订单数据saleOrder/findOrderBySessionId  elasticSearch/order/sessionId
  orderData(pageNumber, pageSize, status) {
    let data = []
    wx.showLoading({
      title: '加载中',
    })
    call.getData("/service-order-prc/elasticSearch/order/sessionId?sessionId=" + cache.get("sessionId", "null") + "&pageNumber=" + pageNumber + "&pageSize=" + pageSize + "&orderStatus=" + status, data, (res) => {
      wx.hideLoading()
      let resp = res.respData.data
      wx.stopPullDownRefresh() //停止下拉动画
      resp.forEach(i => orderData.push(i))
      this.setData({
        ordeMessage: orderData,
        total: res.respData.total
      })
      resp.forEach(i => {
        if (i.orderStatus == 'UNPAID') {
          this.countTime(i)
        }
      })
    }, (res) => {
      wx.hideLoading()
    })
  },
  
  //倒计时取消订单
  countTime: function(a) {
    var that = this;
    console.log(a)
    if (a) {
      var date = new Date();
      var endDate = new Date(a.createdDate.replace(/\-/g, '/'));
      var now = date.valueOf();
      var end = endDate.valueOf()*1 + 1800000;
      var leftTime = end - now;
      var d, h, m, s, ms;
      if (leftTime >= 0) {
        d = Math.floor(leftTime / 1000 / 60 / 60 / 24);
        h = Math.floor(leftTime / 1000 / 60 / 60 % 24);
        m = Math.floor(leftTime / 1000 / 60 % 60);
        s = Math.floor(leftTime / 1000 % 60);
        ms = Math.floor(leftTime % 1000);
        ms = ms < 100 ? "0" + ms : ms
        s = s < 10 ? "0" + s : s
        m = m < 10 ? "0" + m : m
        h = h < 10 ? "0" + h : h
        timer=setTimeout(that.countTime, 100);
      } else {
        clearTimeout(timer)
        let data = {
          "orderNo": a.orderNo,
          "orderStatus": "CANCELLED",
          "pickupCode": a.pickupCode,
          "orderType": a.orderType,
        }
        call.postData("/service-order-prc/saleOrder/updateOrderStatus", data, (res) => {
          orderData = []
          that.orderData(1, that.data.pageSize, that.data.status)
        }, (res) => {})
      }
    }
  },
  //立即支付
  pay(e) {
    let that = this;
    let item = e.currentTarget.dataset.item
    if(that.data.payOff==true){
      that.setData({
        payOff:false
      })
      let sessionId = cache.get('sessionId', 'null');
      let data = []
      call.getCookie("/service-member/proceed/pay/" + item.orderNo, "JSESSIONID=" + sessionId, data, (rest) => {
        wx.requestPayment({
          timeStamp: rest.respData.timeStamp,
          nonceStr: rest.respData.nonceStr,
          package: rest.respData.packageValue,
          signType: rest.respData.signType,
          paySign: rest.respData.paySign,
          success(res) {
            that.orderData(1, that.data.pageSize, that.data.status)
            app.globalData.refreshOrder = true
            wx.showToast({
              icon: "none",
              title: '支付成功',
            })
          },
          fail(res) {
            that.setData({
              payOff:true
            })
            wx.showToast({
              title: '支付失败',
              icon: 'none'
            })
          }
        })
      }, (res) => {
        wx.showToast({
          title: res.respDesc,
          icon:"none"
        })
      })
    }else{

    }

  },
  //取消订单
  cancel(e) {
    let item = e.currentTarget.dataset.item
    let that = this
    wx.showModal({
      title: '提示',
      content: "确定取消订单吗",
      success(res) {
        if (res.confirm) {
          let data = {
            "orderNo": item.orderNo,
            "orderStatus": "CANCELLED",
            "pickupCode": item.pickupCode,
            "orderType": item.orderType,
          }
          call.postData("/service-order-prc/saleOrder/updateOrderStatus", data, (res) => {
            orderData = []
            wx.showToast({
              icon: "none",
              title: '取消订单成功',
            })
            setTimeout(() => {
              that.orderData(1, 5, that.data.status)
            }, 500)
          }, (res) => {
            wx.showToast({
              icon: "none",
              title: res.respDesc,
            })
          })
        } else if (res.cancel) {}
      }
    })
  },
  goLogin() {
    wx.navigateTo({
      url: '/pages/register/register',
    })
  },
  onPullDownRefresh() {
    let {userAuthorization}=this.data
    if(userAuthorization){
      this.setData({
        pageNumber:1,
        pageSize:5,
      })
      orderData = []
      this.orderData(1, 5, this.data.status)
    }

  },
  //上拉加载
  onReachBottom: function() {
    if (this.data.userAuthorization) {
      if (this.data.total < orderData.length) {
        wx.showToast({
          title: '已经到底了哦',
          icon: 'none'
        })
        setTimeout(() => {
          wx.hideLoading()
        }, 500)
      } else {
        let pageNumber = this.data.pageNumber + 1
        let pageSize = this.data.pageSize
        this.setData({
          pageNumber: pageNumber
        })
        wx.showLoading({
          title: '加载中...',
        })
        setTimeout(() => {
          wx.hideLoading()
        }, 500)
        this.orderData(pageNumber, pageSize, this.data.status)
      }
    }
  },
  //显示二维码
  clickYard(e) {
    console.log(e)
    let item = e.currentTarget.dataset.item
    // if (item.cabinetGridNo == "") {
      var supplierNo = "NORMAL"
    // } else {
    //   var supplierNo = "SUPPLIERNO"
    // }
    this.setData({
      yard: true,
      qrcodeIndex: supplierNo + "-" + item.orderNo + "-" + item.pickupCode + "-" + item.orderType + "-" + "COMPLETED",
      codeItem:item
    })
    this.qrcode(this.data.qrcodeIndex)
  },
  //跳转订单详情
  orderDetail: function(e) {
    let item = e.currentTarget.dataset.item
    app.globalData.orderData = item
    wx.navigateTo({
      url: '../newOrderdetail/newOrderdetail',
      success() {
        
      }
    })
  },
  //关闭二维码显示
  padlock() {
    this.setData({
      yard: false
    })
  },
  onShareAppMessage: function(options) {
    var that = this;
    // 设置转发内容
    var shareObj = {
      title: "我家小程序",
      path: '/pages/connectWifi/connectWifi', // 默认是当前页面，必须是以‘/’开头的完整路径
      imgUrl: '', //转发时显示的图片路径，支持网络和本地，不传则使用当前页默认截图。
      success: function(res) {　 // 转发成功之后的回调　　　　　
      },
    };
    return shareObj;
  },
  // 阻止冒泡事件
  stopBubble:function(){
    return false;
  },
  // 阻止事件向下传递
  preventTouchMove() {
    wx.stopPullDownRefresh();//禁止下拉刷新
  },
  toLogIstics(e){
    const item=e.currentTarget.dataset.item
    wx.navigateTo({
      url:'/OrderList/logistics/logistics?orderNo='+item.orderNo
    })
  },
  isModel(e){
    const item=e.currentTarget.dataset.item
    const index=e.currentTarget.dataset.index
    this.setData({
      model:true,
      confirmOrderNo:item.orderNo,
      confirmIndex:index
    })
  },
  confirmReceipt(){
    request('/service-order-prc/applet/order/notarize/'+this.data.confirmOrderNo,{},true,'GET').then(res=>{
      wx.showToast({
        title:'收货成功',
      })
      // const {confirmIndex,ordeMessage}=this.data
      // let list=[...ordeMessage]
      // list[confirmIndex].userConfirmed='已收货'
      // list[confirmIndex].orderType='DIST'
      this.setData({
        pageNumber:1,
        pageSize:5,
        model:false,
      })
      orderData = []
      this.orderData(1, 5, this.data.status)
    })
  },
  closeModel(){
    this.setData({
      model:false
    })
  }
})