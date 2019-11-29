const cache = require("../../utils/cache.js");
const app = getApp();
const url = app.baseUrl + "service-mall/";
Page({
  data: {
    region: [],
    locationId: null,
    message: {},
    change: null,
    name: null,
    provinceName: null,
    cityName: null,
    regionName: null,
    checked: false,
    defaultAddress: "N",
    checkValue: '',
    longitude: null,
    latitude: null,
    detailedAddress: null,
    memberAddressType: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    if (JSON.parse(options.p).defaultAddress == 'Y') {
      that.setData({
        checked: true,
      })
    }
    that.setData({
      memberAddressType: JSON.parse(options.p).memberAddressType ? JSON.parse(options.p).memberAddressType : ''
    })
    wx.request({
      url: url + 'address/user/get/addressDetail/' + JSON.parse(options.p).locationId,
      method: "POST",
      success(rest) {
        that.setData({
          locationId: JSON.parse(options.p).locationId,
          message: rest.data.respData,
          cityName: rest.data.respData.cityName,
          provinceName: rest.data.respData.provinceName,
          regionName: rest.data.respData.regionName,
          longitude: rest.data.respData.longitude,
          latitude: rest.data.respData.latitude,
          locDetail: rest.data.respData.locDetail
        })
      }
    })
  },
  // 获取用户信息
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
  // 收货地址
  skip: function() {
    wx.navigateTo({
      url: '../mymoney/mymoney',
    })
  },
  // 设置默认地址
  checkboxChange(e) {
    this.setData({
      checked: !this.data.checked
    })
  },
  // 节流 保存地址
  saveDebounce: app.debounce1(function () {
    this.save()
  }, 1000),
  // 保存地址
  save: function() {
    let that = this
    const myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(19[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(16[0-9]{1})|(14[0-9]{1}))+\d{8})$/;
    if (that.data.message.userName == '') {
      that.showToast('用户名不能为空哦');
      return false;
    }
    if (that.data.message.userNumber=='') {
      that.showToast('电话号码不能为空哦')
      return false;
    }
    if (!myreg.test(that.data.message.userNumber)) {
      that.showToast('电话号码有误哦')
      return false;
    }
    if (that.data.message.locDetail == '') {
      that.showToast('收货地址还没填写呢')
      return false;
    }
    if (that.data.message.detailedAddress == '') {
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
      url: url + 'address/user/address/update',
      method: "POST",
      data: {
        "userId": cache.get('userId', "null"),
        "userName": that.data.message.userName,
        "userNumber": that.data.message.userNumber,
        "latitude": that.data.latitude,
        "memberAddressType": that.data.memberAddressType,
        "longitude": that.data.longitude,
        "locDetail": that.data.locDetail,
        "defaultAddress": that.data.defaultAddress,
        "locationId": that.data.message.locationId,
        "detailedAddress": that.data.message.detailedAddress,
        "cityName": that.data.message.cityName,
        "provinceName": that.data.message.provinceName,
        "regionName": that.data.message.regionName,
      },
      success: function() {
        wx.hideLoading()
        wx.navigateBack()
      }
    })
  },
  compony: function() {
    let that = this
    that.setData({
      memberAddressType: "company",
    })
    if (that.data.memberAddressType == "company" && that.data.memberAddressType == "home") {
      that.setData({
        memberAddressType: "",
      })
    }
  },
  home: function() {
    let that = this
    that.setData({
      memberAddressType: "home",
    })
  },
  // 联系人
  inputeidt: function(e) {
    let that = this
    that.data.message.userName = e.detail.value
  },
  // 手机号码
  inputPhone: function(i) {
    let that = this
    that.data.message.userNumber = i.detail.value
  },
  // 门牌号
  inputHouse: function(b) {
    let that = this
    that.data.message.detailedAddress = b.detail.value
  },
  // 删除地址
  delete: function() {
    let that = this
    wx.request({
      url: url + 'address/user/del/address/by/' + that.data.locationId,
      method: "POST",
      success: function(res) {
        wx.navigateBack()
      }
    })
  },
  onShow: function() {
    let that = this
    that.getUsersInfo()
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
  }
})