const utils = require("../../utils/util.js");
let cache = require("../../utils/cache.js");
var call = require("../../utils/call.js");

let  e = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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

  },
  //点击关闭刷脸支付
  facesetBtn:function(){ 
    let that = this;
    wx.showModal({      
      title: '关闭刷脸支付',
      content: '您确定要关闭刷脸支付吗？',
      success: function (res) {
        let data={
          "serviceType": "WECHAT",
          "openId": cache.get("open",this),
          "contractTerminationRemark":"none",
          "type":'FACE'
        }
        if (res.confirm) {
          call.postData("/service-payment/trade/papay/delete/contract",data,(res)=>{
              console.log(res)
              wx.showModal({
                title: '关闭成功',
                content: '您已关闭支付，状态更改可能需要几分钟的时间',
                showCancel: false,//是否显示取消按钮
                success: () => {
                  wx.navigateBack({

                  })
                }
              })
        
          },(res)=>{
            console.log(res)
            wx.showModal({
              title: '关闭失败',
              content: '非常抱歉关闭失败',
              showCancel: false,//是否显示取消按钮
              success: () => {
              
                wx.navigateBack({
                })
              }
            })
          })
          // utils.httpClient("/service-payment/trade/papay/delete/contract", "POST", data, function (rest) {
          //   if (rest.respCode == '0000') {
          //     wx.showModal({
          //       title: '关闭成功',
          //       content: '您已关闭支付，状态更改可能需要几分钟的时间',
          //       showCancel: false,//是否显示取消按钮
          //       success:()=>{
          //         // var pages = getCurrentPages();
          //         // var prevPage = pages[pages.length - 2]; //上一个页面
          //         // prevPage.setData({
          //         //   signing: '未开通',
          //         // })
          //         wx.navigateBack({

          //         })
          //       }
          //     })
          //   }
          //   wx.redirectTo({
          //     url: '../myPage/myPage',
          //     complete: function () {
          //       that.setData({
          //         disableSwitch: false
          //       });
          //     }
          //   })
          // }, 
          // function (rest) {
           
          // });
        } else {
          that.setData({
            // signing: true
          });
        }
      }
    })
  }
})