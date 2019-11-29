var app = getApp();
var url = app.baseUrl + "service-member/";
var cache = require("../../utils/cache.js");
var util = require("../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    member:'',         //会员到期时间
    getType:null,     //判断未领取
    drawType:null,      //判断已领取
    memberStuck:"",    //会员卡图
    stuckType:"",        //会员卡类型
    stuckNum:"",      //会员卡编号
    stuckMoney:0,       //卡价
    validityPeriod:0,  //会员卡有效时间
    dredge:false,       //支付点击禁用
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    //会员卡接口
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: `${url}/query/all/pmCards`,
      method: "GET",
      header: {
        'Cookie': "JSESSIONID=" + cache.get('sessionId', 'null')
      },
      success:function(rest){
        wx.hideLoading();
        console.log(rest);
        that.setData({
          memberStuck: rest.data.respData[0].cardImage,//会员卡图
          stuckType: rest.data.respData[0].cardName,//会员卡类型
          stuckNum: rest.data.respData[0].cardNo,//会员卡编号
          stuckMoney: rest.data.respData[0].price,//卡价
          validityPeriod: rest.data.respData[0].validityPeriod,//会员卡有效时间
        })
        console.log(that.data.memberStuck)

      },
      fail:function(rest){
        wx.showToast({
          title: '加载失败，请稍后重试',
          icon: 'none',
        })
      }
    })
    //用户信息
    wx.request({
      url: `${url}/new/query/usrInfo`,
      method: 'GET',
      header: {
        'Cookie': "JSESSIONID=" + cache.get('sessionId', 'null')
      },
      success: function (rest) {
        if (rest.data.respData.experienceCardUsed == true){
          that.setData({
            getType:false,
            drawType:true,
          })
        }else{
          that.setData({
            getType: true,
            drawType: false,
          })
        }
        if (rest.data.respData.memberStatus == "MEMBERS"){
          that.setData({
            member: "会员到期："+rest.data.respData.effectiveTo.substring(0,10)
          })
        }
        if (rest.data.respData.memberStatus == "EXPIRED_MEMBERS") {
          that.setData({
            member: '您的会员已过期'
          })
        }
        if (rest.data.respData.memberStatus == "NON_MEMBERS") {
          that.setData({
            member: '您还不是会员'
          })
        }
        
      }
    })
  },

  onReady: function() {

  },

  onShow: function() {

  },

  onHide: function() {

  },

  onUnload: function() {

  },

  onPullDownRefresh: function() {
    wx.showLoading({
      title: '加载中...',
    })
    this.onLoad();
    wx.stopPullDownRefresh();
    wx.hideLoading();
  },

  onReachBottom: function() {

  },
  //领取7天会员
  buyCard:function(){

    wx.request({
      url: `${url}/new/recharge/experienceCard`,
      method:"POST",
      header: {
        'Cookie': "JSESSIONID=" + cache.get('sessionId', 'null')
      },
      success:function(rest){
        if(rest.data.respDesc == "成功"){
          wx.showModal({
          showCancel:false,
          confirmText:'暗示满意',
          title: '领取体验卡成功',
          content: '您将享受超低折扣，尽情享受我家的便利吧 ^_^ ',
          complete:function(){
              wx.switchTab({
                url: '../my/my',
              })
            }
          })
        }
        if (rest.data.respDesc == "已经领取过体验卡") {
          wx.showToast({
            title: '您已领取过了',
            icon: 'none'
          })
        }
      }
    })
  },
  //购买月卡
  purchase:function(){
    let that = this;
    that.setData({
      dredge:true,//支付禁用
    })
    util.showLoading('加载中...');
    wx.request({
      url: `${url}/buy/card/${that.data.stuckNum}`,
      method: "POST",
      header: {
        'Cookie': "JSESSIONID=" + cache.get('sessionId', 'null')
      },
      success: function (rest) {
        util.hideLoading()
        console.log(rest);
        console.log(rest.data);
        wx.requestPayment({
          timeStamp: rest.data.data.timeStamp,
          nonceStr: rest.data.data.nonceStr,
          package: rest.data.data.package,
          signType: rest.data.data.signType,
          paySign: rest.data.data.paySign,
          success:function(rest){
            console.log(rest)
            that.setData({
              dredge: false,//支付不禁用
            })
            wx.showModal({
              title: '开通成功',
              content: '会员卡购买成功，状态更改可能会有几分钟的延时，请见谅',
              showCancel: false,
            })
          },
          fail:function(){
            that.setData({
              dredge: false,//支付不禁用
            })
            wx.showModal({
              title: '开通失败',
              content: '请稍后重试',
              showCancel: false,
            })
          }
        })
      },
      fail:function(res){
        util.hideLoading()
      }
    })
  }
})