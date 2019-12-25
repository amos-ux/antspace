// pages/take/take.js
const cache = require("../../utils/cache.js");
const app = getApp();
const url = app.baseUrl + "service-mall/";
Page({
  data: {
    checked: false,//是否设置默认地址
    region: [],
    userName: '',
    userNumber: '',
    provinceName: null,//省份
    cityName: null,//城市
    regionName: null,//区域
    locDetail: '',//地址
    memberAddressType: "",
    defaultAddress: "N",
    latitude: null,
    longitude: null,
    detailedAddress: '',//门牌号
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  // 联系人
  inputeidt: function (e) {
    let that = this
    that.setData({
      userName: e.detail.value
    })
  },
  // 手机号码
  inputPhone: function (e) {
    let that = this
    that.setData({
      userNumber: e.detail.value
    })
  },
  // 门牌号
  inputHouse: function (e) {
    let that = this
    that.setData({
      detailedAddress: e.detail.value
    })
  },
  // 设置默认地址
  checkboxChange(e) {
    let that = this
    that.setData({
      checked: !that.data.checked
    })
  },
  // 收货地址
  skip: function () {
    wx.navigateTo({
      url: '../mymoney/mymoney',
    })
  },
  getUsersInfo: function () {
    let that = this;
    //读取缓存登录
    wx.getStorage({
      key: 'userInfo',
      success: function (res) {
        that.setData({
          latitude: res.data,
        })
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
  // 节流 保存地址
  saveDebounce: app.debounce1(function () {
    this.save()
  }, 1000),
  save: function () {
    let that = this
    const myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(19[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(16[0-9]{1})|(14[0-9]{1}))+\d{8})$/;
    const namereg = /^[A-Za-z0-9\u4e00-\u9fa5]+$/;
    const detailreg = /[`@#$^&*''@#￥&*]/g
    const userName = that.data.userName.replace(/^\s*|\s*$/g, '')
    if (userName == '') {
      that.showToast('用户名不能为空哦')
      return false;
    } else if (!namereg.test(userName)) {
      that.showToast('用户名有误哦')
      return false;
    } else if (that.data.userNumber == '') {
      that.showToast('电话号码不能为空哦')
      return false;
    } else if (!myreg.test(that.data.userNumber)) {
      that.showToast('电话号码有误哦')
      return false;
    } else if (that.data.locDetail == '') {
      that.showToast('收货地址还没填写呢')
      return false;
    } else if (that.data.detailedAddress == '') {
      that.showToast('详细地址不能为空哦')
      return false;
    } else if (detailreg.test(that.data.detailedAddress)) {
      that.showToast('详细地址有误哦')
      return false;
    } else {
      wx.showLoading({ title: '加载中...' })
      that.setData({
        defaultAddress: that.data.checked ? "Y" : "N"
      })
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
          that.showToast('添加收货地址失败')
        }
      })
    }
  },
  // 选择公司
  compony: function () {
    this.setData({
      memberAddressType: "company",
    })
  },
  // 选择住宅
  home: function () {
    this.setData({
      memberAddressType: "home",
    })
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
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getUsersInfo()
  }
})