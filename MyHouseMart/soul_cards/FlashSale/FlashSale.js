/**
 * Create Soul.chen 8.11
 * 
 */

let app = getApp()
var call = require("../../utils/call.js")
var url = app.baseUrl + "service-member/";
var urL = app.baseUrl + "service-mall/";
var cache = require("../../utils/cache");
let request = require("../../utils/soul_chen")
let time, startTime, endTime, price, saleprice, refund, TOMORROWTime, timers, items, firstTime = 0
Page({
  data: {
    tabIndex: 2,
    Today: [],
    Yesterday: [],
    isRemind: true,
    isMember: false,
    number: 1,
    explain: false,
    isVip: true,
    dayArr: [],
    preSaleType: ['YESTERDAY', 'TODAY', 'TOMORROW'],
    TODAY: {},
    YESTERDAY: {},
    TOMORROW: {},
    firstMenuItems: 0, //一级菜单选项
    title: '',
    noDate: false,
    isStart: false,
    commodityIndex: "",
    Price: '', //单价
    TotalPrice: '',
    quantityLimitTotal: "",
    TOMORROWDate: [],
    blId: '',
    item: {},
    isDateEnd: true   //今天的活动是否结束
  },
  onLoad(options) {
    this.TabDate()
    this.setData({
      blId: options.blId
    })
    items = typeof options.bizLineCode == 'undefined' ? 'PRESALE' : options.bizLineCode
    this.commodity(this.data.tabIndex - 1)
  },
  onReady() {
    time = setInterval(() => {
      this.TodayDate(startTime, endTime)
    }, 1000),
      this.UserInfo()
    // timers=setInterval(()=>{
    //     this.TOMORROWFUN(TOMORROWTime)
    // },1000)
  },
  onShow() {
    this.UserInfo()
    this.http()
  },
  onHide() {
    this.close()
  },
  onUnload() {
    clearInterval(timers)
    clearInterval(time) //页面卸载时清除定时器
  },
  commodity(index) {
    let {
      preSaleType,
      TODAY,
      YESTERDAY,
      TOMORROW,
      tabIndex,
      blId
    } = this.data
    let json = {
      "branchNo": app.globalData.branch.branchNo,
      "blId": blId,
      "preSaleType": preSaleType[index],
      "userId": wx.getStorageSync("userId")
    }
    if (tabIndex == 2) { //数据只需请求一遍
      if (typeof TODAY.dateFrom == "undefined") {
        request.request('/service-item/public/pre/sale/items', json).then(res => {
          this.setData({
            TODAY: res.respData[0]
          })
          startTime = res.respData[0].dateFrom, endTime = res.respData[0].dateTo
          this.TodayDate(res.respData[0].dateFrom, res.respData[0].dateTo)
        })
      }
    } else if (tabIndex == 1) {
      if (typeof YESTERDAY.dateFrom == "undefined") {
        request.request('/service-item/public/pre/sale/items', json).then(res => {
          this.setData({
            YESTERDAY: res.respData[0]
          })
        })
      }
    } else {
      if (typeof TOMORROW.dateFrom == "undefined") {
        request.request('/service-item/public/pre/sale/items', json).then(res => {
          this.setData({
            TOMORROW: res.respData[0]
          })
          TOMORROWTime = res.respData[0].dateTo
          this.TOMORROWFUN(res.respData[0].dateTo)
        })
      }
    }
  },
  http() {
    let {
      preSaleType,
      TODAY,
      TOMORROW,
      tabIndex,
      blId
    } = this.data
    let json = {
      "branchNo": app.globalData.branch.branchNo,
      "blId": blId,
      "preSaleType": preSaleType[tabIndex - 1],
      "userId": wx.getStorageSync("userId")
    }
    if (tabIndex == 2) {
      request.request('/service-item/public/pre/sale/items', json).then(res => {
        this.setData({
          TODAY: res.respData[0]
        })
        startTime = res.respData[0].dateFrom, endTime = res.respData[0].dateTo
        this.TodayDate(res.respData[0].dateFrom, res.respData[0].dateTo)
      })
    } else if (tabIndex == 3) {
      request.request('/service-item/public/pre/sale/items', json).then(res => {
        this.setData({
          TOMORROW: res.respData[0]
        })
        TOMORROWTime = res.respData[0].dateTo
        this.TOMORROWFUN(res.respData[0].dateTo)
      })
    }
  },
  UserInfo() { //检查是否会员
    let that = this
    wx.request({
      url: `${url}new/query/usrInfo`,
      method: 'GET',
      header: {
        'Cookie': "JSESSIONID=" + cache.get('sessionId', 'null')
      },
      success: function (rest) {
        if (rest.data.respData !== null && rest.data.respData.length !== 0) {
          if (rest.data.respData.memberStatus == "NON_MEMBERS" || rest.data.respData.memberStatus == "EXPIRED_MEMBERS") {
            that.setData({
              isVip: false
            })
          }
        }
      }
    })
  },
  TabSwitching(e) { //一级分类,二级切换
    this.setData({
      firstMenuItems: e.currentTarget.dataset.index
    })
  },
  remind(e) { //明天传送formId
    let dateTime = new Date().getTime()
    // if(dateTime-firstTime>1000){
    firstTime = dateTime

    let formId = e.detail.formId,
      index = e.detail.target.dataset.index,
      item = e.detail.target.dataset.item,
      {
        TOMORROW,
        firstMenuItems,
        blId
      } = this.data
    let Josn = {
      "openId": wx.getStorageSync("openId"),
      formId,
      "stId": TOMORROW.stId,
      "userId": wx.getStorageSync("userId"),
      "notificationStatus": "REQUESTED",
      "notificationItem": item.itemNo,
      "blId": blId,
      "branchNo": app.globalData.branch.branchNo,
      "typeKey": "PRESELL"
    }
    if (e.detail.target.dataset.remind == "Y") {
      request.request("/service-order-prc/notifications/clickNotificationsStatus", Josn, 'POST', false).then(res => {
        let tom = TOMORROW
        tom.firstMenuItems[firstMenuItems].secondMenuItems[0].itemNos[index].remindMe = false
        this.setData({
          commodityIndex: e.detail.target.dataset.index,
          TOMORROW: tom
        })
        wx.showToast({
          title: '设置成功，商品开抢前会在服务通知提醒你！',
          icon: "none"
        })
      })

    } else {
      //TODO
      let Josn = {
        "openId": wx.getStorageSync("openId"),
        formId,
        "stId": TOMORROW.stId,
        "userId": wx.getStorageSync("userId"),
        "notificationStatus": "CANCELLED",
        "notificationItem": item.itemNo,
        "blId": blId,
        "branchNo": app.globalData.branch.branchNo,
        "typeKey": "PRESELL"
      }
      request.request("/service-order-prc/notifications/clickNotificationsStatus", Josn).then(res => {
        let tom = TOMORROW
        tom.firstMenuItems[firstMenuItems].secondMenuItems[0].itemNos[index].remindMe = true
        wx.showToast({
          title: '已取消提醒',
          icon: "none"
        })
        this.setData({
          TOMORROW: tom
        })
      })

    }
  },
  remindToday(e) {
    let formId = e.detail.formId,
      index = e.detail.target.dataset.index,
      item = e.detail.target.dataset.item,
      {
        TODAY,
        firstMenuItems,
        blId
      } = this.data
    if (e.detail.target.dataset.remind == "Y") {
      let Josn = {
        "openId": wx.getStorageSync("openId"),
        formId,
        "stId": TODAY.stId,
        "notificationStatus": "REQUESTED",
        "userId": wx.getStorageSync("userId"),
        "notificationItem": item.itemNo,
        "blId": blId,
        "branchNo": app.globalData.branch.branchNo,
        "typeKey": "PRESELL"
      }
      request.request("/service-order-prc/notifications/clickNotificationsStatus", Josn).then(res => {
        let tom = TODAY
        tom.firstMenuItems[firstMenuItems].secondMenuItems[0].itemNos[index].remindMe = false
        this.setData({
          commodityIndex: e.detail.target.dataset.index,
          TODAY: tom
        })
        wx.showToast({
          title: '设置成功，商品开抢前会在服务通知提醒你！',
          icon: "none"
        })
      })

    } else {
      //TODO
      let Josn = {
        "openId": wx.getStorageSync("openId"),
        formId,
        "stId": TODAY.stId,
        "userId": wx.getStorageSync("userId"),
        "notificationStatus": "CANCELLED",
        "notificationItem": item.itemNo,
        "blId": blId,
        "branchNo": app.globalData.branch.branchNo,
        "typeKey": "PRESELL"
      }
      request.request("/service-order-prc/notifications/clickNotificationsStatus", Josn, 'POST', false).then(res => {
        let tom = TODAY
        tom.firstMenuItems[firstMenuItems].secondMenuItems[0].itemNos[index].remindMe = true
        wx.showToast({
          title: '已取消提醒',
          icon: "none"
        })
        this.setData({
          TODAY: tom
        })
      })

    }
  },
  plus() { //商品数量增加
    let {
      number,
      quantityLimitTotal,
      limitedByUser,
      stockQty
    } = this.data
    if (limitedByUser == null) {   //限购数等于空 没有上限  根据库存判定
      if (number < stockQty) {   //判定库存
        this.setData({
          number: number + 1,
          TotalPrice: (number + 1) * price,
          refundValue: (number + 1) * refund
        })
      } else {
        wx.showToast({
          title: '单品已经达到上限',
          icon: 'none',
          uration: 1500
        })
      }
    } else {
      if (limitedByUser > stockQty) {   //如果预售上限不为空，判定预售上限是否小于库存  T：判定购买数量是否小于预售上线  F:用库存去决定购买上限
        if (number < stockQty) {
          this.setData({
            number: number + 1,
            TotalPrice: (number + 1) * price,
            refundValue: (number + 1) * refund
          })
        } else {
          wx.showToast({
            title: '单品已经达到上限',
            icon: 'none',
            uration: 1500
          })
        }
      } else {
        if (number < limitedByUser) {
          this.setData({
            number: number + 1,
            TotalPrice: (number + 1) * price,
            refundValue: (number + 1) * refund
          })
        } else {
          wx.showToast({
            title: '单品已经达到上限',
            icon: 'none',
            uration: 1500
          })
        }
      }

    }
  },
  reduce() { //商品减少
    let {
      number
    } = this.data
    if (number > 1) {
      this.setData({
        number: number - 1,
        TotalPrice: (number - 1) * price,
        refundValue: (number - 1) * refund
      })
    }
  },
  stopBublle(e) { //阻止冒泡

  },
  toVip(e) { //跳转确认订单
    let isStatus = e.currentTarget.dataset.isstatus
    let that = this, { item, number, TotalPrice, TODAY, blId } = this.data,
      json = []
    json.push(item);
    const originaPrice = item.salePrice * number;
    const totalPrice = item.activitySalePrice == null ? item.salePrice : item.activitySalePrice * number;
    //  item.disPrice == null ? item.salePrice : item.disPrice;
    json[0].quantity = number;//数量
    json[0].bizLine = items;//业务线
    json[0].thumbPic = item.picAddr;//图片
    json[0].commoditStatus=='Presale'
    json[0].blId = blId
    json[0].comb = false;//是否套餐
    json[0].stTimes = [{
      activityTimeFrom: TODAY.dateFrom,
      activityTimeTo: TODAY.dateTo,
      deliveryTimeFrom: TODAY.deliveryTimeFrom == undefined ? null : TODAY.deliveryTimeFrom,
      deliveryTimeTo: TODAY.deliveryTimeTo == undefined ? null : TODAY.deliveryTimeTo,
    }]
    json[0].vipPrice = item.salePrice;//会员价
    app.globalData.order = json;
    wx.navigateTo({
      url: `/pages/confirmOrder/confirmOrder?commoditStatus=Presale&isStatus=${isStatus}&originaPrice=${originaPrice}&totalPrice=${totalPrice}`
    })
  },
  tohome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  toShop(e) {
    let item = e.currentTarget.dataset.item,
      tabindex = e.currentTarget.dataset.tabindex,
      { YESTERDAY, TODAY, TOMORROW, blId } = this.data
    if (tabindex == 1) {
      item.dateFrom = YESTERDAY.dateFrom
      item.dateTo = YESTERDAY.dateTo
      item.isVip = this.data.isVip
      item.date = "YESTERDAY"
      item.stId = YESTERDAY.stId
      item.blId = blId,
        item.bizLine = items.bizLineCode
      wx.navigateTo({
        url: '/pages/goodsDetails/goodsDetails?details=' + JSON.stringify(item)
      })
    } else if (tabindex == 2) {
      item.dateFrom = TODAY.dateFrom
      item.dateTo = TODAY.dateTo
      item.isVip = this.data.isVip
      item.stId = TODAY.stId
      item.date = "TODAY"
      item.blId = blId,
        item.bizLine = items.bizLineCode
      wx.navigateTo({
        url: '/pages/goodsDetails/goodsDetails?details=' + JSON.stringify(item)
      })
    } else {
      item.dateFrom = TOMORROW.dateFrom
      item.dateTo = TOMORROW.dateTo
      item.isVip = this.data.isVip
      item.stId = TOMORROW.stId
      item.date = "TOMORROW"
      item.blId = blId,
        item.bizLine = items.bizLineCode
      wx.navigateTo({
        url: '/pages/goodsDetails/goodsDetails?details=' + JSON.stringify(item)
      })
    }

  },
  Snatch(e) { //马上抢IS会员弹窗
    let item = e.currentTarget.dataset.item
    item.thumbPic = item.picAddr;
    console.log("item", item);
    price = item.activitySalePrice == null ? item.salePrice : item.activitySalePrice,
      saleprice = item.salePrice
    refund = item.refundValue == null ? 0 : item.refundValue,
      this.setData({
        isMember: true,
        TotalPrice: item.activitySalePrice == null ? item.salePrice : item.activitySalePrice,
        refundValue: item.refundValue == null ? 0 : item.refundValue,
        quantityLimitTotal: item.quantityLimitTotal,
        limitedByUser: item.limitedByUser,
        stockQty: item.stockQty,
        item,
        number: 1
      })
  },
  CloseExplain() { //关闭说明弹窗
    this.setData({
      explain: false
    })
  },
  OpenExplain(e) { //打开说明弹窗

    this.setData({
      explain: true,
      eta: e.currentTarget.dataset.item.eta
    })
  },
  close() { //会员弹窗
    this.setData({
      isMember: false,
      TotalPrice: '',
      refundValue: '',
      quantityLimitTotal: ''
    })
  },
  TapDate(e) { //顶部选项卡
    let that = this
    let {
      tabIndex
    } = that.data, index = e.currentTarget.dataset.index
    this.setData({
      tabIndex: index
    })
    if (index != tabIndex) { //多次点击相同tabbar不在请求数据
      this.commodity(index - 1)
      this.setData({
        firstMenuItems: 0
      })
    }
    if (index != 2) { //切换非今天tabbar时关掉定时器
      clearInterval(time)
    } else {
      time = setInterval(() => {
        this.TodayDate(startTime, endTime)
      }, 1000)
    }
    if (index != 3) {
      clearInterval(timers)
    } else {
      timers = setInterval(() => {
        this.TOMORROWFUN(TOMORROWTime)
      }, 1000)
    }
  },
  /**
   * 
   * @param {string} startDate 
   * @param {string} endDate 
   */
  TodayDate(startDate, endDate) {
    if (startDate || endDate) {
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
      if (NewTimeRubbing < _TimeRubbingStart) {
        let arr = this.timeTrans(_TimeRubbingStart - NewTimeRubbing)
        this.setData({
          Today: this.timeTrans(_TimeRubbingStart - NewTimeRubbing),
          title: '未开始',
          isStart: true
        })
        if (arr[0] == 0) {
          if (arr[1] == 0) {
            if (arr[2] == 0) {
              this.setData({
                title: '',
                isStart: false
              })
            }
          }
        }
      } else if (NewTimeRubbing > _TimeRubbingEnd) {
        this.setData({
          title: '活动已结束',
          noDate: true,
          isDateEnd: false
        })
      } else {
        let date = _TimeRubbingEnd - NewTimeRubbing
        let arr = this.timeTrans(date)
        if (arr[0] == 0) {
          if (arr[1] == 0) {
            if (arr[2] == 0) {
              this.setData({
                isDateEnd: false
              })
              clearInterval(time)
            }
          }
        }
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
  /**
   * 
   * @param {string} startDate 
   */
  TOMORROWFUN(startDate) {
    if (typeof startDate != "undefined") {
      let d = new Date()
      d.setTime(d.getTime() + 24 * 60 * 60 * 1000)
      let newDate = d.getFullYear() + "-" + (d.getMonth() * 1 + 1) + "-" + d.getDate() + "-" + startDate.replace(/:/g, "-"),
        startArr = newDate.split("-"),
        _TimeStart = new Date(Date.UTC(startArr[0], startArr[1] - 1, startArr[2], startArr[3] - 8, startArr[4], startArr[5])),
        _TimeRubbingStart = _TimeStart.getTime() / 1000,
        NewTimeRubbing = new Date().getTime() / 1000;
      let date = _TimeRubbingStart - NewTimeRubbing
      if (date < 0) {
        clearInterval(timers)
        this.setData({
          TOMORROWDate: ['00', '00', '00']
        })
      } else {
        this.setData({
          TOMORROWDate: this.timeTrans(date)
        })
      }
    } else {
      clearInterval(timers)
      throw new Error(`The value passed in is not allowed to be undefined:startDate:${startDate}`)
    }
  },

  /**
   * 
   * @param {String} date 
   */
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
  TabDate() {
    const date = new Date()
    let Month = date.getMonth() + 1,
      day = date.getDate(),
      dayArr = [],
      year = date.getFullYear()
    let json = {
      day,
      Month
    }
    dayArr[0] = json
    if (day - 1 == 0) {
      let json = {
        day: new Date(year, Month - 1, 0).getDate(), //获取上月的最后一天
        Month: Month - 1
      }
      dayArr[1] = json
    } else {
      let json = {
        day: day - 1,
        Month: Month
      }
      dayArr[1] = json
    }
    let day3 = new Date();
    day3.setTime(day3.getTime() + 24 * 60 * 60 * 1000);
    dayArr[2] = {
      day: day3.getDate(),
      Month: day3.getMonth() + 1
    }
    this.setData({
      dayArr
    })
  },
  noBulle() {

  },
})