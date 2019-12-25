// pages/newOrderdetail/newOrderdetail.js
var app = getApp();
var url = app.baseUrl + "service-order-prc/";
var call = require("../../utils/call.js");
import QRCode from '../../utils/qrcode.js'
var baseurl = app.baseUrl + "service-member/";
import request from '../../utils/my_page'
var cache = require("../../utils/cache.js");
let timer,sizeIndex=1
Page({

  /**
   * 页面的初始数据
   */
  data: {
    countdown: '',
    message: [],
    goods: [],
    string: "",
    strings: "",
    index: null,
    orderNo: "",
    orderStatus: "",
    orderType: "",
    branchNo: null,
    requireTime: null,
    pickUpString: null,
    pickupCode: null,
    paydata: [],
    locationId: null,
    salePrice: null,
    count: null,
    time: null,
    qrcodeIndex: "",
    qrcode: '',
    yard: false,
    item: [],
    combo: [],
    model: false,
    isCustomerService: false,
    payOff: true
  },
  qrcode(data) {
    new QRCode('myQrcode', {
      text: data,
      width: 150,
      height: 150,
    })
  },
  //售后服务
  afterSales: function () {
    console.log(app.globalData.orderData)
    app.globalData.message = app.globalData.orderData;
    wx.navigateTo({
      url: "../after/after",
    })
  },
  replacepos(text, start, stop, replacetext) {
    var mystr = text.substring(0, stop - 1) + replacetext + text.substring(stop + 1);
    return mystr;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app.globalData.orderData)
    var order = app.globalData.orderData
    var data = []
    var salePrice = null

    for (let i in order.saleItems) {
      let orderno = order.saleItems[i]
      data.push({
        "barCode": orderno.itemNo,
        "itemName": orderno.itemName,
        "number": orderno.quantity,

      })
    }
    for (let index in order) {
      if (order.orderStatus == "UNPAID") {
        order.orderNos = this.replacepos(order.orderNo, 0, order.orderNo.length, 'X')
      } else {
        order.orderNos = order.orderNo
      }
    }
    let time
    let count = null
    // if (order.cabinetGridNo == "") {
    var supplierNo = "NORMAL"
    // } else {
    //   var supplierNo = "SUPPLIERNO"
    // }
    this.setData({
      count: count,
      paydata: data,
      message: order,
      goods: order.items,
      orderNo: order.orderNo,
      orderStatus: order.orderStatus,
      orderType: order.orderType,
      pickupCode: order.pickupCode,
      branchNo: order.branchNo,
      requireTime: new Date(order.requireTime).getTime(),
      pickUpString: order.requireTime,
      locationId: order.distLocId,
      qrcodeIndex: supplierNo + "-" + order.orderNo + "-" + order.pickupCode + "-" + order.orderType + "-" + "COMPLETED"
    })
    for (let i in this.data.goods) {
      if (this.data.goods[i].itemTemp == "ITEM") {
        this.setData({
          item: this.data.goods[i].saleItems
        })
      } else if (this.data.goods[i].itemTemp == "COMBO") {
        this.setData({
          combo: this.data.goods[i].saleItems
        })
      }
    }
    this.countTime()
  },
  //再来一单 暂时用不上
  recur(e) {
    console.log(e)
    let goods = e.currentTarget.dataset.chose.saleItems
    let data = []
    let saleItems = []
    let money
    call.getData("/service-order-prc/saleOrder/againOrder/verifyInventory/" + e.currentTarget.dataset.chose.orderNo + "/" + app.globalData.branch.branchNo, data, (res) => {
      console.log(res)
      if (res.respCode == "0000" && res.respData !== null && res.respData.length !== 0) {
        let money = null
        for (let i in goods) {
          money += goods[i].salePrice
          saleItems.push({
            id: goods[i],
            number: goods[i].quantity,
            comb: false,
            extOptions: []
          })
        }
        console.log(saleItems)
        saleItems.map((p, i) => {
          saleItems[i].id.planNo = ""
          saleItems[i].id.couponPlanNo = []
          saleItems[i].id.itemQty = saleItems[i].id.quantity
          saleItems[i].id.proCode1 = 100
          saleItems[i].id.disPrice = 0
          saleItems[i].id.advanceSaleWindow = ''
        })
        app.globalData.order = saleItems
        wx.navigateTo({
          url: '../confirmOrder/confirmOrder?money=' + money + "&sumsalePrice=" + money,
        })
        console.log(money)
        console.log(saleItems)
      } else {
        wx.showModal({
          title: '以下商品库存不足无法购买',
          content: res.respData,
          showCancel: false,
          confirmText: "取消"
        })
      }
    })
  },
  yardView() {
    this.setData({
      yard: true,
      qrcode: this.data.qrcodeIndex
    })
    this.qrcode(this.data.qrcodeIndex);
  },
  clear() {
    this.setData({
      yard: false
    })
  },
  countTime: function () {
    var that = this;
    var date = new Date();
    var endDate = new Date(that.data.message.createdDate.replace(/\-/g, '/'));
    var now = date.valueOf();
    var end = endDate.valueOf() * 1 + 1800000;
    var leftTime = end - now;
    var d, h, m, s, ms;
    if (leftTime >= 0) {
      d = Math.floor(leftTime / 1000 / 60 / 60 / 24);
      h = Math.floor(leftTime / 1000 / 60 / 60 % 24);
      m = Math.floor(leftTime / 1000 / 60 % 60);
      s = Math.floor(leftTime / 1000 % 60);
      ms = Math.floor(leftTime % 1000);
      ms = ms < 100 ? "0" + ms : ms
      s = s < 10 ? "0" + s : s
      m = m < 10 ? "0" + m : m
      h = h < 10 ? "0" + h : h
      that.setData({
        countdown: m + ":" + s
      })
      timer = setTimeout(that.countTime, 100);
    } else {
      clearTimeout(timer)
      if(sizeIndex<4){
        wx.request({
          url: url + 'saleOrder/updateOrderStatus',
          method: "POST",
          data: {
            "orderNo": that.data.orderNo,
            "orderStatus": "CANCELLED",
            "pickupCode": that.data.pickupCode,
            "orderType": that.data.orderType,
          },
          success: function (res) {
            sizeIndex++
            clearTimeout(timer)
          }
        })
      }



    }
  },
  pay: function () {
    let that = this;
    var sessionId = cache.get('sessionId', 'null');
    if (that.data.payOff == true) {
      that.setData({
        payOff: false
      })
      wx: wx.request({
        url: baseurl + 'proceed/pay/' + that.data.orderNo,
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          'Cookie': "JSESSIONID=" + sessionId
        },
        // data:{

        // "storeId": that.data.branchNo,
        // "pickUpTime": that.data.pickUpString,
        // "pickUpString": that.data.pickUpString,
        //   "goodsList":that.data.paydata,
        // "locationId":1,
        // "locationId":that.data.locationId
        // },
        success: function (res) {

          console.log(res)
          if (res.data.respCode !== "0000") {
            wx.showModal({
              title: res.data.respDesc,

            })
          } else {
            var data = res.data.respData;
            wx.requestPayment({
              timeStamp: data.timeStamp,
              nonceStr: data.nonceStr,
              package: data.packageValue,
              signType: data.signType,
              paySign: data.paySign,
              success(res) {
                wx.showToast({
                  title: '支付成功',
                })
                app.globalData.refreshOrder = true
                wx.navigateBack()
              },
              fail(res) {
                that.setData({
                  payOff: true
                })
                wx.showToast({
                  title: '支付失败',
                  icon: 'none'
                })
              }
            })
          }
        }
      })
    } else {
      that.setData({
        payOff: true
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  cancel: function () {
    let that = this
    wx.showModal({
      title: '提示',
      content: "确定取消订单吗",
      success(res) {
        if (res.confirm) {
          wx.request({
            url: url + 'saleOrder/updateOrderStatus',
            method: "POST",
            data: {
              "orderNo": that.data.orderNo,
              "orderStatus": "CANCELLED",
              "pickupCode": that.data.pickupCode,
              "orderType": that.data.orderType,

            },
            success: function (res) {
              app.globalData.refreshOrder = true
              wx.navigateBack({

              })

            }
          })

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

    console.log(this)

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // this.cancel()
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
    // app.globalData.orderData=[]
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
  onShareAppMessage: function (options) {
    console.log(options)
    var that = this;
    // 设置转发内容
    var shareObj = {
      title: "我家小程序",
      path: '/pages/connectWifi/connectWifi', // 默认是当前页面，必须是以‘/’开头的完整路径
      imgUrl: '', //转发时显示的图片路径，支持网络和本地，不传则使用当前页默认截图。
      success: function (res) {　 // 转发成功之后的回调　　　　　

      },

    };

    return shareObj;
  },

  //申请发票
  invoice: function () {
    app.globalData.invoice.push(this.data.message);
    console.log(this.data.message)
    wx.navigateTo({
      url: `../invoice/invoice`,
    })
  },
  //开票中&开票成功
  invoiceState: function () {
    app.globalData.invoiceState.push(this.data.message);
    console.log(this.data.message)
    wx.navigateTo({
      url: `../invoiceDetails/invoiceDetails`,
    })
  },
  //申请退款
  jumpTo: function () {
    app.globalData.messages.push(this.data.message)
    wx.navigateTo({
      url: `../refund/refund`,
    })
  },
  // 阻止事件向下传递
  toLogIstics(e) {
    wx.navigateTo({
      url: '/OrderList/logistics/logistics?orderNo=' + app.globalData.orderData.orderNo
    })
  },
  isModel(e) {
    this.setData({
      model: true,
    })
  },
  confirmReceipt() {
    request('/service-order-prc/applet/order/notarize/' + app.globalData.orderData.orderNo, {}, true, 'GET').then(res => {
      if (res.respCode == '0000') {
        wx.showToast({
          title: '收货成功',
        })
      }
      let list = this.data.message
      list.userConfirmed = '已收货'

      this.setData({
        model: false,
        message: list
      })
      console.log(this.data.message)
    })
  },
  closeModel() {
    this.setData({
      model: false
    })
  },
  callPhone() {
    let that = this
    wx.makePhoneCall({
      phoneNumber: "13411080802",
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        that.setData({
          isCustomerService: true
        })
      }
    })
  },
  copy(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.item,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功'
            })
          }
        })
      }
    })
  }
})