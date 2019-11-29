import axios from '../../utils/axios.js';
const app = getApp();
const url = app.baseUrl + "service-mall/";
const cache = require("../../utils/cache.js");
Page({
  data: {
    messages:'',
    alreadyReceived:'已领取',
    unclaimed:'立即领取',
    aaa:true,
    ccc:-1,
    allVouchers:[],//所有券
    hint:false,
    rpx:0.5,
    animation:null,
    num:1
  },

  onLoad: function (options) {
    console.log("options",options)
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        let rpx = 1 * (res.windowWidth * res.pixelRatio) / (750 * res.pixelRatio);
        that.setData({rpx})
      }
    })
    this.getTicket();
  },
  onShow: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getTicket();
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  //活动规则
  playing: function (e) {
    this.setData({
      pop: true,
      messages: e.currentTarget.dataset.message//活动规则
    })
  },
  //关闭弹框
  popImg: function () {
    this.setData({pop: false})
  },
  //立即领取
  immediatelyToReceive:function(e){
    if (this.data.aaa === true && this.data.ccc != e.currentTarget.dataset.index) {
      this.setData({ aaa: false })
      let that = this;
      wx.showLoading({title: '加载中...'})
      axios.postData({
        url: `${url}user/member/coupons/save`,
        data: that.data.allVouchers[e.currentTarget.dataset.index].dataTemplate.memberCouponsList
      }).then(res=>{
        wx.showToast({
          title: '领取成功',
          duration: 2000,
          icon:'none',
          success() {
            that.setData({ ccc: e.currentTarget.dataset.index, aaa: true })
          }
        })
        that.setData({
          fullCutForbidden: true,
          fullCutCopyWriter: '已领取'
        })
        wx.hideLoading();
        that.getTicket();
      },()=>{
        wx.hideLoading();
        wx.showToast({
          title: '领取失败',
          icon: 'none',
          duration: 2000,
          success() {
            that.setData({ aaa: true })
          }
        })
      })
    }
  },
  //获取用户可领券
  getTicket: function(){
    let that = this, hint = false
    const {num} = that.data
    that.setData({ allVouchers: [], hint })
    wx.showLoading({title: '加载中...'})
    axios.get({
      url: num == 2 ? `${url}user/coupon/conter/list/${cache.get("userId", null)}` : `${app.baseUrl}service-mall/user/my/coupons/${cache.get("userId", null)}`,
    }).then(rest=>{
      const allVouchers = rest.data.respData//所有券
      hint = allVouchers == 0 ? true : false
      that.setData({ allVouchers, hint })
      wx.hideLoading();
      }, () => { wx.hideLoading() })
  },
  // 我的卡券
  cardCoupon:app.debounce1(function(e){
    let that = this
    const num = Number(e.currentTarget.dataset.num)
    if(num == that.data.num){
      return false
    }
    that.animation = wx.createAnimation({duration: 200});
    that.animation.translate(num == 1 ? 0 : 380 * that.data.rpx, 0).step()
    that.setData({
      num,
      pop:false,
      animation: that.animation.export()
    })
    that.getTicket()
  },600),
  // 阻止事件向下传递
  preventTouchMove: function () {},
  // 跳转商品券详情页
  toDetail:function(e){
    let that = this
    const index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: `/pages/discountDetail/discountDetail?planNo=${that.data.allVouchers[index].planNo}`,
    })
  }
})