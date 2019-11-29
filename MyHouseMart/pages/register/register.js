// pages/register/register.js
var call = require("../../utils/call.js");
var utils = require("../../utils/util.js");
var cache = require("../../utils/cache.js");
import _http from '../../utils/request.js';
import axios from '../../utils/axios.js';
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    code:"",
    openId: '',
    shareType: "",
    codes:true,
    userInfo:{},
    user:true,
    show:false,
    formId:null,
    getPhoneNumber:false
  },
  // bindsubmit(e){
  //   console.log(e)
  //   this.setData({
  //     formId: e.detail.formId
  //   })
  // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  closeUp(data) {
    axios.getData({
      isToast: true,
      url: `${app.baseUrl}service-member/public/user/pop/windows/${cache.get("userId", "null")}/${data}`
    }).then(res => {
      app.globalData.number = res.data.respData
    })
  },
  popUp(e) {
    let order = {}
    axios.getData({
      isToast: true,
      url: `${app.baseUrl}service-member/public/user/pop/windows/${cache.get("userId", this)}`
    }).then(res => {
      let index = res.data.respData.ifEnterMemberDetail
      let str = index.split("");
      app.globalData.number = index
    })
  },
  userInfo(e){
    console.log(e)
    if (e.detail.cloudID){
       let data = {
            "jsCode":this.data.code,
            "username": e.detail.userInfo.nickName,
            "shareplanId":cache.get("openId","null"),
            "shareLoginCode":cache.get("shareType","null"),
            "province": e.detail.userInfo.province,
            "gender": e.detail.userInfo.gender,
            "country": e.detail.userInfo.country,
            "city": e.detail.userInfo.city,
            "formId": cache.get("formId", "null"),
            "referenceCode": cache.get("referenceCode", "null"),
            "avatarUrl": e.detail.userInfo.avatarUrl,
       }
      call.postData("/service-member/weChat/v2/register", data, (res) => {
        console.log(res)
        cache.put("userId", res.data)
        cache.put("sessionId", res.sessionID)
        this.popUp(0)
        this.getUserInfo()
      })
    }
  },
  getUserInfo() {
    _http.get({
      url: `${app.baseUrl}service-member/new/query/usrInfo`,
      header: {
        'Cookie': "JSESSIONID=" + cache.get('sessionId', 'null')
      }
    }).then((res) => {
      console.log(res)
      if (res) {
        if (res.data.mobile==""){
          this.setData({
            userInfo: res.data,
            getPhoneNumber: true
          });
        }else{
          let that = this
          if (app.globalData.skip) {
            wx.redirectTo({
              url: '/my_member/inviteFriends/inviteFriends',
              success(){
                let number = app.globalData.number.split("")
                number[2] = "0"
                let str = number.join("")
                that.closeUp(str)
              }
            })
          } else {
            wx.navigateBack({
              success(){
                let number = app.globalData.number.split("")
                number[2] = "0"
                let str = number.join("")
                that.closeUp(str)
              }
            })
          }
        }
        
      
      }
    })
  },
  //获取手机号码
  number: function (e) {
    let that = this
    if (e.detail.iv) {
      utils.wxLogin(res => {
        axios.postData({
          url: `${app.baseUrl}service-member/public/weChat/update/mobil`,
          data: {
            "jsCode": res,
            "encryptedData": e.detail.encryptedData,
            "iv": e.detail.iv
          }
        }).then(res => {
          that.showToast('绑定成功');
          if (app.globalData.skip) {
            wx.redirectTo({
              url: '/my_member/inviteFriends/inviteFriends',
              success() {
                let number = app.globalData.number.split("")
                number[2] = "0"
                let str = number.join("")
                that.closeUp(str)
              }
            })
          } else {
            wx.navigateBack({
              success() {
                let number = app.globalData.number.split("")
                number[2] = "0"
                let str = number.join("")
                that.closeUp(str)
              }
            })
          }
        
        }, res => {//失败
          that.showToast(res.data.respDesc)
          wx.navigateBack({})
        })
      }, res => {//失败
        that.showToast(res.data.respDesc)
        wx.navigateBack({})
      })
    }
  },
  showToast: function (tips) {
    wx.showToast({ title: tips, icon: 'none', duration: 1500 })
  },
  Nlogin(){
    wx.navigateBack({

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

   let that =this
    wx.getSetting({
      success(res){
        if (res.authSetting["scope.userInfo"]){
        }else{
          utils.wxLogin((res) => {
            that.setData({
              code: res
            })
            
          })
        } 
      }
    })


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