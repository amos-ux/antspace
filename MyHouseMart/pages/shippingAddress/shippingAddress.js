import axios from '../../utils/axios.js'
const app = getApp()
const url = app.baseUrl + "service-mall"
const cache = require("../../utils/cache.js")
Page({
  data: {
    location: [], //用户所有地址
    usable: [], //当前可用地址
    unusable: [], //不可用地址
    hint: false
  },
  onLoad: function (options) {
    let that = this
    that.setData({
      totalSummation: options.totalSummation, //原价总价
      amount: options.amount //起送金额
    })
  },
  onShow: function () {
    this.site()
  },
  site: function () {
    let that = this;
    wx.showLoading({ title: '加载中...' })
    axios.post({
      url: `${url}/address/user/find/address/list/${cache.get("userId", null)}?branchNo=${app.globalData.branch.branchNo}`,
    }).then(rest => {
      wx.hideLoading()
      const { totalSummation, amount } = that.data
      const location = rest.data.respData //用户所有地址
      const hint = location.length == 0 ? true : false
      let unusable = [], usable = []
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      for (let i in location) {
        if (location[i].isDistribution == 'N') {
          unusable.push(location[i])
        }
        if (location[i].isDistribution == 'Y') {
          usable.push(location[i])
        }
      }
      if (usable.length == 0 && totalSummation) {
        prevPage.setData({
          select: '请选择收货地址',
          location: '',
          shippingFee: 0
        })
      } else {
        const defaultPlace = usable.filter(item => item.defaultAddress == 'Y')
        if (defaultPlace.length > 0) {
          wx.showLoading({ title: '加载中...' })
          axios.post({
            url: `${url}/address/queryDistFee`,
            data: {
              "branchNo": app.globalData.branch.branchNo, //店铺号
              "locationId": defaultPlace[0].locationId, //地址id
              "totalPriceAmount": totalSummation, //原价总价
            }
          }).then(rest => {
            wx.hideLoading()
            prevPage.setData({
              select: '',
              location: defaultPlace[0],
              shippingFee: Number(totalSummation) >= Number(amount) ? rest.data.respData.distPrice : 0, //配送费
              sendFeeIiemNo: rest.data.respData.itemNo, //配送费商品号
            })
          }, () => { wx.hideLoading() })
        }
      }
      that.setData({ unusable, usable, location, hint })
    }, () => { wx.hideLoading() })
  },

  onShareAppMessage: function (options) {
    let shareObj = {
      title: "我家小程序",
      path: '/pages/connectWifi/connectWifi', // 默认是当前页面，必须是以‘/’开头的完整路径
      imgUrl: '', //转发时显示的图片路径，支持网络和本地，不传则使用当前页默认截图。
      success: function () { }
    }
    return shareObj;
  },
  //选择配送地址
  select: function (i) {
    let that = this;
    const { totalSummation, amount, usable } = that.data
    wx.showLoading({ title: '加载中...' })
    axios.post({
      url: `${url}/address/queryDistFee`,
      data: {
        "branchNo": app.globalData.branch.branchNo, //店铺号
        "locationId": usable[i.currentTarget.dataset.index].locationId, //地址id
        "totalPriceAmount": totalSummation, //原价总价
      }
    }).then(rest => {
      wx.hideLoading()
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      const index = i.currentTarget.dataset.index
      if (usable.length > 0) {
        prevPage.setData({
          select: '', //制空请选择地址文案
          location: usable[index],
          shippingFee: Number(totalSummation) >= Number(amount) ? rest.data.respData.distPrice : 0, //配送费
          sendFeeIiemNo: rest.data.respData.itemNo, //配送费商品号
        })
      }
      wx.navigateBack()
    }, () => { wx.hideLoading() })
  },
  //修改地址
  modification: function (i) {
    wx.navigateTo({
      url: '../site/site?p=' + JSON.stringify(this.data.usable[i.currentTarget.dataset.id]),
    })
  },
  //添加收货地址
  take: function () {
    wx.navigateTo({
      url: '../take/take',
    })
  },
})