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
    doubleRefundItems:[],
    doubleRefundItem:[],
    totalPrice: 0,
    discounts: 0,
    originaPrice: 0,
    discountsRoll: [],
    disPrice: 0,
    show: false,
    isShow:false,
    propsShow: false,
    userAuthorization: true,
    activitySalePrice: 0,
    text: [],
    totalValue: 0,
    onSale: 0,
    sendMonry: 0,
    money:"9.8",
    reminder:false,
    memberStatus:"",
    uniqueCode:null
  },
  //获取满减金额
  fulfil() {
    let obj = this.data.fullItems.concat(this.data.items).concat(this.data.items).concat(this.data.doubleRefundItems)
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
  // 获取起送费
  sendMonry() {
    let data = []
    call.getData("/service-mall/address/queryMinBranchDistFee/" + app.globalData.branch.branchNo, data, (res) => {
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
  showModal: function() {
    var that = this;
    that.setData({
      hideModal: false
    })
    var animation = wx.createAnimation({
      duration: 600,
      timingFunction: 'ease',
    })
    this.animation = animation
    setTimeout(function() {
      that.fadeIn();
    }, 200)
  },
  // 满多少激活内邀码
  money() {
    _http.get({
      url: `${app.baseUrl}service-user/public/member/doors`
    }).then(res => {
      this.setData({
        money: res.data
      })
    })
  },
  //全选调用优惠
  allDiscound() {
    // let goods = this.data.items.concat(this.data.fullItems)
    // let goodsList = goods.filter(i => i.astrict)
    let goodsList = this.data.fullItems.concat(this.data.items).concat(this.data.doubleRefundItems).filter(item => item.astrict)
    let data = []
    if (goodsList.length !== 0) {
      goodsList.map(i => {
        data.push({
          "itemNo": i.itemNo,
          "quantity": i.quantity
        })
      })
      call.postData("/service-item/trolley/discountsCount?branchNo=" + app.globalData.branch.branchNo, data, (res) => {
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
    let goods = this.data.fullItems.concat(this.data.items).concat(this.data.doubleRefundItems).filter(item => item.astrict)
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
    } else {}
  },
  // 阻止事件冒泡
  preventD() {
    return
  },
  // 隐藏遮罩层
  hideModal: function() {
    var that = this;
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })
    this.animation = animation
    that.fadeDown();
    setTimeout(function() {
      that.setData({
        hideModal: true
      })
    }, 500)
  },
  //动画集
  fadeIn: function() {
    this.animation.translateY(0).step()
    this.setData({
      animationData: this.animation.export()
    })
  },
  fadeDown: function() {
    this.animation.translateY(480).step()
    this.setData({
      animationData: this.animation.export(),
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.money()
  },
  //不满减单选
  click(e) {
    let index = e.currentTarget.dataset.index
    let items = this.data.items
    items[index].astrict = !items[index].astrict
    //doubleRefundItems 是抽出所有多倍返现商品的数组 运算拼接使用这个
    //doubleRefundItem 是渲染页面的
    let goods = items.concat(this.data.fullItems).concat(this.data.doubleRefundItems)
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
  //多倍单选
  check(e){
    let index = e.currentTarget.dataset.index
    let number = e.currentTarget.dataset.number
    let doubleRefundItems =[]
    let doubleRefundItem = this.data.doubleRefundItem
    doubleRefundItem[number][index].astrict = !doubleRefundItem[number][index].astrict
    JSON.parse(JSON.stringify(doubleRefundItem)).map(i=>{
      i.map(item=>{
        return  doubleRefundItems.push(item)
      })
    })
    if (doubleRefundItems[index].astrict) {
      this.gain()
    }
    let goods = doubleRefundItems.concat(this.data.items).concat(this.data.fullItems)
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
      doubleRefundItems: doubleRefundItems,
      doubleRefundItem: doubleRefundItem
    })
    this.totalPrice()
  },
  //满减单选
  clicks(e) {
    let index = e.currentTarget.dataset.index
    let fullItems = this.data.fullItems
    fullItems[index].astrict = !fullItems[index].astrict
    if (fullItems[index].astrict) {
      this.gain()
    }
    let goods = fullItems.concat(this.data.items).concat(this.data.doubleRefundItems)
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
    } else if (type == "sub") {
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
              let good = goods.concat(that.data.outmodedItems).concat(that.data.doubleRefundItems)

              if (good.length == 0) {
                // show 判断 无商品展示
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
  //多倍返现加减
  multiplicity(e){
    let type = e.currentTarget.dataset.type
    let index = e.currentTarget.dataset.index
    let item = e.currentTarget.dataset.item
    let doubleRefundItems = this.data.doubleRefundItems //计算 是抽离出多倍返现商品的
    let number = e.currentTarget.dataset.number
    let doubleRefundItem = this.data.doubleRefundItem // 和元数据格式一样，是渲染页面的
    this.setData({
      i: index
    })
    if (type == "add") {
      if (doubleRefundItem[number][index].quantity < item.stockQty) {
      doubleRefundItem[number][index].quantity += 1
      doubleRefundItems[number].quantity += 1
        this.totalPrice()
        this.setData({
          doubleRefundItems: doubleRefundItems,
          doubleRefundItem: doubleRefundItem
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
    } else if (type == "sub") {
      if (doubleRefundItem[number][index].quantity <= 1) {
        let that = this
        wx.showModal({
          content: '你是否要删除已选择商品',
          confirmText: "确认",
          cancelText: "取消",
          success(res) {
            if (res.confirm) {
              doubleRefundItem[number].splice(doubleRefundItem.indexOf(doubleRefundItem[index]), 1) //渲染
              let doubleRefundItemGoods = that.data.items.concat(that.data.doubleRefundItem)
              let doubleRefundItemGood = doubleRefundItemGoods.concat(that.data.outmodedItem).concat(that.data.items)
              if (doubleRefundItemGood.length == 0) {
                that.setData({
                  show: true
                })
              }
              that.setData({
                doubleRefundItems: doubleRefundItems,
                doubleRefundItem: doubleRefundItem
              })
              that.totalPrice()
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
            } else if (res.cancel) {

            }
          }
        })

      } else {
        doubleRefundItems[index].quantity--
        doubleRefundItem[number][index].quantity--
        this.setData({
          doubleRefundItems: doubleRefundItems,
          doubleRefundItem: doubleRefundItem
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
        call.postData("/service-item/trolley/addItemToTrolley", data, (res) => {})
      } else {
        wx.showToast({
          icon: "none",
          title: '购物商品已达成最大库存',
        })
        item.astrict = true
      }
    } else if (type == "sub") {
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
              let good = goods.concat(that.data.outmodedItems).concat(that.data.doubleRefundItems)
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
        call.postData("/service-item/trolley/addItemToTrolley", data, (res) => {})
      }
    }
  },
  //去结算
  settleAccounts() {
    let goods = this.data.fullItems.concat(this.data.items).concat(this.data.doubleRefundItems).filter(item => item.astrict)
    goods.map(i => {
      i.comb = false
      if (i.activitySalePrice !== null) {
        i.disPrice = i.activitySalePrice
      }
    })
    if (goods.length !== 0) {
      app.globalData.order = goods
      if (this.data.totalValue > 0 && this.data.originaPrice > 0 && this.data.onSale >= 0 && this.data.originaPrice >= this.data.totalValue) {
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
    let doubleRefundItems = this.data.doubleRefundItems
    let doubleRefundItem = this.data.doubleRefundItem
    if (this.data.checkAll) {
      fullItems.map((i, index) => {
        i.astrict = false
      })
      items.map((i, index) => {
        i.astrict = false
      })
      doubleRefundItems.map((i, index) => {
        i.astrict = false
      })
      // 渲染页面
      doubleRefundItem.map(i=>{
        i.map(item=>{
          item.astrict = false
        })
      })
    } else {
      fullItems.map((i, index) => {
        i.astrict = true
      })
      items.map((i, index) => {
        i.astrict = true
      })
      doubleRefundItems.map((i, index) => {
        i.astrict = true
      })
      // 渲染页面
      doubleRefundItem.map(i => {
        i.map(item => {
          item.astrict = true
        })
      })
    }
    this.setData({
      checkAll: !this.data.checkAll,
      items: items,
      doubleRefundItems: doubleRefundItems,
      fullItems: fullItems,
      doubleRefundItem: doubleRefundItem
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
    //多倍返现
    let doubleRefundItems = this.data.doubleRefundItems
    let doubleRefundItemsItems = doubleRefundItems.filter(item => !item.astrict)
    let goodsdoubleRefundItems = doubleRefundItems.filter(item => item.astrict)
    //渲染数据的多倍返现数据
    let doubleRefundItem = that.data.doubleRefundItem
    let  doubleRefundItemMessage=  doubleRefundItem.map(i=>{
      return i.filter(item => !item.astrict)
    })
    let goodsData = []
    if (goods.length != 0 || goodsfullItems.length != 0 || goodsdoubleRefundItems!=0) {
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
      goodsdoubleRefundItems.map(i => {
        goodsData.push({
          "itemNO": i.itemNo,
          "bizLine": i.bizLine
        })
      })

      wx.showModal({
        content: '你是否要删除已选中商品',
        confirmText: "确认",
        cancelText: "取消",
        success(res) {
          if (res.confirm) {
            that.setData({
              items: deleteItem,
              fullItems: deletefullItems,
              doubleRefundItem: doubleRefundItemMessage,
              doubleRefundItems: doubleRefundItemsItems
            })
            
            let good = deleteItem.concat(deletefullItems).concat(that.data.outmodedItems).concat(that.data.doubleRefundItems)
            if (good.length == 0) {
              that.setData({
                show: true
              })
            }
          } else if (res.cancel) {}
        }

      })
      call.postData("/service-item/trolley/deleteTrolley?sessionId=" + cache.get("sessionId", null)+"&branchNo="+app.globalData.branch.branchNo, goodsData, (res) => {

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
    let data = []
    call.getData("/service-item/trolley/queryTrolley?branchNo=" + app.globalData.branch.branchNo + "&sessionId=" + cache.get("sessionId", this), data, (res) => {
      let doubleRefundItem = []
      if (res.respData !== null) {
        if (res.respData.items.length !== 0) {
          res.respData.items.map(i => {
            i.astrict = true
          })
        }
        if (res.respData.doubleRefundItems){
          if (res.respData.doubleRefundItems.length !== 0) {
            res.respData.doubleRefundItems.map(i => {
              i.map(item=>{
                i.astrict = true
              })
            })
          }
        }
        if (res.respData.doubleRefundItems.length !== 0){
          res.respData.doubleRefundItems.map(i=>{
            i.map(item=>{
              doubleRefundItem.push(item)
            })
          })  
        }
        doubleRefundItem.map(i=>{
          i.astrict = true
        })
        
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
          show:false,
          fullItems: res.respData.fullItems,
          doubleRefundItem: JSON.parse(JSON.stringify(res.respData.doubleRefundItems)),
          doubleRefundItems: JSON.parse(JSON.stringify(doubleRefundItem)) ,
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
    let goodsList = this.data.fullItems.concat(this.data.items).concat(this.data.doubleRefundItems).filter(item => item.astrict)
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
    wx.navigateTo({
      url: '../collect/collect?data=' + JSON.stringify(data),
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  skipLogin() {
    wx.navigateTo({
      url: '/pages/register/register',
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (app.globalData.quit) {
      this.setData({
        quit: false
      })
    }
    if(app.globalData.branch.branchNo=="888888"){
      this.setData({
        doubleRefundItem:[],
        totalValue:0
      })
    }
    if (cache.get("memberStatus","null")){
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
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

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
    var that = this;
    // 设置转发内容
    var shareObj = {
      title: "我家小程序",
      path: '/pages/connectWifi/connectWifi', // 默认是当前页面，必须是以‘/’开头的完整路径
      imgUrl: '', //转发时显示的图片路径，支持网络和本地，不传则使用当前页默认截图。
      success: function(res) {　 // 转发成功之后的回调　　　　　
      },
    };
    return shareObj;
  },
})