const app = getApp();
import axios from '../../utils/axios.js';
const cache = require("../../utils/cache.js");
Page({
  data: {
    couponProductList: [],//不可用优惠券
    disabledProductList: [],//不可用商品券
    useCouponList: [],//可用优惠券
    useProductList: [],//可用商品券
    messages:"",     //活动规则&使用规则
    total:0,          //优惠价
    totalPrice:0,      //原价
    order:[],     //所有商品
    unusedImg:false, //没有券时显示的图
    usable:'',        //有没有可用优惠券文案
    total:0,        //优惠过后的总价
    goodsItems:[],    //购物车的商品
    isMember:null,   //会员字段
    planNos:[],//券编号
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("options", options);
    let that = this;
    that.getMessage(options)
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
  onShareAppMessage: function (options) {
    let that = this;
    // 设置转发内容
    let shareObj = {
      title: "我家小程序",
      path: '/pages/connectWifi/connectWifi', // 默认是当前页面，必须是以‘/’开头的完整路径
      imgUrl: '', //转发时显示的图片路径，支持网络和本地，不传则使用当前页默认截图。
      success: function () {},
    }
    return shareObj;
  },
  //活动规则
  playing: function (e) {
    this.setData({
      pop: true,
      messages: e.currentTarget.dataset.message,  //规则
    })
  },
  popImg: function () {
    this.setData({
      pop: false
    })
  },

  //可用商品券
  goodsTicket: function(e){
    wx.showLoading({title: '加载中...'})
    let that = this,{ total, totalPrice, order } = that.data
    const Ticket = e.currentTarget.dataset.item
    const {planNo,couponNo,planId} = Ticket
    let newitem = order.map(item=>{
      return {salePrice:item.salePrice,itemQty:item.quantity,couponPlanNo: item.couponPlanNo}
    })
    axios.post({
      url: `${app.baseUrl}service-mall/user/coupon/v2/calc`,
      data: {
        "userId": cache.get("userId", null),
        "planNo": planNo,
        "totalPrice": totalPrice,
        "couponNo": couponNo,
        "couponItemPrices": newitem,
      }
    }).then(rest=>{
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2],reAllMnt = 0
      const isreturnMoney = rest.data.respData.returnMoney
      const discounts = (rest.data.respData.discountPrice).toFixed(2)
      const couponPrice = (totalPrice - discounts).toFixed(2)
      order.map(item => {
        item.returnMoney = item.couponPlanNo.indexOf(planNo) != -1 ? isreturnMoney : true;//使用券 置为true 
        reAllMnt += item.couponPlanNo.indexOf(planNo) != -1 ? isreturnMoney ? item.quantity * item.refundValue : 0 : item.quantity * item.refundValue
      })
      //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
      prevPage.setData({
        discounts, isreturnMoney, planNo, couponNo, planId, reAllMnt, couponPrice,
        usable: "-" + discounts,
        aggregate: discounts > 0 ? couponPrice : total,
        preferentialCombined: discounts > 0 ? discounts : (totalPrice - total)
      })
      wx.navigateBack()
      wx.hideLoading()
    })
  },
  // 获取券数据
  getMessage: function(options){
    let that = this,planNoArr = []
    const { planNos, total, totalPrice,commoditStatus} = options,{ order } = app.globalData
    planNoArr.push(...planNos.split(','))
    planNoArr = app.trimSpace(planNoArr)
    wx.showLoading({title: '加载中...',mask:true})
    that.setData({planNos: planNoArr})
    let payCouponsParams = order.map(item => {
      return {couponPlanNo: item.couponPlanNo,itemQty: item.quantity,salePrice: item.salePrice}
    })
    axios.postData({
      url: `${app.baseUrl}service-mall/public/v2/user/coupon/list`,
      data:{
        "userId": cache.get("userId", null),
        "payCouponsParams": payCouponsParams,
      }
    }).then(rest=>{
      let { couponProductList, disabledProductList, useCouponList, useProductList } = rest.data.respData,unusedImg = false
      let useCoupon = useCouponList.length + useProductList.length;//可用券个数
      // 如果所有券个数都为0
      if (couponProductList.length == 0 && disabledProductList.length == 0 && useCouponList.length == 0 && useProductList.length == 0) {
        unusedImg = true
      }
      that.setData({
        unusedImg,couponProductList,disabledProductList,useCouponList,useProductList,total, totalPrice, order,
        usable: useCoupon == 0 ? "暂无可用券" : `有${useCoupon}张可用`
      })
      wx.hideLoading()
    },()=>{
      wx.showToast({title: '获取优惠券失败',icon: 'none',mask: true});
      setTimeout(function() {
        wx.navigateBack()
      }, 1500)
    })
  },
  // 不使用优惠券
  nonuse:function(){
    wx.showLoading({title: '加载中...'})
    let that = this,pages = getCurrentPages();
    let prevPage = pages[pages.length - 2]; //上一个页面
    let { total, totalPrice, planNos, order, usable } = that.data,reAllMnt = 0
    order.map(item=>{
      item.returnMoney = planNos.indexOf(item.planNo) == -1 ? true : false
      const isInActivity = item.promotionRule ? item.promotionRule.promotionType == 'MULTIPLE_RETURN' ? item.promotionRule.promotionRule[0].multipleValue == item.refundMultiple : true : true
      item.mulreturnMoney = item.promotionRule ? item.promotionRule.promotionType == 'MULTIPLE_RETURN' ? item.refundValue * (isInActivity ? item.promotionRule.promotionRule[0].multipleValue : 1) : item.refundValue : item.refundValue //多倍返现金额
      reAllMnt += planNos.indexOf(item.planNo) == -1 ? item.quantity * item.mulreturnMoney : 0
    })
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      discounts: 0, reAllMnt,isreturnMoney:null,
      usable,//不用券改回文案
      couponPrice: 0,//优惠后的总价
      planNo: "",//促销编号
      couponNo: "",//券编号
      planId: "",//方案id
      aggregate: total,
      preferentialCombined: totalPrice - total
    })
    wx.navigateBack()
    wx.hideLoading();
  },
  // 阻止事件向下传递
  preventTouchMove(){}
})