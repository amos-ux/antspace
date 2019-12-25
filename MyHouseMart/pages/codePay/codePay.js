import QRCode from '../../utils/qrcode.js'
const app = getApp();
const call = require("../../utils/call.js");
const confirm = require("../../utils/confirm.js");
const cache = require("../../utils/cache.js");
const webSocket = require('../../utils/webSocket.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    qrcodeIndex: "",
    showModalStatus: false,
    show: false,
    message: null,
    money: 0,
    radarImg: null,
    showCanvas: false
  },
  qrcode(data) {
    new QRCode('myQrcode', {
      text: data,
      width: 200,
      height: 200,
    })
  },
  //账户余额
  account() {
    let data = []
    call.getData("/service-member/public/get/account/amt/" + cache.get("userId", "null"), data, (res) => {
      console.log(res)
      if (res.respData !== null && res.respData.length !== 0) {
        this.setData({
          money: res.respData,
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '加载中',
    })
    setTimeout(() => {
      wx.hideLoading()
    }, 500)
    setTimeout(() => {
      // 创建连接
      webSocket.connectSocket(`${app.baseUrls}service-member/webSocket/get/qrCode/${wx.getStorageSync('sessionId')}`);
      // 设置接收消息回调
      webSocket.onSocketMessageCallback = this.onSocketMessageCallback;
    }, 200)
    this.luminance(1)
  },

  // socket收到的信息回调
  onSocketMessageCallback: function(msg) {
    let message = JSON.parse(msg)
    this.setData({
      parse: message,
    })
    this.parse()
  },
  parse() {
    if (this.data.parse.resultCode == "flushCode") {
      if (this.data.show) { //微信支付二维码
        this.setData({
          message: this.data.parse.data,
          qrcodeIndex: this.data.parse.data + "-00001133"
        })
        this.qrcode(this.data.qrcodeIndex)
      } else { //钱包支付
        this.setData({
          message: this.data.parse.data,
          qrcodeIndex: this.data.parse.data + "-00001122"
        })
        this.qrcode(this.data.qrcodeIndex)
      }
    } else if (this.data.parse.resultCode == "startPay") {
      if (this.data.parse.data.timeStamp) {
        confirm.pay(this.data.parse, (res) => {
          console.log(res)
        }, (res) => {
          console.log(res)
        })
      } else {
        //钱包支付
        wx.navigateTo({
          url: `../paySuc/paySuc?payprice=${this.data.parse.data.payPrice}&payType=wallet`
        })
      }
    }
  },
  luminance(data) {
    wx.setScreenBrightness({
      value: data,
      success() {
        wx.setKeepScreenOn({
          keepScreenOn: true
        })
      },
    })
  },
  onUnload: function(options) {
    webSocket.closeSocket(); //关闭websock连接
    this.luminance(cache.get("luminance", this)) //关闭屏幕亮度
  },
  //打开选择
  powerDrawer: function(e) {
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
  },

  //关闭
  util: function(currentStatu) {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });
    this.animation = animation;
    animation.translateY(360).step();
    this.setData({
      animationData: animation.export()
    })
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
      //关闭弹窗
      if (currentStatu == "close") {
        console.log("关闭了")
        this.setData({
          showModalStatus: false,
          showCanvas: false
        });
        console.log(this.data.showModalStatus)
        console.log(this.data.showCanvas)
      }
    }.bind(this), 200)
    if (currentStatu == "open") {
      console.log("我打开了")
      this.setData({
        showModalStatus: true,
        showCanvas: true
      });
      console.log(this.data.showModalStatus)
      console.log(this.data.showCanvas)
    }
  },
  //钱包支付选择
  walletPay() {
    this.setData({
      show: false,
      showModalStatus: false,
      qrcodeIndex: this.data.message + "-00001122",
      showCanvas: false
    })
    this.qrcode(this.data.qrcodeIndex)
  },
  //微信支付选择
  wxPay() {
    console.log(this.data.showCanvas)
    this.setData({
      show: true,
      showModalStatus: false,
      qrcodeIndex: this.data.message + "-00001133",
      showCanvas: false
    })
    this.qrcode(this.data.qrcodeIndex)
  },
  //关闭弹窗
  shut() {
    this.setData({
      showModalStatus: false,
      showCanvas: false
    })
  },
  close() {

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.account()
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})