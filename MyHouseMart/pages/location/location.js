const cache = require("../../utils/cache.js");
const app = getApp();
Page({
  data: {
    message: [],
    sign: null,
    noPlace:false
  },
  onLoad: function(options) {
    this.setData({
      sign: options.id ? JSON.parse(options.id) : null
    })
  },
  onShow: function() {
    let that = this
    wx.showLoading({title: '加载中...'})
    wx.request({
      url: `${app.baseUrl}service-mall/address/user/find/address/list/${cache.get('userId', "null")}`,
      method: "POST",
      success: function(rest) {
        wx.hideLoading()
        that.setData({
          message: rest.data.respData && rest.data.respData.length > 0 ? rest.data.respData : [],
          noPlace: rest.data.respData && rest.data.respData.length > 0 ? false : true
        })
      }
    })
  },
  //点击修改&选择配送地址
  goToaddress: function(i) {
    if (this.data.sign == 1) {
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2];
      prevPage.setData({
        locationId: this.data.message[i.currentTarget.dataset.index].locationId,
        mydata: this.data.message[i.currentTarget.dataset.index],
        myData: ""
      })
      wx.navigateBack()
    } else {
      wx.navigateTo({
        url: `../site/site?p=${encodeURIComponent(JSON.stringify(this.data.message[i.currentTarget.dataset.id]))}`
      })
    }
  },
  take: function() {
    wx.navigateTo({
      url: '../take/take',
    })
  },
})