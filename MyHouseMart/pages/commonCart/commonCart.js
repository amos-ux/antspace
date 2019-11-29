const app = getApp();
const cache = require("../../utils/cache.js");
import _http from '../../utils/request.js';
const call = require("../../utils/call.js")
const confirm = require("../../utils/confirm.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    quit: false,
    hideModal: true,
    animationData: {},
    items: [],
    astrict: false,
    i: null,
    checkAll: false,
    outmodedItems: [], //失效商品
    fullItems: [],
    satisfied: [],
    totalPrice: 0,
    discounts: 0,
    originaPrice: 0,
    discountsRoll: [],
    disPrice: 0,
    show: false,
    isShow: false,
    propsShow: false,
    userAuthorization: true,
    activitySalePrice: 0,
    text: [],
    totalValue: 0,
    onSale: 0,
    sendMonry: 0,
    money: "9.8",
    reminder: false,
    memberStatus: "",
    uniqueCode: null
  },
  //获取满减金额
  fulfil() {
    let fullItems = this.data.fullItems;
    console.log(fullItems)
    let items = this.data.items
    console.log(items)
    let obj = fullItems.concat(items)
    console.log(obj)
    let data = []
    obj.map(i => {
      data.push(i.planNo)
    })
    call.postData("/service-mall/user/full/promotion/notify", data, (res) => {
      this.setData({
        text: res.respData
      })
    })
  },
  sendMonry() {
    let data = []
    call.getData("/service-mall/address/queryMinBranchDistFee/" + app.globalData.branch.branchNo, data, (res) => {
      console.log(res)
      this.setData({
        sendMonry: res.respData
      })
    })
  },
  //去凑单
  button() {
    wx.switchTab({
      url: '../index/index',
    })
  },
  //活动规则
  rule(e) {
    let rule = e.currentTarget.dataset.rule.dataTemplate.rule
    this.setData({
      rule: rule,
      propsShow: true,
    })
  },
  // 显示遮罩层
  showModal: function () {
    var that = this;
    that.setData({
      hideModal: false
    })
    var animation = wx.createAnimation({
      duration: 600,
      timingFunction: 'ease',
    })
    this.animation = animation
    setTimeout(function () {
      that.fadeIn();
    }, 200)
  },
  money() {
    _http.get({
      url: `${app.baseUrl}service-user/public/member/doors`
    }).then(res => {
      this.setData({
        money: res.data
      })
      console.log(res)
    })
  },
  //全选调用优惠
  allDiscound() {
    let goods = this.data.items.concat(this.data.fullItems)
    let goodsList = goods.filter(i => i.astrict)
    let data = []
    if (goodsList.length !== 0) {
      goodsList.map(i => {
        data.push({
          "itemNo": i.itemNo,
          "quantity": i.quantity
        })
      })
      call.postData("/service-item/trolley/discountsCount?branchNo=" + app.globalData.branch.branchNo, data, (res) => {
        console.log("res", res)
        this.setData({
          disPrice: res.respData.discountAmt
        })
        this.setData({
          totalValue: (this.data.originaPrice - res.respData.discountAmt - this.data.activitySalePrice) < 0 ? 0 : (this.data.originaPrice - res.respData.discountAmt - this.data.activitySalePrice),
          onSale: (res.respData.discountAmt + this.data.activitySalePrice) < 0 ? 0 : (res.respData.discountAmt + this.data.activitySalePrice)
        })
      })
    } else {
      this.setData({
        totalValue: this.data.originaPrice - this.data.activitySalePrice,
        onSale: this.data.activitySalePrice
      })
    }
  },

  //获取优惠券
  gain() {
    //满减
    let fullItems = this.data.fullItems
    let fullItem = fullItems.filter(item => item.astrict)
    //不满减
    let items = this.data.items
    let item = items.filter(item => item.astrict)
    let goods = item.concat(fullItem)
    if (goods.length) {
      let payCouponsParams = []
      goods.map(i => {
        payCouponsParams.push({
          "couponPlanNo": i.couponPlanNo,
          "itemQty": i.quantity,
          "salePrice": i.salePrice
        })
      })
      let data = {
        "userId": cache.get("userId", "null"),
        "payCouponsParams": payCouponsParams
      }
      call.postData("/service-mall/public/v2/user/cart", data, (res) => {
        this.setData({
          discountsRoll: res.respData
        })
      })
    } else { }
  },
  preventD() {
    return
  },
  // 隐藏遮罩层
  hideModal: function () {
    var that = this;
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })
    this.animation = animation
    that.fadeDown();
    setTimeout(function () {
      that.setData({
        hideModal: true
      })
    }, 500)
  },
  //动画集
  fadeIn: function () {
    this.animation.translateY(0).step()
    this.setData({
      animationData: this.animation.export()
    })
  },
  fadeDown: function () {
    this.animation.translateY(480).step()
    this.setData({
      animationData: this.animation.export(),
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.money()
  },
  //不满减单选
  click(e) {
    let index = e.currentTarget.dataset.index
    let items = this.data.items
    items[index].astrict = !items[index].astrict
    let goods = items.concat(this.data.fullItems)
    let empty = goods.filter(i => i.astrict == false)
    if (items[index].astrict) {
      this.gain()
    }
    if (empty.length) {
      this.setData({
        checkAll: false
      })
    } else {
      this.setData({
        checkAll: true
      })
    }
    this.setData({
      items: items,
    })
    this.totalPrice()
    // this.allDiscound()

  },
  //满减单选
  clicks(e) {
    let index = e.currentTarget.dataset.index
    let fullItems = this.data.fullItems
    fullItems[index].astrict = !fullItems[index].astrict
    if (fullItems[index].astrict) {
      this.gain()
    }
    let goods = fullItems.concat(this.data.items)
    let empty = goods.filter(i => i.astrict == false)
    if (empty.length) {
      this.setData({
        checkAll: false
      })
    } else {
      this.setData({
        checkAll: true
      })
    }
    this.setData({
      fullItems: fullItems
    })
    this.totalPrice()
    // this.allDiscound()

  },

  //不满减购物车加减
  sub(e) {
    let type = e.currentTarget.dataset.type
    let index = e.currentTarget.dataset.index
    let item = e.currentTarget.dataset.item
    let items = this.data.items
    this.setData({
      i: index
    })
    if (type == "add") {
      if (items[index].quantity < item.stockQty) {
        if (item.limitedByUser !== null) {
          if (items[index].quantity < item.limitedByUser) { //达到限购数
            items[index].quantity++
            this.totalPrice()
            // this.allDiscound()
            this.setData({
              items: items
            })
            let data = {
              "sessionId": cache.get("sessionId", null),
              "itemNo": e.currentTarget.dataset.item.itemNo,
              "quantity": "1",
              "branchNo": app.globalData.branch.branchNo,
              "blId": e.currentTarget.dataset.item.blId,
              "isCombined": e.currentTarget.dataset.item.isCombined,
              "combSubItems": e.currentTarget.dataset.item.combSubItems
            }
            call.postData("/service-item/trolley/addItemToTrolley", data, (res) => {
              console.log(res)
            })
          } else {
            wx.showToast({
              icon: "none",
              title: '已达限购数',
            })
          }
        } else {
          items[index].quantity++
          this.totalPrice()
          // this.allDiscound()

          this.setData({
            items: items
          })
          let data = {
            "sessionId": cache.get("sessionId", null),
            "itemNo": e.currentTarget.dataset.item.itemNo,
            "quantity": "1",
            "branchNo": app.globalData.branch.branchNo,
            "blId": e.currentTarget.dataset.item.blId,
            "isCombined": e.currentTarget.dataset.item.isCombined,
            "combSubItems": e.currentTarget.dataset.item.combSubItems
          }
          call.postData("/service-item/trolley/addItemToTrolley", data, (res) => {

          })
        }
      } else {
        wx.showToast({
          icon: "none",
          title: '购物商品已达成最大库存',
        })
        item.astrict = true
      }
    } else if (type = "sub") {
      if (items[index].quantity <= 1) {
        let that = this
        wx.showModal({
          content: '你是否要删除已选择商品',
          confirmText: "确认",
          cancelText: "取消",
          success(res) {
            if (res.confirm) {
              items.splice(items.indexOf(items[index]), 1)
              let goods = that.data.items.concat(that.data.fullItems)
              let good = goods.concat(that.data.outmodedItems)

              if (good.length == 0) {
                that.setData({
                  show: true
                })
              }
              that.setData({
                items: items
              })
              let data = {
                "sessionId": cache.get("sessionId", null),
                "itemNo": e.currentTarget.dataset.item.itemNo,
                "quantity": "-1",
                "branchNo": app.globalData.branch.branchNo,
                "blId": e.currentTarget.dataset.item.blId,
                "isCombined": e.currentTarget.dataset.item.isCombined,
                "combSubItems": e.currentTarget.dataset.item.combSubItems
              }
              call.postData("/service-item/trolley/addItemToTrolley", data, (res) => {

              })
              that.totalPrice()
              // that.allDiscound()

            } else if (res.cancel) {

            }
          }
        })

      } else {
        items[index].quantity--
        this.totalPrice()
        // this.allDiscound()

        this.setData({
          items: items
        })
        let data = {
          "sessionId": cache.get("sessionId", null),
          "itemNo": e.currentTarget.dataset.item.itemNo,
          "quantity": "-1",
          "branchNo": app.globalData.branch.branchNo,
          "blId": e.currentTarget.dataset.item.blId,
          "isCombined": e.currentTarget.dataset.item.isCombined,
          "combSubItems": e.currentTarget.dataset.item.combSubItems
        }
        call.postData("/service-item/trolley/addItemToTrolley", data, (res) => {

        })
      }

    }
  },
  //满减购物车加减
  add(e) {
    let type = e.currentTarget.dataset.type
    let index = e.currentTarget.dataset.index
    let item = e.currentTarget.dataset.item
    let fullItems = this.data.fullItems
    this.setData({
      i: index
    })
    if (type == "add") {
      if (fullItems[index].quantity < item.stockQty) {
        fullItems[index].quantity++
        this.totalPrice()
        // this.allDiscound()
        this.setData({
          fullItems: fullItems
        })
        let data = {
          "sessionId": cache.get("sessionId", null),
          "itemNo": e.currentTarget.dataset.item.itemNo,
          "quantity": "1",
          "branchNo": app.globalData.branch.branchNo,
          "blId": e.currentTarget.dataset.item.blId,
          "isCombined": e.currentTarget.dataset.item.isCombined,
          "combSubItems": e.currentTarget.dataset.item.combSubItems
        }
        call.postData("/service-item/trolley/addItemToTrolley", data, (res) => { })
      } else {
        wx.showToast({
          icon: "none",
          title: '购物商品已达成最大库存',
        })
        item.astrict = true

      }

    } else if (type = "sub") {
      if (fullItems[index].quantity <= 1) {
        let that = this
        wx.showModal({
          content: '你是否要删除已选择商品',
          confirmText: "确认",
          cancelText: "取消",
          success(res) {
            if (res.confirm) {
              fullItems.splice(fullItems.indexOf(fullItems[index]), 1)
              let goods = that.data.items.concat(that.data.fullItems)
              let good = goods.concat(that.data.outmodedItems)
              if (good.length == 0) {
                that.setData({
                  show: true
                })
              }
              that.setData({
                fullItems: fullItems
              })
              that.totalPrice()
              // that.allDiscound()

              let data = {
                "sessionId": cache.get("sessionId", null),
                "itemNo": e.currentTarget.dataset.item.itemNo,
                "quantity": "-1",
                "branchNo": app.globalData.branch.branchNo,
                "blId": e.currentTarget.dataset.item.blId,
                "isCombined": e.currentTarget.dataset.item.isCombined,
                "combSubItems": e.currentTarget.dataset.item.combSubItems
              }
              call.postData("/service-item/trolley/addItemToTrolley", data, (res) => {
                console.log(res)
              })
            } else if (res.cancel) {

            }
          }
        })

      } else {
        fullItems[index].quantity--
        this.setData({
          fullItems: fullItems
        })
        this.totalPrice()
        // this.allDiscound()

        let data = {
          "sessionId": cache.get("sessionId", null),
          "itemNo": e.currentTarget.dataset.item.itemNo,
          "quantity": "-1",
          "branchNo": app.globalData.branch.branchNo,
          "blId": e.currentTarget.dataset.item.blId,
          "isCombined": e.currentTarget.dataset.item.isCombined,
          "combSubItems": e.currentTarget.dataset.item.combSubItems
        }
        call.postData("/service-item/trolley/addItemToTrolley", data, (res) => { })
      }
    }
  },
  //去结算
  settleAccounts() {
    //满减
    let fullItems = this.data.fullItems
    let fullItem = fullItems.filter(item => item.astrict)
    //不满减
    let items = this.data.items
    let item = items.filter(item => item.astrict)
    let goods = item.concat(fullItem)
    goods.map(i => {
      i.comb = false
      if (i.activitySalePrice !== null) {
        i.disPrice = i.activitySalePrice
      }
    })
    if (goods.length !== 0) {
      app.globalData.order = goods

      if (this.data.totalValue > 0 && this.data.originaPrice > 0 && this.data.onSale >= 0 && this.data.originaPrice >= this.data.totalValue) {
        console.log(this.data.activitySalePrice)
        wx.navigateTo({
          url: `../confirmOrder/confirmOrder?totalPrice=${this.data.totalValue}&originaPrice=${this.data.originaPrice}&onSale=${this.data.onSale}&seckill=${this.data.activitySalePrice}&firstPrice=${this.data.money}`,
        })
      }
    } else {
      wx.showToast({
        icon: "none",
        title: '你还没有选择任何商品',
      })
    }
  },
  //购物车全选
  checkAll() {
    let fullItems = this.data.fullItems
    let items = this.data.items
    if (this.data.checkAll) {
      fullItems.map((i, index) => {
        i.astrict = false
      })
      items.map((i, index) => {
        i.astrict = false
      })
      // this.setData({
      //   disPrice:0
      // })
    } else {
      fullItems.map((i, index) => {
        i.astrict = true
      })
      items.map((i, index) => {
        i.astrict = true
      })

    }
    this.setData({
      checkAll: !this.data.checkAll,
      items: items,
      fullItems: fullItems
    })
    this.totalPrice()
  },
  //删除
  deletes() {
    //不满减
    let that = this
    let items = this.data.items;
    let deleteItem = items.filter(item => !item.astrict)
    let goods = items.filter(item => item.astrict)
    //满减
    let fullItems = this.data.fullItems
    let deletefullItems = fullItems.filter(item => !item.astrict)
    let goodsfullItems = fullItems.filter(item => item.astrict)
    let goodsData = []
    if (goods.length !== 0 || goodsfullItems.length !== 0) {
      goods.map(i => {
        goodsData.push({
          "itemNO": i.itemNo,
          "bizLine": i.bizLine
        })
      })
      goodsfullItems.map(i => {
        goodsData.push({
          "itemNO": i.itemNo,
          "bizLine": i.bizLine
        })
      })
      console.log(goodsData)
      wx.showModal({
        content: '你是否要删除已选中商品',
        confirmText: "确认",
        cancelText: "取消",
        success(res) {
          if (res.confirm) {
            that.setData({
              items: deleteItem,
              fullItems: deletefullItems
            })
            let good = deleteItem.concat(deletefullItems).concat(that.data.outmodedItems)
            if (good.length == 0) {
              that.setData({
                show: true
              })
            }
          } else if (res.cancel) { }
        }

      })
      call.postData("/service-item/trolley/deleteTrolley?sessionId=" + cache.get("sessionId", null) + "&branchNo=" + app.globalData.branch.branchNo, goodsData, (res) => {

      })
    } else {
      wx.showToast({
        icon: "none",
        title: "您还没有选择任何商品",
      })
    }
  },
  //渲染数据
  information() {
    // console.log(this.data.userAuthorization)
    // if (this.data.userAuthorization) {
    //   this.setData({
    //     show: false
    //   })
    // }

    let data = []
    call.getData("/service-item/trolley/queryTrolley?branchNo=" + app.globalData.branch.branchNo + "&sessionId=" + cache.get("sessionId", this), data, (res) => {
      if (res.respData !== null) {
        if (res.respData.items.length !== 0) {
          res.respData.items.map(i => {
            i.astrict = true

          })

        }
        if (res.respData.fullItems.length !== 0) {
          res.respData.fullItems.map(i => {
            i.astrict = true
            if (i.fullPrice) {
              this.setData({
                satisfied: i.satisfied
              })
            }
          })
        }

        this.setData({
          items: res.respData.items,
          checkAll: true,
          show: false,
          fullItems: res.respData.fullItems,
          outmodedItems: res.respData.outmodedItems,

        })
        this.gain()
        this.totalPrice()
        // this.allDiscound()
        this.fulfil()
      } else {
        this.setData({
          show: true,
          items: [],
          fullItems: []
        })
      }
    }, (rest) => {
      this.setData({
        show: true
      })

    })
  },

  //计算总价
  totalPrice() {

    let items = this.data.items
    let fullItems = this.data.fullItems
    let goods = items.concat(fullItems)
    let goodsList = goods.filter(item => item.astrict)
    let originalCost = 0 //原价
    let activitySalePrice = 0
    let total = 0
    goodsList.map(i => {
      originalCost += i.salePrice * i.quantity
      if (i.activitySalePrice !== null) {
        activitySalePrice += i.salePrice * i.quantity //秒杀原价
        total += i.activitySalePrice * i.quantity //秒杀优惠价
        this.setData({
          activitySalePrice: activitySalePrice - total
        })

      }
    })
    this.setData({
      originaPrice: originalCost < 0 ? 0 : originalCost,
    })
    this.allDiscound()

  },

  //跳转到凑单
  collect() {

    let fullItems = this.data.fullItems
    let datas = []

    let data = datas
    fullItems.map(i => {
      datas.push(i.planNo)
    })
    console.log(data)
    wx.navigateTo({
      url: '../collect/collect?data=' + JSON.stringify(data),
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  number(e) {
    // if (e.detail.cloudID){
    //   wx.showLoading({
    //     title: '加载中...',
    //   })
    //   this.setData({
    //     userAuthorization: true
    //   }) 
    //   setInterval(() => {
    //     wx.hideLoading()
    //   }, 1000)
    //   this.information()
    // }
    // console.log(e)
  },
  skipLogin() {
    wx.navigateTo({
      url: '/pages/register/register',
    })
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
    console.log(cache.get("memberStatus", "null"))
    if (cache.get("memberStatus", "null")) {
      this.setData({
        memberStatus: cache.get("memberStatus", "null"),
        uniqueCode: cache.get("uniqueCode", "null")
      })
    }
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    setTimeout(() => {
      wx.hideLoading()
    }, 1000)
    let that = this
    wx.getSetting({
      success(res) {
        console.log(res)
        if (res.authSetting["scope.userInfo"]) { //true  代表已经获取信息
          that.setData({
            userAuthorization: true
          })
          that.information()
          that.sendMonry()

        } else {
          that.setData({
            userAuthorization: false
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
  onShareAppMessage: function (options) {
    var that = this;
    // 设置转发内容
    var shareObj = {
      title: "我家小程序",
      path: '/pages/connectWifi/connectWifi', // 默认是当前页面，必须是以‘/’开头的完整路径
      imgUrl: '', //转发时显示的图片路径，支持网络和本地，不传则使用当前页默认截图。
      success: function (res) {　 // 转发成功之后的回调　　　　　
      },
    };
    return shareObj;N
  },
})