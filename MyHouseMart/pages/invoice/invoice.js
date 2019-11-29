// pages/invoice/invoice.js
var app = getApp();
var cache = require("../../utils/cache.js");
var url = app.baseUrl + "service-order-prc/";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    items: [
      { name: 'ETP', value: '企业单位',  },
      { name: 'IDL', value: '个人/非企业单位', },
    ],
    typestate:false,     //发票税号隐藏
    title_name:'',       //抬头名称value
    invoice_number:'',   //发票税号value
    email:'',            //邮箱value
    title_type:'',       //抬头类型
    message:[],
    orderNo:'',
    totalPayAmount:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      message: app.globalData.invoice[0]
    })
    console.log(this.data.message.totalPayAmount);
    console.log(this.data.message.orderNo);
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
    app.globalData.invoice = []
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    app.globalData.invoice = []
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
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
  //单选框事件
  radioChange: function (e) {
    let that = this;
    console.log(e.detail.value)
    if (e.detail.value == "IDL"){
      that.setData({
        typestate:false,
        title_type:'PERSONAL'
      })
    }else{
      that.setData({
        typestate: true,
        title_type: 'BUSINESS'
      })
    }
  },
  //抬头名称
  titleName:function(e){
    this.setData({
      title_name: e.detail.value
    })
    console.log(this.data.title_name);
  },
  //发票税号
  invoiceNumber:function(e){
    this.setData({
      invoice_number: e.detail.value
    })
    console.log(this.data.invoice_number);
  },
  //电子邮箱
  email:function(e){
    this.setData({
      email: e.detail.value
    })
    console.log(this.data.email);
  },
  //邮箱input失焦事件
  eMail:function(e){
    if (!(/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/.test(e.detail.value))) {
      wx.showToast({
        title: '邮箱输入有误',
        duration: 1000,
        icon: 'none'
      });
      return false;
    }
  },
  //提交
  commit:function(){
    let that = this;
    if (that.data.title_name == ''){
      wx.showToast({
        title: '请填写抬头名称',
        icon: 'none',
      })
      return false;
    }
    if (that.data.title_type == 'BUSINESS'){
      if (that.data.invoice_number == ''){
        wx.showToast({
          title: '请填写发票税号',
          icon: 'none'
        })
        return false;
      }
    }
    if(that.data.email == ''){
      wx.showToast({
        title: '请填写您的邮箱',
        icon: 'none'
      })
      return false;
    }
    if (!(/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/.test(that.data.email))) {
      wx.showToast({
        title: '邮箱输入有误',
        duration: 1000,
        icon: 'none'
      });
      return false;
    }
    if (that.data.title_type == ''){
      wx.showToast({
        title: '请选择抬头类型',
        duration: 1000,
        icon: 'none'
      });
      return false;
    }
    that.setData({
      orderNo: that.data.message.orderNo,
      title_type: that.data.title_type,
      title_name: that.data.title_name,
      invoice_number: that.data.invoice_number,
      totalPayAmount: that.data.message.totalPayAmount,
      email: that.data.email
    })
    console.log(that.data.orderNo)
    console.log(that.data.title_type)
    console.log(that.data.title_name)
    console.log(that.data.invoice_number)
    console.log(that.data.message.totalPayAmount)
    console.log(that.data.email)
    console.log(cache.get('sessionId', 'null'))
    let invoiceData = {
      'orderNo': that.data.message.orderNo,                                        //订单编号
      'invoiceType': that.data.title_type,                                         //发票类型
      'invoiceTitle': that.data.title_name,                                        //发票抬头
      'taxNo': that.data.title_type == 'BUSINESS' ? that.data.invoice_number:'',   //发票税号
      'invoiceAmount': that.data.message.totalPayAmount,                           //发票金额
      'userMailBox': that.data.email,                                              //邮箱
      'sessionId': cache.get('sessionId', 'null'),
    }
    wx.showLoading({
      title: '加载中...',
    })
    //提交接口
    wx.request({
      url: `${url}invoice/add/invoice`,
      method:'POST',
      data: invoiceData,
      dataType:JSON,
      success:function(rest){
        wx.hideLoading();
        console.log(JSON.parse(rest.data).respDesc);
        if (JSON.parse(rest.data).respDesc == '成功'){
          wx.showModal({
            title: '提交成功',
            content: '请耐心等待开票',
            showCancel: false,
            confirmText: '确定',
            success(res) {
              wx.navigateBack({
                delta: 2,
              })
            }
          })
        }else{
          wx.showModal({
            title: '提交失败',
            content: '请稍后重试',
            showCancel: false,
            confirmText: '确定',
            success(res) {
              wx.navigateBack({
                delta: 2,
              })
            }
          })
        }
      }
    })
  },
})