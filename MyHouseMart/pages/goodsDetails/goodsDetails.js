const app = getApp();
import axios from '../../utils/axios.js'
const call = require("../../utils/call.js");
const cache = require("../../utils/cache.js");
import {
  base64src
} from '../../utils/base64src.js'
let time, userName
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatordots: false,
    commodity: [], //点击的商品
    merchandise: 0, //该商品已存在购物车的数量
    counts: 0,
    count: 0,
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
    Today: "",
    finish: false, //预售活动开始
    unclosed: false, //预售未开始
    percentage: 0,
    close: false,
    videoLink: [],
    autoPlay: false,
    isShowOutFood: false, //展示供应说明
    type: null, //是否礼包商品
    specification: [],
    option: false,
    options: [],
    extOptions: [],
    showExplain: false,
    remoteArea: [],
    branchNo: null,
    status: null, //商品的状态 新会员超值购 sendMember 续费大礼包 greatPackage
    hideModal: true, //模态框的状态  true-隐藏  false-显示
    animationData: {}, //
    showCanvas: false,
    width: 0,
    height: 0,
    imageCode: "",
    code: "",
    userAuthorization: false
  },
  remoteArea() {
    axios.get({
      url: `${app.baseUrl}service-mall/address/query/notdist`
      // url: `http://10.0.1.75:5700/address/query/notdist`

    }).then(res => {
      let message = res.data.respData
      if (message.length) {
        this.setData({
          remoteArea: message,
        })
      }
    })
  },

  //开启加入购物车弹窗
  rob() {
    if (this.data.commodity.limitedByUser == 0 || this.data.commodity.stockQty == 0) {

    } else {
      this.setData({
        close: true
      })
    }
  },
  closeExplain(e) {
    let type = e.currentTarget.dataset.type
    if (type == "close") {
      this.setData({
        showExplain: false
      })
    } else if (type == "open") {
      this.setData({
        showExplain: true
      })
    }

  },
  // 阻止事件向下传递
  preventTouchMove() {},
  freeBuy: function(e) {
    const {
      item: items
    } = e.currentTarget.dataset
    const {
      salePrice: originaPrice,
      disPrice: totalPrice
    } = items
    let {
      combSubItems,
      orderItemType
    } = items, order = [], itemQty = 0
    combSubItems.map(item => {
      item.orderItemType = orderItemType
      itemQty += item.quantity
    })
    items.isCombined = 'Y'
    items.itemQty = itemQty
    items.quantity = 1
    items.blId = items.blId ? items.blId : 0
    items.returnMoney = false
    items.refundValue = items.refundValue * 1
    order.push(items)
    app.globalData.order = order
    wx.navigateTo({
      url: `/pages/confirmOrder/confirmOrder?commoditStatus=myPage&originaPrice=${originaPrice}&totalPrice=${totalPrice}&status=${this.data.status}`
    })
  },
  //点击提醒我
  remindMy(i) {
    let fromId = i.detail.fromId
    let data = {
      "openId": wx.getStorageSync("openId"),
      "formId": fromId,
      "stId": this.data.commodity.stId,
      "userId": wx.getStorageSync("userId"),
      "notificationStatus": "REQUESTED",
      "notificationItem": this.data.commodity.itemNo,
      "blId": this.data.commodity.blId,
      "branchNo": app.globalData.branch.branchNo,
      "typeKey": "PRESELL"
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
        title: '服务器出问题了,等一下呢',
        icon: "none"
      })
    })
  },

  //取消提醒
  noremindMy(i) {
    let fromId = i.detail.fromId
    let data = {
      "openId": wx.getStorageSync("openId"),
      "formId": fromId,
      "stId": this.data.commodity.stId,
      "userId": wx.getStorageSync("userId"),
      "notificationStatus": "CANCELLED",
      "notificationItem": this.data.commodity.itemNo,
      "blId": this.data.commodity.blId,
      "branchNo": app.globalData.branch.branchNo,
      "typeKey": "PRESELL"
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
        title: '服务器出问题了,等一下呢',
        icon: "none"
      })
    })
  },
  //关闭弹窗
  close() {
    this.setData({
      close: false
    })
  },
  skipCart() {
    wx.navigateTo({
      url: '../commonCart/commonCart',
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
        console.log(this.data.Today)

      } else if (NewTimeRubbing > _TimeRubbingEnd) { //活动一结束
        this.setData({
          finish: true,
          Today: this.timeTrans(_TimeRubbingEnd + 86400000 - NewTimeRubbing)
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
  //去到确认订单
  toVip() {
    let arr = []
    arr.push(this.data.commodity)
    let item = this.data.commodity
    console.log(arr)
    let isStatus = undefined
    arr.map(i => {
      console.log(i)
      i.comb = false
      i.thumbPic = i.picAddr
      i.vipPrice = i.salePrice
      i.bizLine = 'Presale'
      i.stTimes.push({
        activityTimeFrom: i.dateFrom,
        activityTimeTo: i.dateTo,
        deliveryTimeFrom: i.deliveryTimeFrom == undefined ? null : i.deliveryTimeFrom,
        deliveryTimeTo: i.deliveryTimeTo == undefined ? null : i.deliveryTimeTo
      })
    })
    app.globalData.order = arr;
    const originaPrice = item.salePrice * item.quantity;
    const totalPrice = item.activitySalePrice == null ? item.salePrice * item.quantity : item.activitySalePrice * item.quantity;
    wx.navigateTo({
      url: `/pages/confirmOrder/confirmOrder?commoditStatus=Presale&isStatus=${isStatus}&originaPrice=${originaPrice}&totalPrice=${totalPrice}`,
    })
  },
  //点击开通会员进入
  toVips() {
    let arr = []
    arr.push(this.data.commodity)
    let item = this.data.commodity
    let isStatus = true
    console.log(arr)
    arr.map(i => {
      console.log(i)
      i.comb = false
      i.thumbPic = i.picAddr
      i.vipPrice = i.salePrice
    })
    app.globalData.order = arr;
    const originaPrice = item.salePrice * item.quantity;
    const totalPrice = item.activitySalePrice == null ? item.salePrice * item.quantity : item.activitySalePrice * item.quantity;
    wx.navigateTo({
      url: `/pages/confirmOrder/confirmOrder?commoditStatus=Presale&isStatus=${isStatus}&originaPrice=${originaPrice}&totalPrice=${totalPrice}`,
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
  plus(e) {
    let type = e.currentTarget.dataset.type
    if (type == "add") { //加
      if (this.data.commodity.limitedByUser == 0) {

      } else if (this.data.commodity.limitedByUser == null) {
        this.data.commodity.quantity++
          this.setData({
            commodity: this.data.commodity
          })
      } else {
        if (this.data.commodity.quantity > this.data.commodity.limitedByUser - 1) {
          wx.showToast({
            icon: "none",
            title: '已达最大限制啦',
          })
        } else {
          this.data.commodity.quantity++
            this.setData({
              commodity: this.data.commodity
            })
        }
      }
    } else if (type == "reduce") { //减
      if (this.data.commodity.quantity > 1) {
        this.data.commodity.quantity--
          this.setData({
            commodity: this.data.commodity
          })
      } else {
        this.setData({
          close: false
        })
      }
    }
  },
  bindchange(e) {
    this.setData({
      // autoPlay:false,
      current: e.detail.current
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.remoteArea()
    let that = this;
    let details = JSON.parse(options.details)
    console.log(options.type)
    details = {
      quantity: 1,
      ...details
    }
    if (details.currentQuantity == 0) {
      this.setData({
        percentage: 0
      })
    } else {
      this.setData({
        percentage: (details.currentQuantity / details.vQuantityTotal * 100).toFixed(2)
      })
    }

    if (details.dateFrom) { //判断是否为预售
      this.setData({
        presell: true
      })
      time = setInterval(() => {
        this.TodayDate(details.dateFrom, details.dateTo)
      }, 1000)
    }
    that.setData({
      commodity: details,
      type: options.type,
      status: options.status
    })
    console.log(that.data.type)
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
    call.getData("/service-item/user/get/item/detail/by/BranchNoAnditemNo/" + app.globalData.branch.branchNo + "/" + that.data.commodity.itemNo, data, (t) => {
      that.setData({
        videoLink: t.respData.picDetailDTO == null ? "" : t.respData.picDetailDTO.videoLink,
        bigPic: t.respData.picDetailDTO == null ? '' : t.respData.picDetailDTO.bigPic, //大图
        detailPic: t.respData.picDetailDTO == null ? '' : app.trimSpace(t.respData.picDetailDTO.detailPic), //商品详情图
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
    let that = this
    wx.getSetting({
      success(res) {
        // that.orderData(1, 5, that.data.nav[that.data.i].type)
        if (res.authSetting["scope.userInfo"]) { //true  代表已经获取信息
          that.setData({
            userAuthorization: true
          })
          wx.getUserInfo({
            success(res) {
              userName = res.userInfo.nickName
            }

          })
        } else {
          that.setData({
            userAuthorization: false
          })
        }
      }
    })
    that.setData({
      branchNo: app.globalData.branch.branchNo
    })
    that.quantity()
    that.code()
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


  //规格加入购物车
  joinCart() {

  },
  //关闭规格
  over() {
    this.setData({
      specification: false
    })
  },
  //空白点击规格关闭
  specification() {
    this.setData({
      specification: false
    })
  },
  //规格点击
  shut(i) {
    console.log(i)
    console.log(this.data.extOptions)
    this.data.extOptions[i.currentTarget.dataset.i].options.map((a, ic) => {
      this.data.extOptions[i.currentTarget.dataset.i].options[ic].isShow = false
    })
    this.data.extOptions[i.currentTarget.dataset.i].isShow = true
    this.data.extOptions[i.currentTarget.dataset.i].options[i.currentTarget.dataset.index].isShow = true
    this.setData({
      extOptions: this.data.extOptions,
    })
  },
  //返现弹窗
  shade() {
    this.setData({
      show: true
    })
  },
  toggleToast(e) {
    this.setData({
      cartQuantity: e.detail
    })
  },
  hide(e) {
    this.setData({
      option: e.detail
    })
  },
  //加入购物车
  shopping: function(e) {
    let that = this
    wx.getSetting({
      success(res) {
        if (res.authSetting["scope.userInfo"]) {
          let item = e.target.dataset.item
          let option = item.extOptions
          let specification = item
          if (item.extOptions == null || item.extOptions.length == 0) {
            let data = {
              "sessionId": cache.get("sessionId", null),
              "itemNo": that.data.commodity.itemNo,
              "branchNo": app.globalData.branch.branchNo,
              "quantity": "1",
              "blId": that.data.commodity.blId,
              "isCombined": that.data.commodity.isCombined,
              "combSubItems": that.data.commodity.combSubItems
            }
            call.postData("/service-item/trolley/addItemToTrolley", data, (res) => {
              wx.showToast({
                icon: "none",
                title: '加入购物车成功',
                success(res) {
                  that.setData({
                    cartQuantity: that.data.cartQuantity + 1
                  })
                }
              })
              console.log(that.data.cartQuantity)
            }, (rest) => {
              wx.showToast({
                icon: "none",
                title: rest.respDesc,
              })
            })
          } else {
            that.setData({
              specification: specification,
              options: option,
              option: true //显示规格
            })
          }
        } else {
          wx.navigateTo({
            url: '/pages/register/register',
          })
        }
      }
    })
  },
  //购物车数量
  quantity() {
    let data = {

    }
    call.getData("/service-item/trolley/queryTrolleyCount?branchNo=" + app.globalData.branch.branchNo + "&sessionId=" + cache.get("sessionId", this), data, (res) => {
      console.log(res)
      this.setData({
        cartQuantity: res.respData
      })
    })
  },
  // 关闭供应说明弹窗
  isOutfood() {
    let that = this
    let isShowOutFood = that.data.isShowOutFood
    this.setData({
      isShowOutFood: !isShowOutFood
    })
  },
  //海报js
  pathPromise(url) {
    return new Promise((resolue, reject) => {
      wx.getImageInfo({
        src: url,
        success(res) {
          return resolue(res.path)
        }
      })
    })
  },
  rpxPromise() {
    return new Promise((resolute, reject) => {
      wx.getSystemInfo({
        success: function(res) {
          return resolute(res)
        },
      })
    })
  },
  closeCanvas() {
    this.setData({
      showCanvas: false,
    })
  },
  code() {
    let data = {
      "scene": this.data.commodity.blId + "-" + this.data.commodity.itemNo + "-" + app.globalData.branch.branchNo,
      "page": "my_member/shareDetail/shareDetail",
      "width": 200
    }
    wx.request({
      url: `${app.baseUrl}service-member/public/wx/code`,
      data: data,
      method: 'POST',
      responseType: 'arraybuffer',
      success: res => {
        let base64 = wx.arrayBufferToBase64(res.data);
        base64 = 'data:image/jpeg;base64,' + base64;
        this.setData({
          imageCode: base64
        });
        // //这个就是src   imageCode
        // const that = this
        // wx.getSystemInfo({
        //   success: function (res) {
        //     that.setData({
        //       model: res.model,
        //       screenWidth: res.windowWidth / 375,
        //       screenHeight: res.windowHeight
        //     })
        //   },
        // })
        base64src(base64, res => {
          this.setData({
            code: res
          })
        });
      }
    })
  },
  setCanvas() {
    let path = "https://antspace-dev-img-1.oss-cn-shenzhen.aliyuncs.com/f16b205b20bf494c9bb86694019beb9c.png"
    let codeUrl = "https://antspace-prod-img-1.oss-cn-shenzhen.aliyuncs.com/16b5af2afaa.png"

    Promise.all([this.pathPromise(this.data.commodity.picAddr ? this.data.commodity.picAddr : codeUrl), this.rpxPromise(), this.pathPromise(path)]).then(res => {
      this.setData({
        showCanvas: true,
        width: (290 / 375) * res[1].screenWidth,
        height: (430 / 667) * res[1].screenHeight
      })
      let paths = res[2]
      let code = this.data.code
      let that = this
      let url = res[0]
      let windowWidth = res[1].screenWidth
      let windowHeight = res[1].screenHeight
      let ctx = wx.createCanvasContext('mycanvas');
      ctx.drawImage(paths, 0, 0, (290 / 375) * windowWidth, (430 / 667) * windowHeight);
      ctx.drawImage(url, (16 / 375) * windowWidth, (16 / 667) * windowHeight, (258 / 375) * windowWidth, (258 / 667) * windowHeight);
      if (that.data.commodity.disPrice == null) {
        ctx.setFillStyle("#FF5A52")
        ctx.setFontSize(24)
        ctx.fillText("¥" + that.data.commodity.salePrice.toFixed(2), (16 / 375) * windowWidth, (310 / 667) * windowHeight)
      } else {
        ctx.setFillStyle("#FF5A52")
        ctx.setFontSize(24)
        ctx.fillText("¥" + that.data.commodity.disPrice.toFixed(2), (16 / 375) * windowWidth, (310 / 667) * windowHeight)
      }
      ctx.setFillStyle("#A0A1A3")
      ctx.setFontSize(15)
      let length = parseInt(that.data.commodity.salePrice).toString().length
      let width, moveToWidth, lineToWidth
      if (length == 1) {
        width = 86
        moveToWidth = 86
        lineToWidth = 125
      } else if (length == 2) {
        width = 102
        moveToWidth = 102
        lineToWidth = 142
      } else if (length == 3) {
        width = 120
        moveToWidth = 120
        lineToWidth = 160
      }
      let itemName = that.data.commodity.itemName
      let itemNameLength = that.data.commodity.itemName.length
      let firstText, secondText, threeText
      if (itemNameLength <= 10) {
        firstText = itemName.substring(0, 10)
      } else if (10 < itemNameLength <= 20) {
        console.log(itemNameLength)
        firstText = itemName.substring(0, 10)
        secondText = itemName.substring(10, 20)
        threeText = itemName.substring(20, 30)
      } else {
        firstText = itemName.substring(0, 10)
        secondText = itemName.substring(10, 20)
        threeText = itemName.substring(20, 30)
      }
      ctx.fillText("¥" + that.data.commodity.salePrice.toFixed(2), (width / 375) * windowWidth, (308 / 667) * windowHeight)
      ctx.beginPath()
      ctx.setStrokeStyle('#A0A1A3')
      ctx.setLineWidth(1)
      ctx.moveTo((moveToWidth / 375) * windowWidth, (303 / 667) * windowHeight)
      ctx.lineTo((lineToWidth / 375) * windowWidth, (303 / 667) * windowHeight)
      ctx.stroke()
      ctx.fillStyle = "#2B2D33";
      ctx.setFontSize(15)
      ctx.fillText(firstText, (16 / 375) * windowWidth, (354 / 667) * windowHeight);
      if (secondText) {
        ctx.fillStyle = "#2B2D33";
        ctx.setFontSize(15)
        ctx.fillText(secondText, (16 / 375) * windowWidth, (374 / 667) * windowHeight);
      }
      if (threeText) {
        ctx.fillStyle = "#2B2D33";
        ctx.setFontSize(15)
        ctx.fillText(threeText, (16 / 375) * windowWidth, (394 / 667) * windowHeight);
      }
      ctx.drawImage(code, (186 / 375) * windowWidth, (292 / 667) * windowHeight, 88, 88);
      ctx.fillStyle = "#67686B";
      ctx.setFontSize(12)
      ctx.fillText("扫码立即购买", (194 / 375) * windowWidth, (395 / 667) * windowHeight);
      ctx.restore();
      ctx.save();
      ctx.draw();

    }).catch(res => {
      console.log(res)
    })
  },

  //点击保存本地
  saveShareImg: function() {
    var that = this;
    wx.showLoading({
      title: '正在保存',
      mask: true,
    })
    setTimeout(function() {
      wx.canvasToTempFilePath({
        canvasId: 'mycanvas',
        success: function(res) {
          wx.hideLoading();
          var tempFilePath = res.tempFilePath;
          wx.saveImageToPhotosAlbum({
            filePath: tempFilePath,
            success(res) {
              wx.showModal({
                content: '图片已保存到相册，赶紧晒一下吧~',
                showCancel: false,
                confirmText: '好的',
                confirmColor: '#333',
                success: function(res) {
                  if (res.confirm) {
                    that.setData({
                      showCanvas: false,
                    })
                  }
                },
                fail: function(res) {}
              })
            },
            fail: function(res) {
              that.setData({
                showCanvas: false,
              })
              wx.showToast({
                title: res.errMsg,
                icon: 'none',
                duration: 2000
              })
            }
          })
        }
      });
    }, 200);
  },
  // 生成海报 
  createYard() {
    var that = this;
    var animation = wx.createAnimation({
      duration: 800, //动画的持续时间 默认400ms   数值越大，动画越慢   数值越小，动画越快
      timingFunction: 'ease', //动画的效果 默认值是linear
    })
    this.animation = animation
    that.fadeDown(); //调用隐藏动画   
    setTimeout(function() {
      that.setData({
        hideModal: true
      })
      that.setCanvas()
    }, 200) //先执行下滑动画，再隐藏模块
  },
  Wxshare() {

  },
  //分享弹窗 js 
  onShareAppMessage: function(options) {
    let that = this

    var shareObj = {
      title: userName + "亲情推荐",
      path: `/my_member/shareDetail/shareDetail?itemNo=${this.data.commodity.itemNo}&branchNo=${app.globalData.branch.branchNo}&blId=${this.data.commodity.blId}`,
      imageUrl: '',
      success: function(res) {},
    };
    if (options.from == 'button') {
      shareObj = {
        title: userName + "亲情推荐",
        path: `/my_member/shareDetail/shareDetail?itemNo=${this.data.commodity.itemNo}&branchNo=${app.globalData.branch.branchNo}&blId=${this.data.commodity.blId}`,
        imageUrl: this.data.commodity.picAddr,
        success(res) {},
      }
    }
    return shareObj;
  },
  showModal: function() {
    var that = this;
    if (that.data.userAuthorization) {
      that.setData({
        hideModal: false
      })
      var animation = wx.createAnimation({
        duration: 600, //动画的持续时间 默认400ms   数值越大，动画越慢   数值越小，动画越快
        timingFunction: 'ease', //动画的效果 默认值是linear
      })
      this.animation = animation
      setTimeout(function() {
        that.fadeIn(); //调用显示动画
      }, 200)
    } else {
      wx.navigateTo({
        url: '/pages/register/register',
      })
    }
  },

  hideModal: function() {
    var that = this;
    var animation = wx.createAnimation({
      duration: 800, //动画的持续时间 默认400ms   数值越大，动画越慢   数值越小，动画越快
      timingFunction: 'ease', //动画的效果 默认值是linear
    })
    this.animation = animation
    that.fadeDown(); //调用隐藏动画   
    setTimeout(function() {
      that.setData({
        hideModal: true
      })
    }, 720) //先执行下滑动画，再隐藏模块

  },

  fadeIn: function() {
    this.animation.translateY(0).step()
    this.setData({
      animationData: this.animation.export() //动画实例的export方法导出动画数据传递给组件的animation属性
    })
  },
  fadeDown: function() {
    this.animation.translateY(300).step()
    this.setData({
      animationData: this.animation.export(),
    })
  },
})