const app = getApp()
const cache = require("../../utils/cache.js")
import axios from '../../utils/axios.js'
let timer = 0;//全局定时器
Page({
  data: {
    payprice: 0, //价格
    payType: null, //支付方式
    ticketNum: [],//券个数返回值
    ticketList: null,//返券列表
    reAllMnt: null,//返现金额
    userInfo: null,//用户信息
    isVip: false,//是否激活内邀码
    seconds: '5s'
  },
  /**
   * renewal  续费
   * wechat   微信支付
   * wallet   钱包支付
   */
  onLoad: function (options) {
    let that = this
    const { payprice, payType, reAllMnt } = options
    console.log(options)
    that.setData({ payprice, payType, reAllMnt })
    that.getTicketNum(options.payType)
  },
  onUnload: function() {
    clearInterval(timer)//页面卸载时清除定时器
  },
  onHide: function(){
    clearInterval(timer)//页面卸载时清除定时器
  },
  // 查看订单详情
  order: function () {
    clearInterval(timer)
    app.globalData.id = true;
   
    app.globalData.refreshOrder = true
    wx.switchTab({
      url: '../newOrder/newOrder',
    })
  },
  // 回到首页
  conTinue() {
    clearInterval(timer)
    app.globalData.id = true;
    wx.switchTab({
      url: '../index/index',
    })
  },
  // 邀请好友
  toMember: function () {
    clearInterval(timer)
    wx.navigateTo({
      url: `/my_member/inviteFriends/inviteFriends`
    })
  },
  // 跳转会员详情
  toPerson: function () {
    clearInterval(timer)
    wx.switchTab({
      url: `/pages/myPage/myPage`
    })
  },
  /**
   * 获取优惠券个数
   * DISCOUNT_COUPON   优惠券
   * PRICE_FULL_COUPON 满减券
   * ITEM_COUPON       商品券
   * */
  getTicketNum(payType) {
    let that = this
    wx.showNavigationBarLoading()
    const ticket = axios.getData({ url: `${app.baseUrl}service-mall/user/pay/send/coupon/notify/${cache.get("userId", null)}` }) // 返回优惠券
    const invite = axios.getData({ url: `${app.baseUrl}service-member/public/pop/invitation/${cache.get("userId", null)}` }) // 判断是否激活内邀码
    const user = axios.getData({url: `${app.baseUrl}service-member/new/query/usrInfo`,header: {'Cookie': "JSESSIONID=" + cache.get('sessionId', 'null')}}) // 获取用户信息
    Promise.all([ticket, invite, user]).then(res => {
      wx.hideNavigationBarLoading()
      console.log("res", res);
      let ticketNum = res[0].data.respData, str = [], num = 5
      const isVip = res[1].data.respData //是否首单激活内邀码
      const userInfo = res[2].data.respData //获取用户基本信息
      ticketNum.map(item => { str.push(item.desc) })
      ticketNum = ticketNum.length == 0 ? [] : [str.join('、')]
      timer = setInterval(function () {
        --num
        that.setData({
          seconds: num + 's'
        })
        if (num == 0) {
          clearInterval(timer)
          if (payType == 'renewal') {//购买会员
            that.toPerson()
          } else {
            that.order()
          }
        }
      }, 1000)
      that.setData({
        ticketNum, isVip, userInfo,
        ticketList: res[0].data.respData
      })
    }).catch(err => {
      console.log(err)
    })
  }
})