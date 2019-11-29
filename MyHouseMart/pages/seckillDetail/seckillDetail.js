const app = getApp();
const call = require("../../utils/call.js");
const cache = require("../../utils/cache.js");
let time
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatordots: false,
    commodity: [], //点击的商品
    stop: false, //已售罄时禁用
    btnText: '加入购物车',
    bigPic: '', //大图
    detailPic: [], //商品详情图
    shoppingNoticImg: '', //配送说明图
    chooseNoticImg: '', //选品说明图
    extOptions: [],
    specification: false,
    cartQuantity: 0,
    show: false,
    current: 0,
    presell: false,
    Today: ['00', '00', '00'],
    finish: false, //预售活动开始
    unclosed: false, //预售未开始
    percentage: 0,
    close: false,
    confine: false,
    stId: 0,
    memberStatus: null,
    videoLink: [],
    autoPlay: false,

  },
  //判断是否是会员
  judegVip() {
    let data = []
    let cookie = "JSESSIONID=" + cache.get("sessionId", "null")
    call.getCookie("/service-member/new/query/usrInfo", cookie, data, (res) => {
      console.log(res)
      this.setData({
        memberStatus: res.respData.memberStatus
      })
    }, (res) => {})
  },
  //跳转购物车
  cartDetail() {
    wx.navigateTo({
      url: '../commonCart/commonCart',
    })
  },
  // 阻止事件向下传递
  preventTouchMove() {},
  //点击提醒我
  remindMy(i) {
    console.log("点击提醒");
    let formId = i.detail.formId
    let data = {
      "formId": formId,
      "openId": wx.getStorageSync("openId"),
      "stId": this.data.commodity.stId,
      "blId": this.data.blId,
      "notificationStatus": "REQUESTED",
      "notificationItem": this.data.commodity.itemNo,
      "typekey": "SECKILL",
      "userId": wx.getStorageSync("userId"),
      "branchNo": this.data.branchNo
    }
    call.postData("/service-order-prc/notifications/clickNotificationsStatus", data, (res) => {
      wx.showToast({
        title: '设置成功，商品开抢前会在服务通知提醒你！',
        icon: "none"
      })
      let commodity = this.data.commodity
      commodity.remindMe = false
      this.setData({
        commodity: commodity
      })
    }, (res) => {
      wx.showToast({
        title: '服务器出问题了,等一下吧',
        icon: "none"
      })
    })
  },
  //取消提醒
  noremindMy(i) {
    console.log("取消提醒");
    let formId = i.detail.formId
    let data = {
      "formId": formId,
      "openId": wx.getStorageSync("openId"),
      "stId": this.data.commodity.stId,
      "blId": this.data.blId,
      "notificationStatus": "CANCELLED",
      "notificationItem": this.data.commodity.itemNo,
      "typekey": "SECKILL",
      "userId": wx.getStorageSync("userId"),
      "branchNo": this.data.branchNo
    }
    call.postData("/service-order-prc/notifications/clickNotificationsStatus", data, (res) => {
      wx.showToast({
        title: '已取消提醒',
        icon: "none"
      })
      let commodity = this.data.commodity
      commodity.remindMe = true
      this.setData({
        commodity: commodity
      })
    }, (res) => {
      wx.showToast({
        title: '服务器出问题了,等一下吧',
        icon: "none"
      })
    })
  },
  //跳转购物车
  skipCart() {
    wx.getSetting({
      success(res) {
        if (res.authSetting["scope.userInfo"]) {
          wx.navigateTo({
            url: '../commonCart/commonCart',
          })
        }else{
            wx.navigateTo({
              url: '/pages/register/register',
            })
        }
      }
    })
  
  },
  timeTrans(date) {
    let total = date;
    let day = parseInt(total / (24 * 60 * 60)); //计算整数天数
    let afterDay = total - day * 24 * 60 * 60; //取得算出天数后剩余的秒数
    let hour = parseInt(afterDay / (60 * 60)); //计算整数小时数
    let afterHour = total - day * 24 * 60 * 60 - hour * 60 * 60; //取得算出小时数后剩余的秒数
    let min = parseInt(afterHour / 60); //计算整数分
    let afterMin = total - day * 24 * 60 * 60 - hour * 60 * 60 - min * 60; //取得算出分后剩余的秒数
    hour = hour < 10 ? "0" + parseInt(hour) : parseInt(hour)
    min = min < 10 ? "0" + parseInt(min) : parseInt(min)
    afterMin = afterMin < 10 ? "0" + parseInt(afterMin) : parseInt(afterMin)
    return [hour, min, afterMin]
  },
  TodayDate(startDate, endDate) {
    if (typeof startDate != 'undefined' || typeof endDate != 'undefined') {
      let d = new Date(),
        newDate = d.getFullYear() + "-" + (d.getMonth() * 1 + 1) + "-" + d.getDate() + "-" + startDate.replace(/:/g, "-"),
        endDates = d.getFullYear() + "-" + (d.getMonth() * 1 + 1) + "-" + d.getDate() + "-" + endDate.replace(/:/g, "-"),
        startArr = newDate.split("-"),
        endArr = endDates.split("-"),
        _TimeStart = new Date(Date.UTC(startArr[0], startArr[1] - 1, startArr[2], startArr[3] - 8, startArr[4], startArr[5])),
        _TimeEnd = new Date(Date.UTC(endArr[0], endArr[1] - 1, endArr[2], endArr[3] - 8, endArr[4], endArr[5])),
        _TimeRubbingStart = _TimeStart.getTime() / 1000, //开始时间搓
        _TimeRubbingEnd = _TimeEnd.getTime() / 1000, //结束时间搓 
        NewTimeRubbing = d.getTime() / 1000; //本地时间搓
      if (NewTimeRubbing < _TimeRubbingStart) { //活动未开始
        this.setData({
          unclosed: true,
          Today: this.timeTrans(_TimeRubbingStart - NewTimeRubbing)
        })
      } else if (NewTimeRubbing > _TimeRubbingEnd) { //活动一结束
        this.setData({

        })
      } else {
        let date = _TimeRubbingEnd - NewTimeRubbing
        this.setData({
          Today: this.timeTrans(date)
        })
      }
    } else {
      /**
       * 传入值不准为空
       */
      clearInterval(time)
      throw new Error(`The value passed in is not allowed to be undefined:startDate:${startDate},endDate:${endDate}`)
    }
  },

  bindchange(e) {

    this.setData({
      current: e.detail.current
    })
  },
  //正在播放或者暂停
  bindplay(e) {
    this.setData({
      autoPlay: false
    })
  },
  //暂停播放
  bindpause(e) {
    this.setData({
      autoPlay: true
    })
  },
  //播放完了
  bindended(e) {
    this.setData({
      autoPlay: false
    })
  },
  //加入购物车
  rob() {
    let that =this
    wx.getSetting({
      success(res) {
        if (res.authSetting["scope.userInfo"]) {
          if (that.data.commodity.stockQty <= 0) {
            wx.showToast({
              icon: "none",
              title: '已经售完了哦',
            })
          } else {
            if (that.data.commodity.quantity >= that.data.commodity.stockQty) {
              that.setData({
                confine: true
              })
              wx.showToast({
                icon: "none",
                title: '已达限售数',
              })
            } else {
              if (that.data.commodity.limitedByUser == null) { //无限购买

                let data = {
                  "sessionId": cache.get("sessionId", null),
                  "itemNo": that.data.commodity.itemNo,
                  "quantity": "1",
                  "branchNo": that.data.branchNo,
                  "blId": cache.get("blId", null),
                  "activitySalePrice": that.data.commodity.activitySalePrice,
                  "limitedByUser": that.data.commodity.limitedByUser,
                  "stId": that.data.commodity.stTimes[0].stId,
                  "isCombined": that.data.commodity.isCombined,
                  "combSubItems": that.data.commodity.combSubItems
                }
                call.postData("/service-item/trolley/addItemToTrolley", data, (res) => {
                  that.data.commodity.quantity += 1
                  that.setData({
                    cartQuantity: that.data.cartQuantity + 1,
                    commodity: that.data.commodity

                  })
                  wx.showToast({
                    icon: "none",
                    title: '加入成功',
                  })
                }, (rest) => {
                  wx.showToast({
                    icon: "none",
                    title: rest.respDesc,
                  })
                })
              } else {
                if (that.data.commodity.quantity >= that.data.commodity.limitedByUser) {
                  that.setData({
                    confine: true
                  })
                  wx.showToast({
                    icon: "none",
                    title: '已达购买上限',
                  })
                } else {
                  if (that.data.commodity.quantity >= that.data.commodity.vQuantityTotal) {
                    that.setData({
                      confine: true
                    })
                    wx.showToast({
                      icon: "none",
                      title: '已达限售数',
                    })
                  } else {

                    let data = {
                      "sessionId": cache.get("sessionId", null),
                      "itemNo": that.data.commodity.itemNo,
                      "quantity": "1",
                      "branchNo": that.data.branchNo,
                      "blId": cache.get("blId", null),
                      "activitySalePrice": that.data.commodity.activitySalePrice,
                      "limitedByUser": that.data.commodity.limitedByUser,
                      "stId": that.data.commodity.stTimes[0].stId,
                      "isCombined": that.data.commodity.isCombined,
                      "combSubItems": that.data.commodity.combSubItems
                    }
                    call.postData("/service-item/trolley/addItemToTrolley", data, (res) => {
                      that.data.commodity.quantity += 1

                      that.setData({
                        commodity: that.data.commodity,
                        cartQuantity: that.data.cartQuantity + 1
                      })
                      wx.showToast({
                        icon: "none",
                        title: '加入成功',
                      })
                    }, (rest) => {
                      wx.showToast({
                        icon: "none",
                        title: rest.respDesc,
                      })
                    })
                  }
                }
              }
            }
          }
        }else{
            wx.navigateTo({
              url: '/pages/register/register',
            })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let details = app.globalData.seckillDetail[0]
    let that = this
    that.setData({
      blId: options.blId,
      branchNo: options.branchNo
    })
    console.log("details", details)
    
    if (details.currentQuantity == 0) {
      this.setData({
        percentage: 0
      })
    } else {
      this.setData({
        percentage: (details.currentQuantity / details.vQuantityTotal * 100).toFixed(2)
      })
    }
    time = setInterval(() => {
      this.TodayDate(details.dateForm + ":00", details.dateTo + ":00")
    }, 1000)

    //秒杀
    that.setData({
      commodity: details,
    })
    console.log(that.data.commodity)
    if (that.data.commodity.stockQty == 0) {
      that.setData({
        stop: true,
        btnText: '已售罄',
      })
    } else if ((that.data.commodity.itemStatus == "FORSALE")) {
      that.setData({
        stop: true,
        btnText: '待售',
      })
    }
    wx.showLoading({
      title: '加载中...',
    })
    setTimeout(() => {
      wx.hideLoading()
    }, 500)
    let data = []
    call.getData("/service-item/user/get/item/detail/by/BranchNoAnditemNo/" + this.data.branchNo + "/" + that.data.commodity.itemNo, data, (t) => {
      that.setData({
        videoLink: t.respData.picDetailDTO == null ? "" : t.respData.picDetailDTO.videoLink,
        bigPic: t.respData.picDetailDTO == null ? '' : t.respData.picDetailDTO.bigPic, //大图
        detailPic: t.respData.picDetailDTO == null ? '' : t.respData.picDetailDTO.detailPic, //商品详情图
        shoppingNoticImg: t.respData.picDetailDTO == null || t.respData.picDetailDTO.extAttributes == null ? '' : t.respData.picDetailDTO.extAttributes.shoppingNoticImg, //配送说明图
        chooseNoticImg: t.respData.picDetailDTO == null || t.respData.picDetailDTO.extAttributes == null ? '' : t.respData.picDetailDTO.extAttributes.chooseNoticImg, //选品说明图
      })
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.quantity()
    this.judegVip()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearInterval(time)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(options) {
    console.log(options)
    let that = this;
    // 设置转发内容
    let shareObj = {
      title: "我家小程序",
      path: '/pages/connectWifi/connectWifi', // 默认是当前页面，必须是以‘/’开头的完整路径
      imgUrl: '', //转发时显示的图片路径，支持网络和本地，不传则使用当前页默认截图。
      success: function(res) {　 // 转发成功之后的回调　　　　　

      },

    };

    return shareObj;
  },
  //规格加入购物车
  joinCart() {

  },

  //返现弹窗
  shade() {
    this.setData({
      show: true
    })
  },

  //购物车数量
  quantity() {
    let data = {

    }
    call.getData("/service-item/trolley/queryTrolleyCount?branchNo=" + this.data.branchNo + "&sessionId=" + cache.get("sessionId", this), data, (res) => {
      console.log(res)
      this.setData({
        cartQuantity: res.respData
      })
    })
  },
  //关闭提醒
  close() {
    this.setData({
      show: false
    })
  }
})