const app = getApp();
const call = require("../../utils/call.js")
const url = app.baseUrl + "service-member/";
const cache = require("../../utils/cache.js");
const util = require('../../utils/util.js')
Page({
  data: {
    src: "", //用户头像
    name: "", //用户名
    experienceCardUsed: null, //判断领取过体验卡没有
    gets: "立即领取",
    effectiveTo: "",
    memberStatus: "", //会员卡状态
    memberName: '', //会员卡名称
    memberImg: '', //会员卡图标
    cardImage: [],
    indexs: 0,
    chose: null,
    price: 0,
    disable: false,
    isExpired: false, //是否已过期
  },
  //体验卡时间
  experienceTime() {
    let data = []
    call.getData("/service-member/public/get/experience/day", data, (res) => {
      if (res.respData !== null && res.respCode == "0000") {
        this.setData({
          timeDay: res.respData
        })
      }
    })
  },
  //toux
  userinfo() {
    let that = this
    wx.getUserInfo({
      success(res) {
        that.setData({
          src: res.userInfo.avatarUrl,
          name: res.userInfo.nickName,
        })
      }
    })
  },
  //立即支付
  pay() {
    let p = {
      "itemNo": this.data.chose.cardNo, //商品编号
      "quantity": 1, //商品数量
      "salePrice": this.data.chose.price, //商品原价
      "vipPrice": this.data.chose.price, //会员价
      "itemName": this.data.chose.cardName, //商品名
      "weight": 10, //商品重量
    }

    let data = {
      "branchNo": app.globalData.branch.branchNo,
      "pickUpString": '',
      "orderType": "SELF",
      "pickUpTime": '',
      "items": [p],
      "locationId": "",
      "totalFee": this.data.price,
      "couponNo": "", //券编号
      "planNo": "", //促销编号
      "planId": "", //方案id
      "notes": "", //订单备注
    }
    let that = this
    if (!that.data.disable) {
      this.setData({
        disable: true
      })
      wx.request({
        url: `${app.baseUrl}service-member/member/new/prepay`,
        method: "POST",
        data: data,
        header: {
          'Cookie': "JSESSIONID=" + cache.get('sessionId', 'null')
        },
        success(rest) {
          // 请求支付
          wx.requestPayment({
            timeStamp: rest.data.respData.timeStamp,
            nonceStr: rest.data.respData.nonceStr,
            package: rest.data.respData.package,
            signType: rest.data.respData.signType,
            paySign: rest.data.respData.paySign,
            success() { //支付成功
              that.setData({
                disable: false
              })
              that.openFace()
            },
            fail() {
              wx.showToast({
                title: '已取消支付',
              })
              that.setData({
                disable: false
              })
            }
          })
        }
      })
    }

  },
  //领取体验卡
  gets: function() {
    let data = []
    let that = this
    wx.request({
      url: url + "/new/recharge/experienceCard",
      method: 'POST',
      header: {
        'Cookie': "JSESSIONID=" + cache.get('sessionId', 'null')
      },
      success: function (rest) {
        if (rest.data.respCode == "0000" && rest.data.respDesc == "成功") {
          wx.showToast({
            title: '领取成功',
          })
          that.openFace()
        }

      }
    })
  },
  //选中会员卡
  payselect: function(e) {
    this.setData({
      indexs: e.currentTarget.dataset.index,
      price: e.currentTarget.dataset.chose.price,
      chose: e.currentTarget.dataset.chose
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.card()
    this.experienceTime()
    this.openFace();
    var that = this;
    if (options.confirm) {
      that.setData({
        "confirm": 1
      })
    }
  },
  card() {
    let that = this
    wx.request({
      url: url + "query/all/pmCards",
      method: 'GET',
      header: {
        'Cookie': "JSESSIONID=" + cache.get('sessionId', 'null')
      },
      success: function (rest) {
        if (rest.data.respData !== null && rest.data.respData.length !== 0) {
          that.setData({
            cardImage: rest.data.respData,
            chose: rest.data.respData[0],
            price: rest.data.respData[0].price
          })
        }
      }
    })
  },
  openFace() {
    let that = this
    const now_date = util.getNowDate(new Date());//当前日期
    wx.request({
      url: `${url}new/query/usrInfo`,
      method: 'GET',
      header: {
        'Cookie': "JSESSIONID=" + cache.get('sessionId', 'null')
      },
      success: function (rest) {
        const { experienceCardUsed, effectiveTo, memberStatus } = rest.data.respData
        const { memberName, memberImg } = util.chmemberName(memberStatus);
        const isExpired = util.compareDate(now_date, effectiveTo)
        that.setData({ experienceCardUsed, effectiveTo, memberStatus, memberName, memberImg, isExpired })
        if (that.data.experienceCardUsed) {
          that.setData({
            gets: "已领取"
          })
        } else {
          that.setData({
            gets: "立即领取"
          })
        }
      }
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
    if (app.globalData.quit) {
      this.setData({
        quit: false
      })
    }
    let that = this
    that.userinfo()
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