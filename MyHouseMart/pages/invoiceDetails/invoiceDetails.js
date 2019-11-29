// pages/invoiceDetails/invoiceDetails.js
var app = getApp();
var cache = require("../../utils/cache.js");
var url = app.baseUrl + "service-order-prc/";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderNo:'',     //订单号
    message:[],     //接口返回参数
    invoiceState:'',//开票状态
    invoiceStatus: '',//开票状态提示语
    titleType:'',    //抬头类型
    invoiceNum:true, //判断发票税号
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      orderNo: app.globalData.invoiceState[0].orderNo
    })
    console.log(app.globalData.invoiceState)
    wx.request({
      url: `${url}invoice/get/invoice/by/orderNo/${that.data.orderNo}`,
      method: 'GET',
      success:function(rest){
        console.log(rest)
        that.setData({
          message:rest.data.respData
        })
        console.log(that.data.message)
        //判断是开票中&已开票
        if (that.data.message.invoiceStatus == "INPROGRESS"){
          that.setData({
            invoiceState:'开票中',
            invoiceStatus:'请耐心等候开票'
          })
        }else{
          that.setData({
            invoiceState: '开票完成',
            invoiceStatus: '请到邮箱下载发票'
          })
        }
        //判断抬头类型
        if (that.data.message.invoiceType == "BUSINESS"){
          that.setData({
            titleType:'企业单位',
          })
        }else{
          that.setData({
            titleType: '个人/非企业单位',
          })
        }
        //判断发票税号
        if (that.data.titleType == '企业单位'){
          that.setData({
            invoiceNum:true,
          })
        }else{
          that.setData({
            invoiceNum: false,
          })
        }
      }
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    app.globalData.invoiceState = []
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    app.globalData.invoiceState = []
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