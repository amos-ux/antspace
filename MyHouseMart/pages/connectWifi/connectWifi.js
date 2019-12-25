let latitude, longitude
let e = require("../../utils/util.js");
var call = require("../../utils/call.js");
var cache = require("../../utils/cache.js");
let app = getApp()
let branchNo
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    if (options.openId) {
      cache.put("openId", options.openId)
      cache.put("shareType", options.shareType)
    }
    if (options.referenceCode){
      cache.put("referenceCode", options.referenceCode)
      cache.put("formId", options.formId)
    }
  },

  type() { //判断是不是  ios 如果是ios那直接进入页面不会触发 wifi页面
    let that = this
    wx.getLocation({
      type: 'gcj02',
      //还需要在这判断是否授权如果没有授权在 发起定位   ,授权过了就不发起
      success: function (res) {
        let data = {
          latitude: res.latitude,
          longitude : res.longitude
        }
        cache.put("data", data)
        latitude = res.latitude
        longitude = res.longitude
        that.instrument() 
      },
      fail(res) {
        wx.navigateTo({
          url: '/pages/orientation/orientation',
        })
      }
    })
  },
  branchSelect() { //店铺选择先加载
    if (cache.get("branchNo", "null")) {
      branchNo = cache.get("branchNo", "null")
    }
    let data = {
      'latitude': latitude,
      'longitude': longitude,
      "branchNo": branchNo
    }
    call.postData("/service-item/user/get/nearest/branch", data, (rest) => {
      app.globalData.chonseStoreId = rest.respData.branchNo;
      app.globalData.branch = rest.respData;
      // wx.navigateTo({
      //   url: '/my_member/JoinMember/JoinMember',
      // })
      wx.switchTab({
        url: '/pages/index/index',
      })
    })
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
    this.type() //连接wifi
  
  },
  instrument() {
    let that = this
    wx.getSetting({
      success(res) {
        if (res.authSetting["scope.userInfo"]) { //已经授权 登录
          that.login()
        } else { //未登录
          app.globalData.branchSelect = false
          app.globalData.id = true
          that.branchSelect()
        }
      }
    })
  },
  login() {
    let that = this
    e.wxLogin((res) => {
      console.log(res)
      let data = []
      call.postData("/service-member/weChat/login/" + res, data, (rest) => {
        cache.put("userId", rest.data)
        cache.put("sessionId", rest.sessionID)
        app.globalData.branchSelect = false
        app.globalData.id = true

        that.branchSelect()
      })
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

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