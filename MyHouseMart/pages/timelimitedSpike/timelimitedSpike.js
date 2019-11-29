import axios from '../../utils/axios.js';
const app = getApp();
const cache = require("../../utils/cache.js");
const urlItem = app.baseUrl + "service-item/";
const util = require("../../utils/util.js")
let presaleTime = 0,num = 0;
Page({
  data: {
    scrollTop: '', //滑
    navFixed: false, //导航是否固定
    timeText: [], //秒杀时间段
    timeStatus: 1, //商品状态 默认1 已开始
    shopList: [],
    dataTime: {},
    Today: ['00', '00', '00'], //当前时间
    clickIndex: 0, //当前index
    blId: 0, //业务线Id
    cartQuantity: 0,
    intoView: 'view0', //默认滚动位置
    hide_good_box: true,
    confine:false,
    backgroundUrl:'',//背景图片链接
    noShop:false
  },
  attached() {
    let that = this
    that.busPos = {};
    that.busPos['x'] = 20;
    that.busPos['y'] = app.globalData.hh - 50;
  },
  onLoad: function (options) {
    // console.log(options)
    let that = this;
    const { blId, branchNo } = options
    if (blId == undefined || branchNo == undefined) {
      that.setData({noShop: true})
      return false;
    }
    that.getRpxNum()//获取rpx值
    that.attached()
    that.getBackgroundImg(branchNo)//获取背景图
    that.setData({blId,branchNo})
    wx.showLoading({
      title: '加载中...',
      success: that.getNewMessage()
    })
  },
  onShow: function () {
    let that = this
    that.quantity()
    if(num>0){
      that.getShowMessage();
    }
    num++;
  },
  onUnload: function () {
    clearInterval(presaleTime); //清除定时器
    num=0;
  },
  // 监听滑动
  layoutScroll: function (e) {
    let that = this
    that.data.scrollTop = that.data.scrollTop * 1 + e.detail.deltaY * 1;
    const navtopHeight = 220;
    that.setData({navFixed: that.data.scrollTop <= -navtopHeight ? true : false})
  },
  cartDetail() {
    wx.navigateTo({
      url: '../commonCart/commonCart',
    })
  },
  //购物车数量
  quantity() {
    let that = this
    axios.getData({
      isToast:true,
      url:`${urlItem}trolley/queryTrolleyCount?branchNo=${that.data.branchNo}&sessionId=${cache.get("sessionId", this)}`
    }).then(res=>{
      that.setData({cartQuantity: res.data.respData})
    })
  },
  // 马上抢
  saleBtn: function (e) {
    let that = this
    let commodity = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index
    commodity[index].blId = that.data.blId
    if (commodity[index].stockQty <= 0) {
      that.showToast('已经售完了哦')
    } else {
      if (commodity[index].quantity >= commodity[index].stockQty){
        commodity[index].confine = true
        that.setData({shopList: commodity})
        that.showToast('已达购买上限')
      }else{
        if (commodity[index].limitedByUser == null) { //无限购买
          axios.postData({
            url:`${urlItem}trolley/addItemToTrolley`,
            data: {
              "sessionId": cache.get("sessionId", null),
              "itemNo": commodity[index].itemNo,
              "quantity": "1",
              "branchNo": that.data.branchNo,
              "blId": commodity[index].blId,
              "activitySalePrice": commodity[index].activitySalePrice,
              "limitedByUser": commodity[index].limitedByUser,
              "stId": commodity[index].stTimes[0].stId,
              "isCombined": commodity[index].isCombined,
              "combSubItems": commodity[index].combSubItems
            }
          }).then(()=>{
            that.showToast('加入成功')
            commodity[index].quantity += 1
            that.setData({
              shopList: commodity,
              cartQuantity: that.data.cartQuantity + 1
            })
            // 如果good_box正在运动
            if (!that.data.hide_good_box) return;
            that.finger = {};
            let topPoint = {};
            that.finger['x'] = e.touches["0"].clientX;
            that.finger['y'] = e.touches["0"].clientY;
            if (that.finger['y'] < that.busPos['y']) {
              topPoint['y'] = that.finger['y'] - 150;
            } else {
              topPoint['y'] = that.busPos['y'] - 150;
            }
            topPoint['x'] = Math.abs(that.finger['x'] - that.busPos['x']) / 2;
            if (that.finger['x'] > that.busPos['x']) {
              topPoint['x'] = (that.finger['x'] - that.busPos['x']) / 2 + that.busPos['x'];
            } else {
              topPoint['x'] = (that.busPos['x'] - that.finger['x']) / 2 + that.finger['x'];
            }
            that.linePos = app.bezier([that.finger, topPoint, that.busPos], 20);
            that.startAnimation();
          },rest=>{
            const desc = rest.data.respDesc ? rest.data.respDesc : '加入购物车失败'
            that.showToast(desc)
          })
        } else {
          if (commodity[index].quantity >= commodity[index].limitedByUser) {
            commodity[index].confine = true
            that.setData({shopList: commodity})
            that.showToast('已达购买上限')
          } else {
            if (commodity[index].quantity >= commodity[index].vQuantityTotal) {
              commodity[index].confine = true
              that.setData({shopList: commodity})
              that.showToast('已达限售数')
            } else {
              axios.postData({
                url:`${urlItem}trolley/addItemToTrolley`,
                data: {
                  "sessionId": cache.get("sessionId", null),
                  "itemNo": commodity[index].itemNo,
                  "quantity": "1",
                  "branchNo": that.data.branchNo,
                  "blId": commodity[index].blId,
                  "activitySalePrice": commodity[index].activitySalePrice,
                  "limitedByUser": commodity[index].limitedByUser,
                  "stId": commodity[index].stTimes[0].stId,
                  "isCombined": commodity[index].isCombined,
                  "combSubItems": commodity[index].combSubItems
                }
              }).then(()=>{
                that.showToast('加入成功')
                commodity[index].quantity += 1
                that.setData({
                  shopList: commodity,
                  cartQuantity: that.data.cartQuantity + 1
                })
                // 如果good_box正在运动
                if (!that.data.hide_good_box) return;
                that.finger = {};
                let topPoint = {};
                that.finger['x'] = e.touches["0"].clientX;
                that.finger['y'] = e.touches["0"].clientY;
                if (that.finger['y'] < that.busPos['y']) {
                  topPoint['y'] = that.finger['y'] - 150;
                } else {
                  topPoint['y'] = that.busPos['y'] - 150;
                }
                topPoint['x'] = Math.abs(that.finger['x'] - that.busPos['x']) / 2;
                if (that.finger['x'] > that.busPos['x']) {
                  topPoint['x'] = (that.finger['x'] - that.busPos['x']) / 2 + that.busPos['x'];
                } else {
                  topPoint['x'] = (that.busPos['x'] - that.finger['x']) / 2 + that.finger['x'];
                }
                that.linePos = app.bezier([that.finger, topPoint, that.busPos], 20);
                that.startAnimation();
              },rest=>{
                const desc = rest.data.respDesc?rest.data.respDesc:'加入购物车失败'
                that.showToast(desc)
              })
            }
          }
        }
      }
    }
  },
  // 加入购物车动画
  startAnimation: function () {
    let index = 0,
      that = this,
      bezier_points = that.linePos['bezier_points'],
      len = bezier_points.length - 1;
    that.setData({
      hide_good_box: false,
      bus_x: that.finger['x'],
      bus_y: that.finger['y']
    })
    that.timer = setInterval(function () {
      index++;
      that.setData({
        bus_x: bezier_points[index]['x'],
        bus_y: bezier_points[index]['y']
      })
      if (index >= len) {
        clearInterval(that.timer);
        that.setData({
          hide_good_box: true,
        })
      }
    }, 25);
  },
  /**
   * 比较当前时间
   * @param {*} beginTime 开始时间
   * @param {*} endTime 结束时间
   * @param {*} nowTime 当前时间
   * @return  0 已结束 1 已开始 2 即将开始
   */
  compareTime(beginTime, endTime, nowTime) {
    let strb = beginTime.split(":");
    let stre = endTime.split(":");
    let strn = nowTime.split(":");
    let b = new Date();
    let e = new Date();
    let n = new Date();
    b.setHours(strb[0]);
    b.setMinutes(strb[1]);
    b.setSeconds(strb[2]);
    e.setHours(stre[0]);
    e.setMinutes(stre[1]);
    e.setSeconds(stre[2]);
    n.setHours(strn[0]);
    n.setMinutes(strn[1]);
    n.setSeconds(strn[2]);
    if (n.getTime() - b.getTime() >= 0 && n.getTime() - e.getTime() <= 0) { //已经开始
      return 1;
    } else if (n.getTime() < b.getTime()) { //即将开始
      return 2;
    } else { //已经结束
      return 0;
    }
  },
  // 获取对应时间段详情 
  showResult: app.debounce1(function (e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    if (index == that.data.clickIndex && that.data.timeStatus!=0) {//点击同一个不请求
      return false;
    }
    wx.showLoading({title: '加载中'})
    const newDate = util.getNowDate(new Date());//当前日期
    const nowTime = util.getNowTime(new Date()); //当前时间
    const timeStatus = e.currentTarget.dataset.item.timeStatus; //商品状态
    let message = e.currentTarget.dataset.item;
    clearInterval(presaleTime); //清除定时器
    axios.post({
      url: `${urlItem}public/sec/kill/items`,
      data: {
        "branchNo": that.data.branchNo,
        "blId": that.data.blId, // 业务线ID
        "dateFrom": newDate, // 开始日期
        "dateTo": newDate, // 结束日期
        "timeFrom": message.timeFrom, // 开始时间
        "timeTo": message.timeTo, // 结束时间
        "userId": wx.getStorageSync("userId"),
        "stId": message.stId
      }
    }).then(res => {
      let data = res.data.respData
      if (data) {
        data.map(i => i.quantity = 0)
      }
      if (timeStatus == 2) { //即将开始
        presaleTime = setInterval(() => {
          that.TodayDate(nowTime, message.timeFrom)
        }, 1000)
      } else if (timeStatus == 1) { //已开始
        presaleTime = setInterval(() => {
          that.TodayDate(message.timeFrom, message.timeTo)
        }, 1000)
      }
      that.setData({
        timeStatus, //当前状态
        dataTime: message,
        shopList: res.data.respData,
        clickIndex: e.currentTarget.dataset.index
      })
      wx.hideLoading();
    })
  },500),
  // 即将开始 提醒我
  formSubmitDebounce: app.debounce1(function (e) {
    let that = this;
    let remindMe = e.currentTarget.dataset.item.remindMe;
    let shopList = that.data.shopList;
    const itemNo = e.currentTarget.dataset.item.itemNo;
    const formId = e.detail.formId;
    const stId = e.currentTarget.dataset.item.stTimes[0].stId;
    axios.post({
      url: `${app.baseUrl}service-order-prc/notifications/clickNotificationsStatus`,
      data: {
        "formId": formId,
        "openId": wx.getStorageSync("openId"),
        "stId": stId,
        "blId": that.data.blId, // 业务线ID
        "notificationStatus": remindMe?"REQUESTED":"CANCELLED", //通知状态， 提交：REQUESTED  / 取消：CANCELLED
        "notificationItem": itemNo,
        "typeKey":"SECKILL",
        "userId": wx.getStorageSync("userId"),
        "branchNo": that.data.branchNo
      }
    }).then(res => {
      for (let i in shopList) {
        if (shopList[i].itemNo == itemNo) {
          shopList[i].remindMe = !remindMe;
        }
      }
      const title = remindMe?'设置成功，商品开抢前会在服务通知提醒你！':'已取消提醒'
      that.showToast(title)
      that.setData({shopList})
    })
  }, 1000),
  // 阻止事件冒泡
  stopBubbling: function () {
    return false;
  },
  // 直达详情页
  toDetails(e) {
    let that = this,detail = e.currentTarget.dataset.item,dataTime = that.data.dataTime,details = [{dateForm: dataTime.timeFrom,dateStatus: dataTime.timeStatus,dateTo: dataTime.timeTo,stId: dataTime.stId,...detail}]
    wx.navigateTo({
      url: `../seckillDetail/seckillDetail?blId=${that.data.blId}&branchNo=${that.data.branchNo}`
    })
    app.globalData.seckillDetail = details
  },
  // 倒计时函数
  TodayDate: function (startDate, endDate) {
    let that = this
    if (startDate || endDate) {
      let d = new Date(),
        newDate = d.getFullYear() + "-" + (d.getMonth() * 1 + 1) + "-" + d.getDate() + "-" + startDate.replace(/:/g, "-"),
        endDates = d.getFullYear() + "-" + (d.getMonth() * 1 + 1) + "-" + d.getDate() + "-" + endDate.replace(/:/g, "-"),
        startArr = newDate.split("-"),
        endArr = endDates.split("-"),
        _TimeStart = new Date(Date.UTC(startArr[0], startArr[1] - 1, startArr[2], startArr[3] - 8, startArr[4], startArr[5])),
        _TimeEnd = new Date(Date.UTC(endArr[0], endArr[1] - 1, endArr[2], endArr[3] - 8, endArr[4], endArr[5])),
        _TimeRubbingStart = _TimeStart.getTime() / 1000, //开始时间戳
        _TimeRubbingEnd = _TimeEnd.getTime() / 1000, //结束时间戳 
        NewTimeRubbing = d.getTime() / 1000; //本地时间戳
      if (NewTimeRubbing < _TimeRubbingStart) { //活动还没开始
        that.setData({Today: app.timeTrans(_TimeRubbingStart - NewTimeRubbing)})
      } else if (NewTimeRubbing > _TimeRubbingEnd) { //活动已经结束
        if (that.data.clickIndex != that.data.timeText.length - 1 || (that.data.clickIndex == that.data.timeText.length - 1 && that.data.timeStatus == 2)) {//不是最后一个时间段 或 最后一个时间段是即将开始
          clearInterval(presaleTime); //清除定时器
          wx.showLoading({
            title: '加载中...',
            success:that.getNewMessage()// 重新获取数据渲染
          })
        } else {//最后一个时间段是 已结束
          let timeText = that.data.timeText;
          timeText[timeText.length - 1].timeStatus = 0;
          that.setData({timeText,timeStatus: 0})
        }
      } else { //当前活动已开始
        let date = _TimeRubbingEnd - NewTimeRubbing;
        let arr = app.timeTrans(date)
        if (arr[0] == 0) {
          if (arr[1] == 0) {
            if (arr[2] == 0) {
              clearInterval(presaleTime); //清除定时器
              that.getNewMessage()
            }
          }
        }
        that.setData({Today: app.timeTrans(date)})
      }
    }
  },
  // 获取对应时段的次数
  getStatusNum: function (status, timeText) {
    let that = this;
    let timeTexts = timeText || that.data.timeText;
    let num = 0;
    for (let i in timeTexts) {
      if (timeTexts[i].timeStatus == Number(status)) {
        num++;
      }
    }
    return num;
  },
  // 获取每个时间段第一个
  getFirstIndex: function (status, timeText) {
    let that = this;
    let timeTexts = timeText || that.data.timeText;
    let index = 0;
    for (let i in timeTexts) {
      if (timeTexts[i].timeStatus == Number(status)) {
        index = i;
        break;
      }
    }
    return index;
  },
  //重新获取数据
  getNewMessage: function () {
    let that = this;
    const newDate = util.getNowDate(new Date()); //当前日期 2019-08-25
    const nowTime = util.getNowTime(new Date()); //当前时间 11:05
    //获取秒杀时间段
    axios.post({
      url: `${urlItem}public/sec/kill/times`,
      data: {
        "branchNo": that.data.branchNo,
        "blId": that.data.blId, // 业务线ID
        "dateFrom": newDate, // 开始日期
        "dateTo": newDate // 结束日期 
      }
    }).then(res => {
      let timeList = res.data.respData;
      wx.hideLoading();
      if(timeList.length==0){//没有秒杀时间段
        that.setData({noShop:true})
        return false;
      }
      let timeText = that.getTimeList(timeList);
      const startNum = that.getStatusNum(1, timeText); //已开始
      const startingNum = that.getStatusNum(2, timeText); //即将开始
      let startIndex = 0,startTime = 0,endTime = 0
      if (startNum > 0) {//有已开始时间段
        startIndex = that.getFirstIndex(1, timeText);
        startTime = timeList[startIndex].timeFrom;
        endTime = timeList[startIndex].timeTo;
      } else if (startNum <= 0 && startingNum > 0) {//没有已开始时间段 有即将开始时间段
        startIndex = that.getFirstIndex(2, timeText);
        startTime = nowTime;
        endTime = timeList[startIndex].timeFrom;
      } else {//没有已开始也没有即将开始 全部已结束
        startIndex = timeText.length - 1;
        startTime = timeList[startIndex].timeFrom;
        endTime = timeList[startIndex].timeTo;
      }
      axios.post({
        url: `${urlItem}public/sec/kill/items`,
        data: {
          "branchNo": that.data.branchNo,
          "blId": that.data.blId, // 业务线ID
          "dateFrom": newDate, // 开始日期
          "dateTo": newDate, // 结束日期
          "timeFrom": timeText[startIndex].timeFrom, // 开始时间
          "timeTo": timeText[startIndex].timeTo, // 结束时间
          "userId": wx.getStorageSync("userId"),
          "stId": timeText[startIndex].stId
        }
      }).then(res => {
        wx.hideLoading();
        let data = res.data.respData
        if(data){
          data.map(i=>i.quantity=0)
        }
        let dataTime = that.getDataTime(startIndex, timeText);
        clearInterval(presaleTime);
        presaleTime = setInterval(() => {
          that.TodayDate(startTime, endTime)
        }, 1000)
        that.setData({
          timeText,dataTime,
          clickIndex: startIndex,
          shopList: res.data.respData,
          timeStatus: timeText[startIndex].timeStatus, //已开始
          intoView: "view" + (startIndex == 0 ? 1 : startIndex - 1)
        })
      })
    })
  },
  // 返回新的时间段
  getTimeList(timeList) {
    let that = this;
    const nowTime = util.getNowTime(new Date()); //当前时间 11:05
    let timeText = [];
    for (let i in timeList) {
      let {timeFrom,timeTo,stId} = timeList[i];
      const timeStatus = that.compareTime(timeFrom, timeTo, nowTime)
      const obj = {timeFrom,timeTo,stId,timeStatus}
      timeText.push(obj);
    }
    return timeText;
  },
  // 返回新的dataTime
  getDataTime(index, timeText) {
    const {timeFrom,timeTo,timeStatus,stId} = timeText[index];
    return { timeFrom, timeTo, timeStatus, stId }
  },
  // onshow中重新获取数据
  getShowMessage(){
    wx.showLoading({title: '加载中'})
    let that = this;
    const newDate = util.getNowDate(new Date());// 当前日期
    const nowTime = util.getNowTime(new Date()); // 当前时间
    const dataTime = that.data.dataTime;
    const {timeFrom,timeTo,timeStatus,stId} = dataTime;
    clearInterval(presaleTime); //清除定时器
    axios.post({
      url: `${urlItem}public/sec/kill/items`,
      data: {
        "branchNo": that.data.branchNo,
        "blId": that.data.blId, // 业务线ID
        "dateFrom": newDate, // 开始日期
        "dateTo": newDate, // 结束日期
        "timeFrom": timeFrom, // 开始时间
        "timeTo": timeTo, // 结束时间
        "userId": wx.getStorageSync("userId"),
        "stId": stId
      }
    }).then(res => {
      let data = res.data.respData
      if (data) {
        data.map(i => i.quantity = 0)
      }
      if (timeStatus == 2) { //即将开始
        presaleTime = setInterval(() => {
          that.TodayDate(nowTime, timeFrom)
        }, 1000)
      } else if (timeStatus == 1) { //已开始
        presaleTime = setInterval(() => {
          that.TodayDate(timeFrom, timeTo)
        }, 1000)
      }
      that.setData({
        timeStatus,dataTime,
        shopList: res.data.respData,
      })
      wx.hideLoading();
    })
  },
  //获取首页背景图
  getBackgroundImg(branchNo){
    let that = this,backgroundUrl = 'https://antspace-prod-img-1.oss-cn-shenzhen.aliyuncs.com/test2.png'
    axios.getData({
      url: `${urlItem}adverBanner/getAppletAdver?branchNo=${branchNo}&adPosition=spike_banner1`
    }).then(res=>{
      that.setData({backgroundUrl:res.data.respData ? res.data.respData.advers[0].adImg : backgroundUrl})
    },() => {
      that.setData({backgroundUrl})
    })
  },
  // 获取rpx值
  getRpxNum: function(){
    let that = this
    wx.getSystemInfo({
      success: (res) => {
        const rpx = 1 * (res.windowWidth * res.pixelRatio) / (750 * res.pixelRatio);
        const { pixelRatio, windowHeight, windowWidth} = res;
        that.setData({pixelRatio,windowHeight,windowWidth,rpx})
      },
    })
  },
  showToast: function(tips) {
    wx.showToast({title: tips,icon: 'none'})
  }
})