var app = getApp();
var cache = require("../../utils/cache.js");
let latitude, longitude
Page({
  data: {
    latitude:'',
    longitude:'',
    userBranchs:[],
    commonBranchs:[],
    mallBranchs:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        var speed = res.speed
        var accuracy = res.accuracy;
        latitude = res.latitude
        longitude = res.longitude
        wx.request({
          url: app.baseUrl + 'service-item/user/get/branch/list/by/location/' + cache.get('userId', 'null'),
          // url: app.baseUrl + 'service-item/user/get/branch/list/by/location',
          method: "POST",
          data: {
            "latitude": res.latitude,
            "longitude": res.longitude
          },
          success: function (rest) {

            _this.setData({
              commonBranchs: rest.data.respData.commonBranchs,
              userBranchs: rest.data.respData.userBranchs,
              mallBranchs: rest.data.respData.mallBranchs,
            });
          }
        })
      },
      fail: function (res) {
      }
    })
     
  },
  openMap(e){

   let item = e.currentTarget.dataset.item
    wx.openLocation({
      latitude: item.latitude,
      longitude: item.longitude,
      name: item.branchName,
      address: item.locDetail,
      scale: 18
    })
  },
  selectMall(data){
    let branch = data.currentTarget.dataset.branch
    if (branch) {
      app.globalData.branch = branch;
      app.globalData.id = true;
      app.globalData.mall = true
      wx.switchTab({
        url: "../index/index",
      })

    }
  },
  selectBranch:function(data){
    let branch = data.currentTarget.dataset.branch
    if(branch){
      app.globalData.branch = branch;
      app.globalData.id = true;
      wx.switchTab({
        url: "../index/index",
      })

    }
  },
  selectBranchs: function (datas) {
    let branch = datas.currentTarget.dataset.branch
    if (branch) {
      app.globalData.branch = branch;
      app.globalData.id = true;
      wx.switchTab({
        url: "../index/index",
      })

    }
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
    // var that = this;
    // wx.getLocation({
    //   type: 'gcj02',
    //   success: function (res) {
        

    //     var latitude = res.latitude
    //     console.log(latitude)
    //     var longitude = res.longitude
    //     var speed = res.speed
    //     var accuracy = res.accuracy;
    //     that.setData({
    //       latitude: latitude,
    //       longitude: longitude
    //     })


    //   },
    //   fail: function (res) {

    //     console.log('fail' + JSON.stringify(res))
    //   }
    // })
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