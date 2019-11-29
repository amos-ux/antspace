let app = getApp()
var call = require("../../utils/call.js")
var url = app.baseUrl + "service-member/";
var urL = app.baseUrl + "service-mall/";
var cache = require("../../utils/cache");
let request = require("../../utils/soul_chen")
let timer, itemOptions, price, refund,blId,bizLineCode
Page({
  data: {
    len: '',
    animation: [],
    isMember: false,
    number: 1,
    explain: false,
    isVip: true,
    NumRefundValue: '',
    Price: '', //单价
    TotalPrice: '',
    status:1,
  },
  onLoad(options) {
    console.log("options", options);
    this.RefundValue()
    blId=options.blId
    bizLineCode=options.bizLineCode?options.bizLineCode:'PRESALE'
    this.http()
  },
  http() {
    wx.showNavigationBarLoading()
    wx.showLoading({
      title: '初始化...',
      mask: true
    })
    let data = {
      'branchNo': app.globalData.branch.branchNo,
      'blId': blId,
      'kkStatus': 'Y'
    }
    let Advertisement = {
      'branchNo': app.globalData.branch.branchNo,
      'code': 'business_home_banner1',
      'bizLine': bizLineCode
    }
    let SINGLE = {
      "branchNo": app.globalData.branch.branchNo,
      "blId": blId,
      "templateType": "SINGLE",
      "userId": wx.getStorageSync("userId")
    }
    let ITEMRANK = {
      "branchNo": app.globalData.branch.branchNo,
      "blId": blId,
      "templateType": "ITEMRANK",
      "userId": wx.getStorageSync("userId")
    }
    let ITEMCLS = {
      "branchNo": app.globalData.branch.branchNo,
      "blId": blId,
      "templateType": "ITEMCLS",
      "userId": wx.getStorageSync("userId")
    }
    Promise.all([
      request.request('/service-item/public/template/kingkong/find/list', data, 'GET', false),
      request.request('/service-item/adverBanner/getWaterBarAdver', Advertisement, 'GET', false),
    ]).then(res => {
      this.setData({
        DiamondZone: res[0].respData,
        banner: res[1].respData,
      })
    })
    Promise.all(
      [
        request.request('/service-item/public/get/template/item', ITEMRANK, 'POST', false),
        request.request('/service-item/public/get/template/item', ITEMCLS, 'POST', false),
        request.request('/service-item/public/get/template/item', SINGLE, 'POST', false),
      ]).then(res => {
        let {ITEMRANK}=this.data
        this.setData({
          ITEMRANK: res[0].respData != null ? res[0].respData[0] : [],
          ITEMCLS: res[1].respData,
          SINGLE: res[2].respData.slice(0,3)
        },()=>{
              let {ITEMRANK,status}=this.data
              let startTime=ITEMRANK.items[0].stTimes[0].activityDateFrom+"-"+ITEMRANK.items[0].stTimes[0].activityTimeFrom.replace(/:/g,"-")
              let endTime=ITEMRANK.items[0].stTimes[0].activityDateTo+"-"+ITEMRANK.items[0].stTimes[0].activityTimeTo.replace(/:/g,"-")
              if(ITEMRANK.items[0].stTimes){
                let timer=setInterval(()=>{
                  if(status==1){
                    this.TodayDate(startTime,endTime)
                  }else{
                    clearInterval(timer)
                  }
                },1000)
              }
              
              
        })
      
      wx.hideLoading()
      wx.hideNavigationBarLoading()
    })
  },
  onShow() {
    timer = setInterval(() => {
      this.RefundValue()
    }, 60000)
    let ITEMRANK = {
      "branchNo": app.globalData.branch.branchNo,
      "blId": blId,
      "templateType": "ITEMRANK",
      "userId": wx.getStorageSync("userId")
    }
    Promise.all(
      [
        request.request('/service-item/public/get/template/item', ITEMRANK, 'POST', false),
      ]).then(res => {
        let {ITEMRANK}=this.data
        this.setData({
          ITEMRANK: res[0].respData != null ? res[0].respData[0] : [],
        },()=>{
              let {ITEMRANK,status}=this.data
              let startTime=ITEMRANK.items[0].stTimes[0].activityDateFrom+"-"+ITEMRANK.items[0].stTimes[0].activityTimeFrom.replace(/:/g,"-")
              let endTime=ITEMRANK.items[0].stTimes[0].activityDateTo+"-"+ITEMRANK.items[0].stTimes[0].activityTimeTo.replace(/:/g,"-")
              if(ITEMRANK.items[0].stTimes){
                let timer=setInterval(()=>{
                  if(status==1){
                    this.TodayDate(startTime,endTime)
                  }else{
                    clearInterval(timer)
                  }
                },1000)
              }     
        })
      wx.hideLoading()
      wx.hideNavigationBarLoading()
    })
  },
  onHide() {
    clearInterval(timer)
    this.close()
  },
  onUnload() {
    clearInterval(timer)
  },
  onReady() {
    this.show_num("000000") //默认从6个零开始转
    setTimeout(() => {
      this.show_num(this.data.NumRefundValue)
    }, 1000)
    this.UserInfo()
  },
  RefundValue() {
    Promise.all([
      request.request('/service-member/public/platform/refund', {}, "GET", true, false)
    ]).then(res => {
      this.setData({
        NumRefundValue: this.Other(res[0].respData)
      }, () => {
        this.show_num(this.data.NumRefundValue)
      })
    })
  },
  remindToday(e) {
    let formId = e.detail.formId,
      index = e.detail.target.dataset.index,
      item = e.detail.target.dataset.item,
      {ITEMRANK}=this.data
    if (e.detail.target.dataset.remind == "Y") {
        let Josn = {
            "openId": wx.getStorageSync("openId"),
            formId,
            "stId": ITEMRANK.stId,
            "notificationStatus":"REQUESTED",
            "userId":wx.getStorageSync("userId"),
            "notificationItem": item.itemNo,
            "blId":blId,	
            "branchNo":app.globalData.branch.branchNo,
            "typeKey":"PRESELL"
          }
      request.request("/service-order-prc/notifications/clickNotificationsStatus", Josn,'POST',false).then(res => {
        let tom = ITEMRANK
        tom.items[index].remindMe = false
        this.setData({
          commodityIndex: e.detail.target.dataset.index,
          ITEMRANK: tom
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
        "stId": ITEMRANK.stId,
        "userId":wx.getStorageSync("userId"),
        "notificationStatus":"CANCELLED",
        "notificationItem": item.itemNo,
        "blId": blId,	
        "branchNo":app.globalData.branch.branchNo,
        "typeKey":"PRESELL"
      }
      request.request("/service-order-prc/notifications/clickNotificationsStatus", Josn).then(res => {
        let tom = ITEMRANK
        tom.items[index].remindMe = true
        wx.showToast({
          title: '已取消提醒',
          icon: "none"
        })
        this.setData({
          ITEMRANK: tom
        })
      })

    }
  },
  remind(e) { //发送formId
    let formId = e.detail.formId
    this.setData({
      isMember: true
    })
  },
  UserInfo() { //检查是否会员
    let that = this
    wx.request({
      url: `${url}new/query/usrInfo`,
      method: 'GET',
      header: {
        'Cookie': "JSESSIONID=" + cache.get('sessionId', 'null')
      },
      success: function(rest) {
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
  plus() { //商品数量增加
  
        let {
      number,
      quantityLimitTotal,
      limitedByUser,
      stockQty
    } = this.data
    if(limitedByUser==null){   //限购数等于空 没有上限  根据库存判定
      if(number<stockQty){   //判定库存
        this.setData({
            number: number + 1,
            TotalPrice: (number + 1) * price,
            refundValue: (number + 1) * refund
          })
      }else{
        wx.showToast({
              title: '单品已经达到上限',
              icon: 'none',
              uration: 1500
          })
      }
    }else{
      if(limitedByUser>stockQty){   //如果预售上限不为空，判定预售上限是否小于库存  T：判定购买数量是否小于预售上线  F:用库存去决定购买上限
        if(number<stockQty){
          this.setData({
            number: number + 1,
            TotalPrice: (number + 1) * price,
            refundValue: (number + 1) * refund
          })
        }else{
          wx.showToast({
            title: '单品已经达到上限',
            icon: 'none',
            uration: 1500
          })
        }
      }else{
        if(number<limitedByUser){  
          this.setData({
            number: number + 1,
            TotalPrice: (number + 1) * price,
            refundValue: (number + 1) * refund
          })
        }else{
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
  toVip(e){ //跳转VIP
    let isStatus=e.currentTarget.dataset.isstatus
    let items=item,{item,number,TotalPrice}=this.data,
        json=[]
        json.push(item)
        const originaPrice = item.salePrice * number;
        const totalPrice = item.activitySalePrice == null ? item.salePrice * number:item.activitySalePrice*number;
        // item.disPrice==null?item.salePrice:item.disPrice;
        json[0].quantity=number;
        json[0].bizLine= bizLineCode
        json[0].thumbPic=item.picAddr;
        json[0].commoditStatus=='Presale'
        json[0].blId= blId
        json[0].comb=false;
        json[0].vipPrice = item.salePrice;//会员价
        app.globalData.order = json;
        wx.navigateTo({
          url:`/pages/confirmOrder/confirmOrder?commoditStatus=Presale&isStatus=${isStatus}&originaPrice=${originaPrice}&totalPrice=${totalPrice}`
        })
  },
  toFlashSale(e) {
    let items = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '../FlashSale/FlashSale?blId=' + items.blId + "&bizLine=" + bizLineCode
    })
  },
  toShop(e){
    let item=e.currentTarget.dataset.item
    let {ITEMRANK}=this.data
    item.isVip=this.data.isVip
    item.dateFrom=item.stTimes[0]?item.stTimes[0].activityTimeFrom:null
    item.dateTo=item.stTimes[0]?item.stTimes[0].activityTimeTo:null
    item.stId=item.stId
    item.blId=blId
    item.date=item.stTimes[0]?item.stTimes[0].activityDateFrom.split('-')[2]>new Date().getDate()?"TOMORROW":"TODAY":null
        wx.navigateTo({
            url:'/pages/goodsDetails/goodsDetails?details='+JSON.stringify(item)
        })
  },
  toLink(e){
    let index=e.currentTarget.dataset.index
    let {SINGLE}=this.data
    wx.navigateTo({
      url:SINGLE[index].link
    })
  },
  toSearch:function(){
    wx.navigateTo({
        url: `/pages/shopSearch/shopSearch?blId=${blId}&bizLine=${bizLineCode?bizLineCode:'PRESALE'}`,
    })
  },
  Router(e) {
    let items = e.currentTarget.dataset.item
    const url = items.link.split('?')[0]
    const arr = items.link.split('?')[1].split('&')
    let item = {
      blId: arr[0],
      bizLineName: arr[1]
    }
    wx.navigateTo({
      url: url + '?item=' + JSON.stringify(item)
    })

    // `${e.currentTarget.dataset.item.path}?item=${e.currentTarget.dataset.item.link}`
  },
  CloseExplain() { //关闭说明弹窗
    this.setData({
      explain: false
    })
  },
  OpenExplain(e) { //打开说明弹窗
   this.setData({
      explain: true,
      eta:e.currentTarget.dataset.item.eta
    })
  },
  Snatch(e) {
    //马上抢IS会员弹窗
    let item = e.currentTarget.dataset.item
    item.thumbPic = item.picAddr;
    price = item.activitySalePrice == null ? item.salePrice : item.activitySalePrice
    refund = item.refundValue == null ? 0 : item.refundValue
    this.setData({
      isMember: true,
      stockQty:item.stockQty,
      TotalPrice: item.activitySalePrice == null ? item.salePrice : item.activitySalePrice,
      refundValue: item.refundValue == null ? 0 : item.refundValue,
      quantityLimitTotal: item.quantityLimitTotal,
      limitedByUser:item.limitedByUser,
      number: 1,
      item
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
  stopBublle(e) { //阻止冒泡

  },
  show_num(n) {
    var len = String(n).length;
    this.setData({
      len: len,
    })
    var char = String(n).split("")
    var h = ''
    let self = this
    wx.createSelectorQuery().select('.unit-num').boundingClientRect(function(rect) {
      h = rect.height
      var animate = []
      for (var i = 0; i < len; i++) {
        animate[i] = wx.createAnimation()
        animate[i].top(-parseInt(h) * char[i]).step({
          duration: 1500
        })
        var deletedtodo = 'animation[' + i + ']';
        self.setData({
          [deletedtodo]: animate[i].export()
        })
      }
    }).exec()
  },
  Other(value) { //读懂更简单
    let RefundValue = Math.round(value) + ''
    switch (RefundValue.length) {
      case 1:
        return "00000" + RefundValue
        break
      case 2:
        return "0000" + RefundValue
        break
      case 3:
        return "000" + RefundValue
        break
      case 4:
        return "00" + RefundValue
        break
      case 5:
        return "0" + RefundValue
        break
      default:
        return RefundValue + ''
        break
    }
  },
  TodayDate(startDate, endDate) {
    if (startDate||endDate) {
      let d = new Date(),
        startArr = startDate.split("-"),
        endArr = endDate.split("-"),
        _TimeStart = new Date(Date.UTC(startArr[0], startArr[1] - 1, startArr[2], startArr[3] - 8, startArr[4], startArr[5])),
        _TimeEnd = new Date(Date.UTC(endArr[0], endArr[1] - 1, endArr[2], endArr[3] - 8, endArr[4], endArr[5])),
        _TimeRubbingStart = _TimeStart.getTime() / 1000, //开始时间搓
        _TimeRubbingEnd = _TimeEnd.getTime() / 1000, //结束时间搓 
        NewTimeRubbing = d.getTime() / 1000; //本地时间搓
        if(NewTimeRubbing>_TimeRubbingStart){  //now greater than startTime
            if(NewTimeRubbing<_TimeRubbingEnd){
              this.setData({
                status:1 //活动时间内
              })
            }else{
              this.setData({
                status:2  //活动已结束
              })
            }
        }else{
          this.setData({
            status:3 //活动未开始
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
  SeveralDays(e){
    console.log(e)
  }
})