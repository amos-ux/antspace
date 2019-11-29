// pages/take/take.js
const cache = require("../../utils/cache.js");
const app = getApp();
const url = app.baseUrl + "service-mall/";
Page({
  data: {
    checked: false,
    region: [],
    userName: null,
    userNumber: null,
    provinceName: null,
    cityName: null,
    regionName: null,
    locDetail: null,
    memberAddressType: "",
    defaultAddress: "N",
    latitude: null,
    longitude: null,
    detailedAddress: null,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  // 联系人
  inputeidt: function(e) {
    let that = this
    that.data.userName = e.detail.value
  },
  // 手机号码
  inputPhone: function(i) {
    let that = this
    that.data.userNumber = i.detail.value
  },
  // 门牌号
  inputHouse: function(b) {
    let that = this
    that.data.detailedAddress = b.detail.value
  },
  // 设置默认地址
  checkboxChange(e) {
    let that = this
    that.setData({
      checked: !that.data.checked
    })
  },
  // 收货地址
  skip: function() {
    wx.navigateTo({
      url: '../mymoney/mymoney',
    })
  },
  getUsersInfo: function() {
    let that = this;
    //读取缓存登录
    wx.getStorage({
      key: 'userInfo',
      success: function(res) {
        that.setData({
          latitude: res.data,
        })
      }
    })
    wx.getStorage({
      key: 'userInf',
      success: function(res) {
        that.setData({
          longitude: res.data,
        })
      }
    })
  },
  // 节流 保存地址
  saveDebounce: app.debounce1(function() {
    this.save()
  }, 1000),
  save: function() {
    let that = this
    const myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(19[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(16[0-9]{1})|(14[0-9]{1}))+\d{8})$/;
    if (that.data.userName == null) {
      that.showToast('用户名不能为空哦')
      return false;
    }
    if (that.data.userNumber==null) {
      that.showToast('电话号码不能为空哦')
      return false;
    }
    if (!myreg.test(that.data.userNumber)) {
      that.showToast('电话号码有误哦')
      return false;
    }
    if (that.data.locDetail == null) {
      that.showToast('收货地址还没填写呢')
      return false;
    }
    if (that.data.detailedAddress == null) {
      that.showToast('详细地址不能为空哦')
      return false;
    }
    wx.showLoading({
      title: '加载中...',
    })
    if (that.data.checked == true) {
      that.setData({
        defaultAddress: "Y"
      })
    } else {
      that.setData({
        defaultAddress: "N"
      })
    }
    wx.request({
      url: url + 'address/user/save/address',
      method: "PUT",
      data: {
        "userId": cache.get('userId', "null"),
        "userName": that.data.userName,
        "userNumber": that.data.userNumber,
        "provinceName": that.data.provinceName,
        "cityName": that.data.cityName,
        "regionName": that.data.regionName,
        "latitude": that.data.latitude,
        "longitude": that.data.longitude,
        "locDetail": that.data.locDetail,
        "memberAddressType": that.data.memberAddressType,
        "defaultAddress": that.data.defaultAddress,
        "detailedAddress": that.data.detailedAddress
      },
      success: function() {
        wx.hideLoading()
        wx.navigateBack()
      }
    })
  },
  // 选择公司
  compony: function() {
    this.setData({
      memberAddressType: "company",
    })
  },
  // 选择住宅
  home: function() {
    this.setData({
      memberAddressType: "home",
    })
  },
  // 验证提示
  showToast:function(tips){
    wx.showToast({
      title: tips,
      icon: 'none'
    })
    setTimeout(function(){
      wx.hideToast()
    },1000)
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
    this.getUsersInfo()
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