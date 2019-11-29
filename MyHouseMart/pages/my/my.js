var utils = require("../../utils/util.js"),
  e = getApp();
var app = getApp();
var url = app.baseUrl + "service-member/";
var urL = app.baseUrl + "service-mall/";
var cache = require("../../utils/cache.js");

Page({
  data: {
    maxDateTime: "",  //会员到期时间
    signing: '',      //判断是否刷脸支付
    type: true,        //判断是否刷脸支付
    src: "",          //用户头像
    name:"",          //用户名
    isMember:false,   //已开通会员
    ofMember:true,    // 未开通会员
    couponNum:0,       //优惠券
    productCouponNum:0,//商品券
    membership:false,  //7天会员
    memberYard:true,  //会员二维码
    userId: '',         //userId
  },
  //跳转会员页
  buyCard: function () {
    wx.navigateTo({
      url: `../buyCard/buyCard`,
    })
  },
  // 跳转地址页
  myOrder: function () {
    wx.navigateTo({
      url: '../location/location',
    })
  },
  onLoad: function (options) {
  
    let that = this;
    /**
  * 获取用户信息
  // */
  //   wx.getUserInfo({
  //     success: function (res) {
  //       console.log(res)
  //       that.setData({
  //         src: res.userInfo.avatarUrl,
  //         name: res.userInfo.nickName
  //       })
  //     }
  //   })
    //用户信息
    wx.request({
      url: `${url}new/query/usrInfo`,
      method:'GET',
      header:{
        'Cookie': "JSESSIONID=" + cache.get('sessionId', 'null')
      },
      success:function(rest){
        console.log(rest)
        that.setData({
          maxDateTime: rest.data.respData.effectiveTo != null ? rest.data.respData.effectiveTo.substring(0,10) : "",
          userId: rest.data.respData.userId
        })
        if (rest.data.respData.memberStatus == "MEMBERS") {  //当前状态是会员
          that.setData({
            isMember: true,
            ofMember: false,
            memberYard:true,
          })
        }
        if (rest.data.respData.memberStatus == "NON_MEMBERS"){   //未开过会员
          that.setData({
            isMember: false,
            ofMember: true,
            memberYard:false,
          })
        }
        // if (rest.data.respData.memberStatus == "EXPIRED_MEMBERS") {   //开过会员但已过期
        //   that.setData({
        //     isMember: false,
        //     ofMember: true,
        //     memberYard: true,  //会员二维码
        //   })
        // }
        if (rest.data.respData.memberStatus == "EXPIRED_MEMBERS") {   //开过会员但已过期
          that.setData({
            isMember: false,
            ofMember: true,
            memberYard: false,  //会员二维码
          })
        }
        //判断是否领取过7天会员
        if (rest.data.respData.experienceCardUsed == true) {
          that.setData({
            membership: false,
          })
        }
        if (rest.data.respData.facePayEnable == true){
          that.setData({
            signing:'已开通',
          })
        }
        if (rest.data.respData.facePayEnable == false) {
          that.setData({
            signing: '未开通',
          })
        }
        wx.showLoading({
          title: '加载中...',
        })
        //获取用户优惠券&商品券
        wx.request({
          url: `${urL}user/member/preson/coupon/${that.data.userId}`,
          method: 'GET',
          success: function (rest) {
            wx.hideLoading();
            console.log(rest.data.respData.couponNum)
            that.setData({
              couponNum: rest.data.respData.couponNum,
              productCouponNum: rest.data.respData.productCouponNum,
            })
          },
          fail:function(rest){
            wx.hideLoading();
            wx.showToast({
              title: '获取优惠券失败',
              icon: 'none',
            })
          }
        })
      }
    })
  },
  onShow: function () {
    this.onLoad();
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1]; //当前页面
    console.log(currPage)
  },
  //点击开通刷脸
  openFacePay: function (res) {
    if(this.data.signing == "未开通"){
      wx.navigateTo({
        url: '../face/face',
      })
    }
    if (this.data.signing == "已开通"){
      wx.navigateTo({
        url: '../faceset/faceset',
      })
    }
  },
  //会员二维码
  memberCode:function(){
    wx.navigateTo({
      url: '../index/index',
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // console.log("dsfsd")
    wx.showLoading({
      title: '加载中...',
    })
    this.onLoad();
    wx.stopPullDownRefresh();
    wx.hideLoading();
  },
  //点击获取用户信息
  userInfoHandler: function (detail){
    console.log(detail)
  },
  //跳转优惠券页面
  discount:function(){
    wx.navigateTo({
      url: `../discountCoupon/discountCoupon`,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  //跳转商品券页面
  goods:function(){
    wx.navigateTo({
      url: `../goodsTicket/goodsTicket`,
    })
  },
  onShareAppMessage: function (options) {
    console.log(options)
    var that = this;
    // 设置转发内容
    var shareObj = {
      title: "我家小程序",
      path: '/pages/connectWifi/connectWifi', // 默认是当前页面，必须是以‘/’开头的完整路径
      imgUrl: '', //转发时显示的图片路径，支持网络和本地，不传则使用当前页默认截图。
      success: function (res) {　 // 转发成功之后的回调　　　　　

      },

    };

    return shareObj;
  },
});