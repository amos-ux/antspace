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
    memberAddressType: "",
    locDetail: '',//详细地址
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    const details = decodeURIComponent((options.p))
    that.setData({
      checked: JSON.parse(details).defaultAddress == 'Y' ? true : false,
      memberAddressType: JSON.parse(details).memberAddressType ? JSON.parse(details).memberAddressType : ''
    })
    wx.request({
      url: url + 'address/user/get/addressDetail/' + JSON.parse(details).locationId,
      method: "POST",
      success(rest) {
        that.setData({
          locationId: JSON.parse(details).locationId,
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
  getUsersInfo: function () {
    let that = this;
    //读取缓存登录
    wx.getStorage({
      key: 'userInfo',
      success: function (res) {
        if (typeof res.data != 'object') {
          that.setData({
            latitude: res.data,
          })
        }
      }
    })
    wx.getStorage({
      key: 'userInf',
      success: function (res) {
        that.setData({
          longitude: res.data,
        })
      }
    })
  },
  // 收货地址
  skip: function () {
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
  // 节流 修改地址
  saveDebounce: app.debounce1(function () {
    this.save()
  }, 1000),
  // 修改地址
  save: function () {
    let that = this
    const myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(19[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(16[0-9]{1})|(14[0-9]{1}))+\d{8})$/;
    const namereg = /^[A-Za-z0-9\u4e00-\u9fa5]+$/;
    const detailreg = /[`@#$^&*''@#￥&*]/g
    const {locDetail} = that.data
    const {userName,userNumber,detailedAddress} = that.data.message
    if (userName == '') {
      that.showToast('用户名不能为空哦');
      return false;
    }else if(!namereg.test(userName)){
      that.showToast('用户名有误哦')
      return false;
    }else if (userNumber == '') {
      that.showToast('电话号码不能为空哦')
      return false;
    }else if (!myreg.test(userNumber)) {
      that.showToast('电话号码有误哦')
      return false;
    }else if (locDetail == '') {
      that.showToast('收货地址还没填写呢')
      return false;
    }else if (detailedAddress == '') {
      that.showToast('详细地址不能为空哦')
      return false;
    }else if(detailreg.test(detailedAddress)){
      that.showToast('详细地址有误哦')
      return false;
    }else{
      wx.showLoading({ title: '加载中...' })
      that.setData({
        defaultAddress: that.data.checked ? "Y" : "N"
      })
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
        success: function (res) {
          if (res.data.respCode == '0000' || res.data.code == "00") {
            wx.hideLoading()
            wx.navigateBack()
          } else {
            wx.hideLoading()
            that.showToast(res.data.respDesc)
          }
        },
        fail: function () {
          wx.hideLoading()
          that.showToast('修改收货地址失败')
        }
      })
    }
  },
  compony: function () {
    let that = this
    that.setData({
      memberAddressType: "company",
    })
  },
  home: function () {
    let that = this
    that.setData({
      memberAddressType: "home",
    })
  },
  // 联系人
  inputeidt: function (e) {
    let that = this
    let { message } = that.data
    message.userName = e.detail.value
    that.setData({ message })
  },
  // 手机号码
  inputPhone: function (e) {
    let that = this
    let { message } = that.data
    message.userNumber = e.detail.value
    that.setData({ message })
  },
  // 门牌号
  inputHouse: function (e) {
    let that = this
    let { message } = that.data
    message.detailedAddress = e.detail.value
    that.setData({ message })
  },
  // 删除地址
  delete: function () {
    let that = this
    wx.request({
      url: url + 'address/user/del/address/by/' + that.data.locationId,
      method: "POST",
      success: function (res) {
        if (res.data.respCode == '0000' || res.data.code == "00") {
          wx.navigateBack()
        } else {
          that.showToast(res.data.respDesc)
        }
      },
      fail: function () {
        that.showToast('删除地址失败')
      }
    })
  },
  onShow: function () {
    let that = this
    that.getUsersInfo()
  },
  // 验证提示
  showToast: function (tips) {
    wx.showToast({
      title: tips,
      icon: 'none'
    })
    setTimeout(function () {
      wx.hideToast()
    }, 1000)
  },
  // 过滤json特殊字符
  valueReplace: function (v) {
    if (v.indexOf("\"") != -1) {
      v = v.toString().replace(new RegExp('(["\"])', 'g'), "\\\"");
    }
    else if (v.indexOf("\\") != -1)
      v = v.toString().replace(new RegExp("([\\\\])", 'g'), "\\\\");
    return v;
  }
})