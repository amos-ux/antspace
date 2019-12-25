const app = getApp()
const call = require("../../utils/call.js");
const utils = require("../../utils/util.js");
const cache = require("../../utils/cache.js");
import axios from '../../utils/axios.js';
import _http from '../../utils/request.js';
let time, soul_branchNo, soul_blId, opentime = 0,coupons = 0
Page({
  data: {
    quit: false,
    advers: [],
    interval: 5000,
    duration: 500,
    deliveryFrom: "**",
    pickupTime: "**",
    branchName: "***",
    range: "**",
    planName: [],
    planNamec: [],
    planNamef: [],
    planNamen: [],
    planNames: [],
    promotionSize: 0,
    clickSwiper: false,
    coupon: false,
    string: [],
    select: false,
    oneList: [],
    twoList: [],
    threeList: [],
    activity: [],
    animation: {},
    hide_good_box: true,
    cartQuantity: 0,
    discounts: true,
    listValue: [],
    show: false,
    showShare: false,
    Today: ['00', '00', '00'],
    nobegin: false,
    finish: false,
    userAuthorization: true,
    defaults: false,
    redEnvelopes: false, //红包弹窗
    oneLogin: false, // 一键登录
    animationData: 'openBtn 1.2s linear infinite',//领红包动效
    buttonUrl: 1,//按钮点击动效
    ticketNum: 0,//可用券数量
    cardremind: false,//是否展示优惠券
    order: {},
    remoteArea: [],
    userInfo: {},
    faraway: false,
    judegPopup: false
  },
  // 获取用户信息
  getUserInfo() {
    _http.get({
      url: `${app.baseUrl}service-member/new/query/usrInfo`,
      header: {
        'Cookie': "JSESSIONID=" + cache.get('sessionId', 'null')
      }
    }).then((res) => {
      console.log(res)
      this.setData({
        userInfo: res.data
      })
      cache.put("memberStatus", res.data.memberStatus)
      cache.put("uniqueCode", res.data.uniqueCode)//屏幕亮度
      cache.put("userName", res.data.userName)
    })
  },
  // 获取弹窗信息
  popUp(e) {
    let order = {}
    axios.getData({
      isToast: true,
      url: `${app.baseUrl}service-member/public/user/pop/windows/${cache.get("userId", this)}`
    }).then(res => {
      let index = res.data.respData.ifEnterMemberDetail
      let str = index.split("");
      for (var i = e; i < str.length; i++) {
        if (str[i] == 1 && i == 0) { //新会员88大礼包
          order.first = true
          break;
        } else if (str[i] == 1 && i == 2) { //第三个位置
          order.three = true
        }
      }
      this.setData({
        order: order
      })
      app.globalData.number = index
      app.globalData.popUp = order
    })
  },
  closeUp(data) {
    axios.getData({
      isToast: true,
      url: `${app.baseUrl}service-member/public/user/pop/windows/${cache.get("userId", "null")}/${data}`
    }).then(res => {
      app.globalData.number = res.data.respData
    })
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
          nobegin: true,
          Today: app.timeTrans(_TimeRubbingStart - NewTimeRubbing)
        })
      } else if (NewTimeRubbing > _TimeRubbingEnd) { //活动一结束
        clearInterval(time)
        this.setData({
          finish: true,
        })
      } else {
        let date = _TimeRubbingEnd - NewTimeRubbing
        this.setData({
          Today: app.timeTrans(date)
        })
      }
    } else {
      clearInterval(time)
      throw new Error(`The value passed in is not allowed to be undefined:startDate:${startDate},endDate:${endDate}`)
    }
  },
  //判断是否显示分享按钮
  //获取分享
  shares() {
    let data = []
    call.getData("/service-mall/appletshare/queryShare?branchNo=" + (this.data.branchNo ? this.data.branchNo : app.globalData.branch.branchNo), data, (res) => {
      if (res.respData.length !== 0) {
        this.setData({
          showShare: false
        })
      } else {
        this.setData({
          showShare: true
        })
      }
    }, (res) => { })
  },
  //获取好友榜单
  list() {
    let data = []
    call.getData("/service-mall/appletshare/seniorityShare?sessionId=" + cache.get("sessionId", "null"), data, (res) => {
      if (res.respData !== null) {
        let respData = res.respData.seniorityShareDTOS
        let listIs = res.respData.isshow
        if (listIs == "N") {
          this.setData({
            listValue: respData,
            show: true
          })
        }
      } else { }
    }, (res) => { })
  },

  //检测是否具有优惠券
  judge() {
    let data = []
    call.getData("/service-mall/user/coupon/index/check/" + cache.get("userId", null), data, (res) => {
      this.setData({
        discounts: res.respData
      })
    })
  },
  //跳转分享
  share() {
    wx.navigateTo({
      url: '../share/share',
    })
  },
  // 首页跳转搜索
  skipSearch() {
    wx.navigateTo({
      url: '/pages/shopSearch/shopSearch?bizLine=isIndex',
      success() {
        app.globalData.search = true
      }
    })
  },
  //跳转购物车
  cartDetail() {
    wx.switchTab({
      url: '../shoppingTrolly/shoppingTrolly',
    })
  },
  //跳转领劵中心页
  rollSkip() {
    const { userAuthorization } = this.data
    if (userAuthorization) {
      wx.navigateTo({
        url: '../ticketCenter/ticketCenter',
      })
    } else {
      this.toLogin()
    }
  },
  //获取子组件值
  toggleToast(e) {
    this.setData({
      cartQuantity: e.detail
    })
  },
  //轮播跳转
  skipImage(e) {
    if (this.data.userAuthorization) {
      let items = e.currentTarget.dataset.item
      let link = items.link
      console.log(link)
      if (items.link.indexOf("?") != -1) {
        const url = items.link.split('?')[0]
        const arr = items.link.split('?')[1].split('&')
        let item = {
          blId: arr[0],
          bizLineName: arr[1],
          bizLineCode: arr[2] ? arr[2] : undefined
        }
        if (url.indexOf('openVip') != -1) {//返现介绍 会员权益
          wx.navigateTo({
            url: link
          })
        } else {
          wx.navigateTo({
            url: url + '?item=' + JSON.stringify(item)
          })
        }
      } else if (link == "/pages/houseMart/houseMart") {
        this.setData({
          branchNo: "888888",
          branchName: "我家商城"
        })
        app.globalData.branch.branchNo = "888888"
        app.globalData.branch.branchName = "我家商城"
        this.goodsList() //获取商品
        this.query() //获取店铺优惠
        this.advertising() //店铺广告
        this.activity()
        this.judge()//检测是否具有优惠券
        this.list() //邀请好友榜单
        this.quantity() //购物车数量
        this.serverLine() //获取业务线
        this.shares() //判断是否显示分享按钮
      } else {
        wx.navigateTo({
          url: link,
        })
      }
    } else {
      this.toLogin()
    }

  },
  //广告
  advertising() {
    this.setData({
      advers: []
    })
    let data = []
    call.getData("/service-item/adverBanner/getWaterBarAdver?branchNo=" + (this.data.branchNo ? this.data.branchNo : app.globalData.branch.branchNo) + "&code=main_home_banner1", data, (res) => {
      this.setData({
        advers: res.respData.advers
      })
      // }
    }, (res) => { })
  },
  activity() {
    let data = []
    call.getData("/service-item/public/branch/activity/" + (this.data.branchNo ? this.data.branchNo : app.globalData.branch.branchNo), data, (res) => {
      let message = res.respData
      console.log(message)
      console.log(res)
      message.map(i => {
        if (i.code == "SECKILL") {
          if (i.activityTimeFrom !== null) {
            time = setInterval(() => {
              this.TodayDate(i.activityTimeFrom, i.activityTimeTo)
            }, 1000)
          }
        }
      })
      this.setData({
        activity: res.respData
      })
    }, (rest) => { }, (res) => { })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    soul_branchNo = options.branchNo ? options.branchNo : '';
    soul_blId = options.blId ? options.blId : ''
    setTimeout(() => {
      this.setData({
        defaults: true
      })
    }, 1000)
    wx.getScreenBrightness({
      success(res) {
        cache.put("luminance", res.value)
      }
    })
    this.remoteArea()  //偏远地区不配送
  },
  closeImg() {
    app.globalData.getApp = true
    app.globalData.getBackHide = true
    this.setData({
      select: false
    })
  },
  buttonConfirm() {
    app.globalData.faraway = true
    this.setData({
      faraway: false
    })
  },
  remoteArea() {
    axios.getData({
      isToast: true,
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
  //是否是偏远地区
  faraway() {
    console.log(cache.get("data", null))
    let data = cache.get("data", null)
    axios.getData({
      isToast: true,
      method: "POST",
      data: data,
      url: `${app.baseUrl}service-mall/address/query/pickAddress`
      // url: `http://10.0.1.75:5700/address/query/notdist`
    }).then(res => {
      if (res.data.respData == 0) {
        this.setData({
          faraway: false
        })
      } else if (res.data.respData == 1) {
        this.setData({
          faraway: true
        })
      }
      console.log(res)
    })
  },
  //商品
  goodsList() {
    this.setData({
      oneList: [],
      twoList: [],
      threeList: [],
    })
    let data = []
    call.getData("/service-item/public/branch/item/push/" + (this.data.branchNo ? this.data.branchNo : app.globalData.branch.branchNo), data, (res) => {
      let twoList = []
      let oneList = []
      let threeList = []
      res.respData.map(i => {
        if (i.showType == "ONE") {
          oneList.push(i)
          this.setData({
            oneList: oneList,
          })
        } else if (i.showType == "TWO") {
          twoList.push(i)
          this.setData({
            twoList: twoList,
          })
        } else if (i.showType == "THREE") {
          threeList.push(i)
          this.setData({
            threeList
          })
        }
      })
    })
  },
  // 获取对应商品数据 外卖 我家便利店
  BusinessLine(e) {
    let item = e.currentTarget.dataset.item
    let messages = cache.get("message", "null")
    if (item.bizLineCode == "PRESALE") {
      wx.navigateTo({
        url: "/soul_cards/AdvanceSale/AdvanceSale?blId=" + item.blId + "&bizLineCode=" + item.bizLineCode
      })
    } else if (item.bizLineCode == "MY_HOME_SHOP" && this.data.branchNo != "888888") {
      this.setData({
        branchNo: "888888",
        branchName: "我家商城"
      })
      app.globalData.branch.branchNo = "888888"
      app.globalData.branch.branchName = "我家商城"
      console.log(messages.branchNo)
      this.goodsList() //获取商品
      this.query() //获取店铺优惠
      this.advertising() //店铺广告
      this.activity()
      this.judge()//检测是否具有优惠券
      this.list() //邀请好友榜单
      this.quantity() //购物车数量
      this.serverLine() //获取业务线
      this.shares() //判断是否显示分享按钮

    } else if (item.bizLineCode == "MY_HOME" && this.data.branchNo == "888888") {
      console.log(messages)
      if (messages != "null") {
        this.setData({
          branchNo: messages.branchNo,
          branchName: messages.branchName,
          deliveryFrom: messages.branchOrderServiceDTO.deliveryFrom,
          pickupFrom: messages.branchOrderServiceDTO.pickupFrom,
          range: messages.range
        })
        app.globalData.branch = messages
        this.goodsList() //获取商品
        this.query() //获取店铺优惠
        this.advertising() //店铺广告
        this.activity()
        this.judge()//检测是否具有优惠券
        this.list() //邀请好友榜单
        this.quantity() //购物车数量
        this.serverLine() //获取业务线
        this.shares() //判断是否显示分享按钮 
      } else {
        wx.navigateTo({
          url: '/pages/selectorder/selectorder',
        })
      }

    } else if (this.data.branchNo == "888888") {
      app.globalData.branch.branchNo = "888888"
      app.globalData.branch.branchName = "我家商城"
      wx.navigateTo({
        url: "/soul_cards/cardFood/cardFood?item=" + JSON.stringify(item)
      })
    } else {
      wx.navigateTo({
        url: "/soul_cards/cardFood/cardFood?item=" + JSON.stringify(item)
      })
    }
  },
  //选择店铺
  branchs() {
    if (this.data.userAuthorization) {
      app.globalData.getBackHide = true
      this.setData({
        select: false
      })
      wx.navigateTo({
        url: '/pages/selectorder/selectorder',
      })
    } else {
      this.toLogin()
    }
  },
  toLogin() { //跳转登入
    wx.navigateTo({
      url: '/pages/register/register',
    })
  },
  //选择店铺
  branch() {
    if (this.data.userAuthorization) {
      wx.navigateTo({
        url: '../selectorder/selectorder',
      })
    } else {
      this.toLogin()
    }
  },
  //选择最近店铺
  clickSelect(e) {
    app.globalData.branch = e.currentTarget.dataset.item
    app.globalData.getBackHide = true
    this.setData({
      select: false,
      branchNo: e.currentTarget.dataset.item.branchNo,
      branchName: e.currentTarget.dataset.item.branchName,
      range: e.currentTarget.dataset.item.range,
      deliveryFrom: e.currentTarget.dataset.item.branchOrderServiceDTO.deliveryFrom,
      pickupFrom: e.currentTarget.dataset.item.branchOrderServiceDTO.pickupFrom,
    }, () => {
      setTimeout(() => {
        this.goodsList() //获取商品
        this.query() //获取店铺优惠
        this.advertising() //店铺广告
        this.activity()
        this.judge()
        this.list() //邀请好友榜单
        this.quantity() //购物车数量
        this.serverLine() //获取业务线
        this.shares() //判断是否显示分享按钮
      }, 200)
    })
  },
  query() {
    //店铺优惠
    let data = []
    call.getData("/service-mall/public/query/promotions/by/branchNo/" + app.globalData.branch.branchNo, data, (res) => {
      let that = this;
      if (res.respData !== null) {
        let planName = []
        let planNamec = []
        let planNamef = []
        let planNamen = []
        let planNames = []
        for (let i in res.respData.promotionData) {
          if (res.respData.promotionData[i].pmType == "COUPON") { //优惠劵
            planNamec.push(res.respData.promotionData[i].planName)
          } else if (res.respData.promotionData[i].pmType == "FULL_REDUCTION") {
            planNamef.push(res.respData.promotionData[i].planName)
          } else if (res.respData.promotionData[i].pmType == "N_PIECE_N_ELEMENT") {
            planNamen.push(res.respData.promotionData[i].planName)
          } else if (res.respData.promotionData[i].pmType == "DISC") {
            planName.push(res.respData.promotionData[i].planName)
          } else if (res.respData.promotionData[i].pmType == "SPEC") {
            planNames.push(res.respData.promotionData[i].planName)
          }
        }
        // 数组去重
        planNamec = app.unique(planNamec)
        planNamef = app.unique(planNamef)
        planNamen = app.unique(planNamen)
        planName = app.unique(planName)
        planNames = app.unique(planNames)
        that.setData({
          planName,
          planNamec,
          planNamef,
          planNamen,
          planNames,
          coupon: false,
          promotionSize: res.respData.promotionSize
        })
      } else {
        that.setData({
          coupon: true
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    utils.wxLogin((res) => {
      let data = []
      call.postData("/service-member/weChat/login/" + res, data, (rest) => {
        cache.put("userId", rest.data)
        cache.put("sessionId", rest.sessionID)
        if (soul_branchNo) {
          app.globalData.branch.branchNo = soul_branchNo
          wx.reLaunch({
            url: '/soul_cards/FlashSale/FlashSale?blId=' + soul_blId
          })
        }
      })
    })
  },
  //购物车数量
  quantity() {
    let data = {}
    call.getData("/service-item/trolley/queryTrolleyCount?branchNo=" + app.globalData.branch.branchNo + "&sessionId=" + cache.get("sessionId", this), data, (res) => {
      this.setData({
        cartQuantity: res.respData
      })
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this
    if (app.globalData.quit) {
      that.setData({
        quit: false
      })
    }
    wx.getSetting({
      success(res) {
        if (res.authSetting["scope.userInfo"]) { //true  代表已经获取信息
          that.oneClickLogin()
          that.setData({
            userAuthorization: true,
            oneLogin: false
          })
        } else {
          that.setData({
            userAuthorization: false,
            oneLogin: true
          })
        }
        that.setData({
          branchNo: app.globalData.branch.branchNo,
          branchName: app.globalData.branch.branchName,
          range: app.globalData.branch.range,
          deliveryFrom: app.globalData.branch.branchOrderServiceDTO.deliveryFrom, //配送
          pickupFrom: app.globalData.branch.branchOrderServiceDTO.pickupFrom, //自提
        })
        if (app.globalData.id) {
          if (app.globalData.branch.range > 1000 && !app.globalData.mall && that.data.branchNo != "888888") {
            wx.showModal({
              confirmColor: "#FFA333",
              cancelText: "重新选择",
              confirmText: "进店购买",
              content: '当前店铺距您超过1公里 确认是您需要服务的门店',
              success(res) {
                if (res.confirm) {
                  that.popUp(0) //弹窗数据
                } else if (res.cancel) {
                  wx.navigateTo({
                    url: '../selectorder/selectorder',
                  })
                }
              }
            })
          }
          that.goodsList() //获取商品
          that.query() //获取店铺优惠
          that.advertising() //店铺广告
          app.globalData.id = false
          app.globalData.mall = false
          that.faraway() // 判断是否是偏远地区
          if (!app.globalData.getBackHide) {
            that.branchSelect() //选择店铺
          }
          if (that.data.branchNo != "888888") {
            cache.put("message", app.globalData.branch)
          }
        }
        that.activity()
        if (!app.globalData.getBackHide && that.data.userAuthorization) {
          that.popUp(0)
        }
        if (that.data.userAuthorization) {

          that.judge()
          that.list() //邀请好友榜单
          that.quantity() //购物车数量
          that.getUserInfo()
        }
        //存储店铺号
        if (app.globalData.branch.branchNo !== "888888") {
          app.globalData.branchNo = app.globalData.branch.branchNo
        }
        that.serverLine() //获取业务线
        that.shares() //判断是否显示分享按钮
      }
    })
  },

  //弹窗
  click() {
    this.setData({
      clickSwiper: true,
    })
  },
  //关闭弹窗
  close() {
    this.setData({
      clickSwiper: false,
    })
  },
  // 打开弹窗
  openSwiper() {
    this.setData({
      clickSwiper: true,
    })
    return false;
  },
  // 一键登录
  oneClickLogin: function () {
    let that = this
    axios.getData({
      isToast: true,
      url: `${app.baseUrl}service-mall/user/my/coupons/${cache.get("userId", null)}`
    }).then(res => {
      const ticketNum = res.data.respData.length <= 99 ? res.data.respData.length : '99+'
      const cardremind = app.globalData.cardremind
      that.setData({ ticketNum, cardremind })
    })
  },
  toCash(e) {
    //此处如需修改请在群里说下  注意事项在修改
    wx.getSetting({
      success(res) {
        if (res.authSetting["scope.userInfo"]) {
          cache.put("blId", e.currentTarget.dataset.item.blId)
          let link = e.currentTarget.dataset.item.blLink
          let soul_choo = link.split('/')[2]
          let code = e.currentTarget.dataset.item.code
          let item = {
            blId: e.currentTarget.dataset.item.blId
          }
          item = JSON.stringify(item)
          if (code == "SECKILL") {
            wx.navigateTo({
              url: `${link}?blId=${e.currentTarget.dataset.item.blId}&branchNo=${app.globalData.branch.branchNo}`
            })
          } else if (soul_choo == "Choose") {
            const arr = link.split('?')[1].split('&')
            let ChooseItem = {
              blId: arr[0],
              bizLineName: arr[1],
              bizLineCode: arr[2] ? arr[2] : undefined
            }
            wx.navigateTo({
              url: '/soul_cards/Choose/Choose?item=' + JSON.stringify(ChooseItem)
            })
          } else { //非秒杀
            wx.navigateTo({
              url: `${link}?blId=${e.currentTarget.dataset.item.blId}&item=${item}`
            })
          }
        } else {
          this.toLogin()
        }
      }
    })
  },
  //判断店铺
  branchSelect() {
    let that = this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        let data = {
          latitude: res.latitude,
          longitude: res.longitude
        }
        call.postData("/service-item/user/get/branch/verifyBranchDistance", data, (res) => {
          if (res.respData.distanceType == "CHOICE") {
            that.setData({
              select: true,
              selectBranch: res.respData.branchList
            })
          }
          if (that.data.userAuthorization) {
            that.popUp(0)
          }
        })
      },
    })
    // app.globalData.id = false
  },
  //获取业务线
  serverLine() {
    let data = []
    call.getData("/service-item/public/branch/index/bizline/" + (this.data.branchNo ? this.data.branchNo : app.globalData.branch.branchNo), data, (res) => {
      if (res.respCode == "0000") {
        let respData = res.respData
        let item
        respData.map(i => {
          if (i.bizLineCode == "MY_HOME_SHOP" && app.globalData.branch.branchNo == "888888") {
            item = {
              blId: i.blId,
              bizLineName: i.bizLineName,
              bizLineCode: i.bizLineCode
            }
          } else if (i.bizLineCode == "CVS") {
            item = {
              blId: i.blId,
              bizLineName: i.bizLineName,
              bizLineCode: i.bizLineCode
            }
          }
        })
        cache.put("item", item)
        this.setData({
          string: res.respData
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(time)
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(time)
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    let shareObj = {
      title: "我家小程序",
      path: '/pages/connectWifi/connectWifi', // 默认是当前页面，必须是以‘/’开头的完整路径
      imgUrl: '', //转发时显示的图片路径，支持网络和本地，不传则使用当前页默认截图。
      success: function () { },
    };
    return shareObj;
  },
  // 阻止事件向下传递
  preventTouchMove() { },

  event(e) { //第一个弹窗
    let number = app.globalData.number.split("")
    number[0] = "0"
    let str = number.join("")
    this.closeUp(str)
    let first = "order.first"
    this.setData({
      [first]: false
    })
  },

  closeEvent(e) { //第一个弹窗
    app.globalData.globalData = true
    let number = app.globalData.number.split("")
    number[0] = "0"
    let str = number.join("")
    this.closeUp(str)
    this.popUp(1) //开启第三个弹窗
    let first = "order.first"
    this.setData({
      [first]: false
    })
  },
  //弹窗
  closeGiftSkip() { //第三个弹窗
    // if(this.data.userAuthorization){
    // let number = app.globalData.number.split("")
    // number[2] = "0"
    // console.log(number[2])
    // let str = number.join("")
    // this.closeUp(str)
    // }
    app.globalData.getBackHide = true
    let three = "order.three"
    this.setData({
      [three]: false,
      judegPopup: true
    })
  },
  giftSkip() { //第三个弹窗
    // let number = app.globalData.number.split("")
    // number[2] = "0"
    // let str = number.join("")
    // this.closeUp(str)
    if (this.properties.userAuthorization) {
      wx.navigateTo({
        url: '/my_member/inviteFriends/inviteFriends',
      })
      let number = app.globalData.number.split("")
      number[2] = "0"
      let str = number.join("")
      this.closeUp(str)
      let three = "order.three"
      this.setData({
        [three]: false,
        judegPopup: true
      })
    } else {
      wx.navigateTo({
        url: '/pages/register/register',
      })
      app.globalData.skip = true //控制登录注册跳转
    }
    },
  // 一键登录取消按钮
  delOneClick: function () {
    let that = this
    that.setData({
      oneLogin: false
    })
  },
  // 一键登录 节流
  fastLoginDebounce: app.debounce1(function () {
    this.fastLogin()
  }, 600),
  // 一键登录按钮
  fastLogin: function () {
    let that = this
    that.setData({
      buttonUrl: 2
    })
    setTimeout(function () {
      that.setData({
        buttonUrl: 1
      })
      that.toLogin()
    }, 300)
  },
  // 删除卡券提醒
  cardDel: function () {
    let that = this
    app.globalData.cardremind = !that.data.cardremind
    that.setData({
      cardremind: !that.data.cardremind
    })
  },
  // 滚动事件
  onPageScroll: function (e) {
    if (e.scrollTop >= 80) {
      app.globalData.cardremind = false
      this.setData({
        cardremind: false
      })
    }
  },
  toSelect: function () {
    this.setData({
      select: true
    })
  }
})