const call = require("../../utils/call.js");
const cache = require("../../utils/cache.js");
let recordList = []
Page({
  data: {
    item: "最近七天",
    selects: [{id: "最近七天"},{id: "最近一月"},{id: "最近三月"},],
    show: true,
    date: null,
    record: [],
    recordList: [],
    pageNum: 1,
    pageSize: 9,
    hide: false,
    time: null
  },

  // 生命周期函数--监听页面加载
  onLoad: function(options) {

  },
  date(i) {
    let date = i;
    let seperator1 = "-";
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let strDate = date.getDate();
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    let data = year + seperator1 + month + seperator1 + strDate;
    this.setData({
      date: data
    })
  },
  //账单信息
  bill(times) {
    let date = new Date();
    let seperator1 = "-";
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let strDate = date.getDate();
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    let currentdate = year + seperator1 + month + seperator1 + strDate;
    let time = new Date().getTime()
    let month1 = time - times
    let months = new Date(month1)
    this.date(months)
    let data = {
      "pageNum": this.data.pageNum,
      "pageSize": this.data.pageSize,
      "searchParams": {
        "userId": cache.get("userId", "null"), // 用户编号 必填
        "startDate": this.data.date, // 开始日期 必填
        "endDate": currentdate // 结束日期 必填
      }
    }
    call.postData("/service-member/public/get/account/info", data, (res) => {
      if (res.respCode == "0000") {
        if (res.respData.length !== 0) {
          for (let i in res.respData) {
            recordList.push(res.respData[i])
          }
          this.setData({
            recordList: recordList,
          })
          if (res.respData.length < this.data.pageSize) {
            this.setData({
              hide: true
            })
          }
        } else {
          this.setData({
            hide: true
          })
        }
      }
    })
  },
  //点击下拉
  button() {
    this.setData({
      show: false
    })
  },
  //点击选中
  buttons(e) {
    this.setData({
      item: e.currentTarget.dataset.item.id,
      show: true
    })
    if (this.data.item == "最近七天") {
      let time = 604800000
      recordList=[]
      this.setData({
        time: time,
        pageNum: 1,
        hide: false
      })
      this.bill(time)
    } else if (this.data.item == "最近一月") {
      recordList=[]
      let time = 2592000000
      this.setData({
        time: time,
        pageNum: 1,
        hide: false
      })
      this.bill(time)
    } else if (this.data.item == "最近三月") {
      recordList=[]
      let time = 7776000000
      this.setData({
        time: time,
        pageNum: 1,
        hide: false
      })
      this.bill(time)
    }
  },

  // 生命周期函数--监听页面显示
  onShow: function() {
    recordList = []
    let time = 604800000
    this.setData({
      time: time
    })
    this.bill(time)
  },

  // 页面上拉触底事件的处理函数
  onReachBottom: function() {
    if (this.data.hide) {
      wx.showLoading({
        title: '已经到底啦',
      })
      setTimeout(() => {
        wx.hideLoading()
      }, 500)

    } else {
      wx.showLoading({
        title: '加载中',
      })
      setTimeout(() => {
        wx.hideLoading()
      }, 500)
      this.setData({
        pageNum: this.data.pageNum + 1,

      })
      this.bill(this.data.time)
    }
  }
})