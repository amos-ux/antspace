var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var app = getApp();
var url = app.baseUrl +"service-mall/";
var qqmapsdk;
Page({
  data: {
    latitude: null,//地图初次加载时的纬度坐标
    longitude: null, //地图初次加载时的经度坐标
    provinceName: null,
    cityName: null,
    regionName: null
   
  },
  //移动选点
  moveToLocation: function () {
    var that = this;
    wx.chooseLocation({ 
      success: function (res) {
        console.log(res)
        //选择地点之后返回到原来页面
        wx.setStorage({
          key: 'userInfo',
          data: res.latitude,
        })
        wx.setStorage({
          key: 'userInf',
          data: res.longitude,
        })
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
        wx.request({
          url: url + 'address/user/get/addresss/by/lolt',
          method: "POST",
          data: {
            "latitude": res.latitude,
            "longitude": res.longitude
          },
          success: function (res) {
            console.log(res)
            var pages = getCurrentPages();
            var prevPage = pages[pages.length - 2];
            console.log(pages)
            console.log(prevPage.data)
            prevPage.setData({
              cityName: res.data.respData.cityName,
              provinceName: res.data.respData.provinceName,
              regionName: res.data.respData.regionName,
              locDetail: res.data.respData.locDetail
            })
            wx.navigateBack({
              
            })
          }
        })
      },
      fail: function () {
          wx.navigateBack({})
      }
    });
  },
  onLoad: function (options) {
    this.moveToLocation();
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'URBBZ-ZXUC4-654UI-DWS4O-M7753-UEBQY'
    });
  },
})
