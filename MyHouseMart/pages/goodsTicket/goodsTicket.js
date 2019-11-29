const app = getApp();
const url = app.baseUrl + "service-mall";
const cache = require("../../utils/cache.js");
import axios from '../../utils/axios.js';
Page({
  data: {
    num: 1,
    discountType:[], //商品券
    pop: false,      //活动规则弹框
    message: '' ,     //活动规则内容
    unusedImg: false,//没有券时显示图
    rpx:0.5,
    animation:'',//动画
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        let rpx = 1 * (res.windowWidth * res.pixelRatio) / (750 * res.pixelRatio);
        that.setData({rpx})
      }
    })
    that.getTicket()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.animation = wx.createAnimation({ duration: 100 });//下划线过度动画
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
      success: function () {}
    };
    return shareObj;
  },
  getTicket: function(){
    let that = this
    wx.showLoading({title: '加载中...'})
    //获取商品券
    axios.postData({
      isToast:true,
      url: `${url}/user/member/coupons/list`,
      data:{
        "pageNum": 1,
        "pageSize": 100,
        "searchParams": {
          "couponType": "ITEM_COUPON",   //商品券
          "couponStatus": that.data.num == 1 ? 'NORMAL' : that.data.num == 2 ? 'USED' : 'EXPIRED', //使用状态 
          "userId": cache.get("userId", null),
        }
      }
    }).then(rest=>{
      wx.hideLoading()
      that.setData({
        discountType: rest.data.respData.data,
        unusedImg: rest.data.respData.data.length == 0 ? true : false
      })
    },()=>{
      wx.hideLoading()
      that.setData({
        discountType: [],
      })
      wx.showToast({
        title: '请求失败,请稍后重试',
        icon: 'none',
        duration: 2000
      })
    })
  },
  // 顶部导航栏
  couponUse: app.debounce1(function(e){
    let that = this
    const num = e.currentTarget.dataset.num
    if(num == that.data.num){
      return false;
    }
    that.animation.translate(num==1?0:num==2?250*that.data.rpx:506*that.data.rpx,0).step()//选中下划线过度位置
    that.setData({
      num,
      unusedImg:false,
      pop: false,
      discountType: [],//清空原有数据
      animation: that.animation.export()//下划线动画执行
    })
    that.getTicket()
  },500),
  //使用规则
  playing: function (e) {
    let indexs = e.currentTarget.dataset.index,ticket = this.data.discountType,index = []
    for (let i in ticket) {
      index.push(ticket[i].rule)
    }
    this.setData({
      pop: true,
      message: index[indexs],//活动规则
    })
  },
  popImg: function () {
    this.setData({pop: false})
  },
  // 阻止事件向下传递
  preventTouchMove: function () {},
})