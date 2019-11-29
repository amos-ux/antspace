import axios from '../../utils/axios.js';
const app = getApp();
const cache = require("../../utils/cache.js");
Page({
  data: {
    commonBranchs:[], //常用店铺
    userBranchs:[], //最近排行
    noPlace:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    that.getPlace()
  },
  getPlace:function(){
    let that = this
    wx.showLoading({title: '加载中...'})
    wx.getLocation({
      type: 'gcj02',
      success:rest=>{
        axios.post({
          url: `${app.baseUrl}service-item/user/get/branch/list/by/location/${cache.get('userId', 'null')}`,
          data:{
            "latitude": rest.latitude,
            "longitude": rest.longitude
          }
        }).then(res=>{
          wx.hideLoading()
          const {commonBranchs,userBranchs} = res.data.respData
          const noPlace = commonBranchs.length == 0 && userBranchs.length == 0 ? true : false
          that.setData({commonBranchs,userBranchs,noPlace})
        })
      }
    })
  },
  getDetail:function(e){
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    const storeAddress = e.currentTarget.dataset.item
    prevPage.setData({storeAddress})
    wx.navigateBack()
  }
})