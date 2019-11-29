// pages/share/share.js
var utils = require("../../utils/util.js");
var call = require("../../utils/call.js");
var cache = require("../../utils/cache.js");
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shareType:null,
    openId:null,
    listValue:[],
    ruleDesc:[]
  },
//获取分享
share(){
  let data = []
  call.getData("/service-mall/appletshare/queryShare?branchNo=" + app.globalData.branch.branchNo,data,(res)=>{
          let shareType = res.respData
          this.setData({
            ruleDesc:res.respData[0].rule
          })
    shareType.map(i=>{
      if (i.shareType =="APPLET"){
            this.setData({
              shareType: i.shareplanId
            })
      }
    })
  },(res)=>{})
},
//获取openid
openId(){
  let data = []
  call.getData("/service-order-prc/saleOrder/queryopenid?sessionId="+cache.get("sessionId","null"),data,(res)=>{
      this.setData({
        openId: res.respData.openId
      })
  },(res)=>{})
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
//获取好友榜单
list(){
  let data= []
  call.getData("/service-mall/appletshare/seniorityShare?sessionId="+cache.get("sessionId", "null"),data,(res)=>{
    if(res.respData!=null){
      this.setData({
        listValue: res.respData.seniorityShareDTOS,
        ruleDesc: res.respData.ruleDesc
      })
    }

  },(res)=>{})
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
    this.share()
    this.openId()
    this.list()
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
//记录
  record(){
    let data = []
    call.getData("/service-mall/appletshare/shareRecords?sessionId=" + cache.get("sessionId", "null") + "&shareplanId=" + this.data.shareType, data, (res) => {

    }, (res) => { })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {

    var that = this;
    var shareObj = {
      title: "我家小程序",
      path: '/pages/connectWifi/connectWifi',
      imgUrl: '',
      success: function (res) {
      },
    };
    if (options.from === 'button') {
      console.log("我转发成功了")
      that.record() 
      shareObj = {
        title: "我家小程序",
        path: '/pages/connectWifi/connectWifi?shareType=' + that.data.shareType + "&openId=" + that.data.openId,
        imgUrl: '',
        success(res){
                          
        },
      }
     
    }
    return shareObj;
  }
})
