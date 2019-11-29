// pages/setMeal/setMeal.js
var app = getApp()
var call = require("../../utils/call.js");
var confirm = require("../../utils/confirm.js");
var cache = require("../../utils/cache.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [
      
    ],
    setMeal:[]
  },
//套餐一级获取

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  //套餐轮播
  
  swiperList() {
    let data = {
      // "branchNo": app.globalData.branch.branchNo,
      "branchNo": "000007",

      "adType": "PIC",
      "positionCode": "BRANCH_COMB"
    }
    let p = []
    call.postData("/service-item/user/ad/position/data", data, (res) => {
      console.log(res)
      if (res.respData.length && res.resData !== null) {
        for (let i in res.respData) {
          p.push(res.respData[i].adImg)
        }
      }

      this.setData({
        imgUrls: p
      })
    })
  },
//点击进入套餐列表页
  setMeal(i){
    console.log(i)
    // app.globalData.setMeal=i.currentTarget.dataset.chose
    app.globalData.comMeal = this.data.setMeal[i.currentTarget.dataset.index]
    wx.navigateTo({
      url: '../setMealList/setMealList',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    let data = []
    call.getData("/service-item/user/branch/combination/"+app.globalData.branch.branchNo, data, (res) => {
      console.log(res)
      console.log("我进来了套餐")
      if (res.respData !== null && res.respData.length !== 0) {
        this.setData({
          setMeal: res.respData
        })
        app.globalData.setMeal = this.data.setMeal
      }
    })
    this.swiperList()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})