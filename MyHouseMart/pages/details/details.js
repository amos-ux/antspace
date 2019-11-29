// pages/details/details.js
var app = getApp();
var cache = require("../../utils/cache.js");
var url = app.baseUrl + "service-order-prc/";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order:'',
    goodsItem:[],
    goodsList:[],
    itemList:[],
    stateType:'',
    hint:'',
    totalPrice:0,
    getTotal:'0.00'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    console.log(options.orders);
    that.setData({
      order: options.orders
    })
    wx.request({
      url: `${url}returnOrder/findReturnBySessionId?sessionId=${cache.get('sessionId', 'null')}&orderNo=${this.data.order}`,
      method: 'POST',
      success: function (rest) {
        console.log(rest)
        that.setData({
          goodsItem:rest.data,
          goodsList:rest.data.respData,
          itemList: rest.data.respData.itemList,
          imageURL: rest.data.respData.pictureList
        })
        console.log(that.data.goodsItem)
        console.log(that.data.goodsList)
        console.log(that.data.itemList)
        console.log(that.data.imageURL)
        if (that.data.goodsList.returnStatus == "SUBMITTED") {
          that.setData({
            stateType: '退款中',
            hint: '请耐心等待退款审核'
          })
        }
        if (that.data.goodsList.returnStatus == "APPROVED") {
          that.setData({
            stateType: '退款中',
            hint: '请耐心等待退款审核'
          })
        }
        if (that.data.goodsList.returnStatus == "REJECTED") {
          that.setData({
            stateType: '退款失败',
            hint: '退款继续进行中，请稍等'
          })
        }
        if (that.data.goodsList.returnStatus == "COMPLETED") {
          that.setData({
            stateType: '退款完成',
            hint: '退款金额原路返回到账户中'
          })
        }
        console.log(that.data.stateType)
        let goods = that.data.itemList;                  // 获取商品列表
        let total = 0;
        for (let i = 0; i < goods.length; i++) {         // 循环列表得到每个数据
          total += goods[i].quantity * goods[i].salePrice;     // 所有价格加起来
        }
        that.setData({                                // 最后赋值到data中渲染到页面
          itemList: goods,
          totalPrice: total.toFixed(2)
        });
        //计算商品总数
        let addNum = 0;
        for (let i = 0; i < goods.length; i++) {         // 循环列表得到每个数据
          addNum += goods[i].quantity;     // 所有商品相加
        }
        that.setData({                                // 最后赋值到data中渲染到页面
          itemList: goods,
          getTotal: addNum
        });
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