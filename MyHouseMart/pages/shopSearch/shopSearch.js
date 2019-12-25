import axios from '../../utils/axios.js';
const app = getApp();
const urlItem = app.baseUrl + "service-item/";
const cache = require("../../utils/cache.js");
let price = 0, refund = 0
Page({
  data: {
    wxSearchData: '', // 输入的值
    historyList: [], //搜索历史
    isShowList: false, //是否展示搜索结果列表
    order: [], //搜索结果列表
    isHasShop: false, //无搜索结果图标
    isShow: false, //展示搜索结果
    blId: 0, //业务线Id
    hide_good_box: true,
    bizLine: 'NORMAL', //预售
    isMember: false,
    Price: '', //单价
    TotalPrice: '',
    number: 1,
    refundValue: '',
    isVip: false,
    quantityLimitTotal: 0, //预售数量上限
    limitedByUser: 0, //预售个人限购数
    stockQty: 0, //库存量
    cartQuantity: 0, //购物车数据
    pageNum: 1, //分页数
    specification: [],
    option: false,
    options: [],
    extOptions: [],
    userAuthorization: false,//是否已经登录
  },

  //跳转商品详情
  details: function (e) {
    let details = e.currentTarget.dataset.item
    details.remarksName = details.remarksName.replace("'", '').replace("&", "").replace("=", "*");
    details.itemName = details.itemName.replace("'", '').replace("&", "").replace("=", "*");
    wx.navigateTo({
      url: "/pages/goodsDetails/goodsDetails?details=" + JSON.stringify(details),
    })
  },
  //跳转购物车
  skipSearch: function () {
    wx.navigateTo({
      url: '../commonCart/commonCart',
    })
  },
  //会员弹窗
  close: function () {
    let that = this
    that.setData({
      isMember: false,
      TotalPrice: '',
      refundValue: '',
      quantityLimitTotal: ''
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
  touchOnGoods: function (e) {
    let that = this
    wx.getSetting({
      success(res) {
        if (res.authSetting["scope.userInfo"]) {
          let item = e.target.dataset.item
          let option = item.extOptions
          let specification = item
          if (item.extOptions == null || item.extOptions.length == 0) {
            axios.postData({
              url: `${urlItem}trolley/addItemToTrolley`,
              data: {
                "sessionId": cache.get("sessionId", null),
                "itemNo": e.currentTarget.dataset.item.itemNo,
                "quantity": "1",
                "branchNo": app.globalData.branch.branchNo,
                "blId": e.currentTarget.dataset.item.blId,
                "isCombined": e.currentTarget.dataset.item.isCombined,
                "combSubItems": e.currentTarget.dataset.item.combSubItems
              }
            }).then(() => {
              if (!that.data.hide_good_box) return;
              that.finger = {};
              let topPoint = {},
                {
                  cartQuantity
                } = that.data
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
              that.setData({
                cartQuantity: cartQuantity + 1
              })
            }, rest => {
              const desc = rest.data.respDesc ? rest.data.respDesc : '加入购物车失败'
              that.showToast(desc)
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
  // 加入购物车动画
  startAnimation: function () {
    let index = 0, that = this, bezier_points = that.linePos['bezier_points'], len = bezier_points.length - 1;
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
  //购物车数量
  quantity: function () {
    let that = this
    axios.getData({
      url: `${urlItem}trolley/queryTrolleyCount?branchNo=${app.globalData.branch.branchNo}&sessionId=${cache.get("sessionId", this)}`
    }).then(res => {
      that.setData({
        cartQuantity: res.data.respData
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    console.log("options", options);
    // 如果是预售商品 展示预售商品的搜索结果
    // console.log("options.bizLine =='PRESALE'", options.bizLine == 'PRESALE');
    that.setData({
      blId: options.blId,
      bizLine: options.bizLine == undefined ? 'NORMAL' : options.bizLine
    })
    that.busPos = {};
    that.busPos['x'] = 20; //购物车的位置
    that.busPos['y'] = app.globalData.hh - 60;
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this
    wx.getSetting({
      success(res) {
        const userAuthorization = res.authSetting["scope.userInfo"] ? true : false
        that.setData({ userAuthorization })
        if (userAuthorization) {
          that.getHistory(); //获取搜索历史
          that.quantity() //获取购物车数量
        }
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this
    that.getMoreMess()
  },

  /**
   * 输入搜索关键字
   */
  wxSearchInput: function (value) {
    let that = this;
    let len = value.detail.value.length;
    const { pageNum } = that.data
    that.setData({
      wxSearchData: value.detail.value,
      pageNum: len >= 2 ? pageNum : 1
    })
    if (len >= 1) { //输入两个搜索文字
      that.toSearch(); //获取商品列表数据
    } else {
      that.getHistory(); //重新获取搜索记录
      that.emptyMess(); //置空数据
    }
  },

  /**
   * 监听软键盘确认键
   * 点击搜索商品
   */
  wxSearchConfirm: function () {
    let that = this;
    if (that.data.wxSearchData == '' || that.data.wxSearchData == null) {
      // 取消 返回上一页
      wx.navigateBack()
      that.setData({
        pageNum: 1
      })
    } else {
      wx.showLoading({ title: '加载中...' })
      if (that.data.wxSearchData.length >= 1 && that.data.order.length != 0) { // 有搜索结果
        wx.hideLoading();
        that.setData({
          isShow: true, //展示所有搜索商品
          isShowList: false, //隐藏列表页
        })
      } else { //没有搜索结果
        wx.hideLoading();
        that.setData({
          pageNum: 1,
          isShow: false, //隐藏所有搜索商品
          isShowList: false, //隐藏列表页
        })
      }
    }
  },

  // 置空数据
  emptyMess: function () {
    let that = this
    that.setData({
      order: [],
      isShowList: false,
      isShow: false,
      pageNum: 1
    })
  },

  // 点击跳转到具体详情页
  confirmView: function (e) {
    let details = e.currentTarget.dataset.item
    details.remarksName = details.remarksName.replace("'", '').replace("&", "").replace("=", "");
    details.itemName = details.itemName.replace("'", '').replace("&", "").replace("=", "");
    wx.navigateTo({
      url: "/pages/goodsDetails/goodsDetails?details=" + JSON.stringify(details),
    })
  },

  // 清空搜索记录
  empty: function () {
    let that = this
    that.getHistory(); //重新获取搜索记录
    that.setData({
      order: [], //清空商品
      isShow: false, //不展示搜索结果
      pageNum: 1,
      isHasShop: false, //不展示商品
      isShowList: false, //不展示结果列表
      wxSearchData: '',
    })
  },
  // 获取搜索记录列表
  getHistory: function () {
    let that = this
    const { userAuthorization } = that.data
    if (userAuthorization) {
      axios.getData({
        url: `${urlItem}user/item/history/${cache.get("userId", null)}`
      }).then(res => {
        if (res.data.respData.length > 0) {
          let historyList = app.trimSpace(app.unique(res.data.respData));
          that.setData({
            historyList: historyList.length > 0 ? historyList : []
          })
        }
      })
    }
  },
  // 清除搜索记录
  delHistory: function () {
    let that = this
    axios.getData({
      url: `${urlItem}user/item/history/clean/${cache.get("userId", null)}`
    }).then(res => {
      that.showToast('清除成功')
      that.setData({
        historyList: [],
        pageNum: 1
      })
    }, () => {
      that.showToast('清除失败')
    })
  },
  // 点击搜索历史记录直接跳转详情
  toResult: app.debounce1(function (e) {
    let that = this
    const wxSearchData = e.currentTarget.dataset.index
    that.setData({ wxSearchData })
    that.toSearch()
  }, 1000),
  // 获取商品列表
  toSearch: function () {
    let that = this
    const { bizLine, wxSearchData } = that.data
    const options = that.getOptions(bizLine, 1)
    wx.showLoading({ title: '加载中' })
    axios.post(options).then(res => {
      wx.hideLoading()
      let order = res.data.respData
      if (order.length == 0) { //没有搜索结果
        that.setData({
          pageNum: 1,
          order: [], //清空搜索结果列表
          isShowList: false, //隐藏搜索结果列表
          isShow: false,
          isHasShop: true, //无搜索结果 显示无搜索结果图标
        })
      } else { //有搜索结果
        let newOrder = order.filter(item => item.stockQty >= 0 && item.itemStatus != 'FORSALE')
        that.setData({
          order: newOrder.length == 0 ? [] : newOrder, //搜索结果列表
          isShowList: newOrder.length == 0 ? false : wxSearchData.length == 1 ? false : true, //展示搜索结果列表
          isShow: wxSearchData.length == 1 ? true : false,
          isHasShop: newOrder.length == 0 ? true : false, //显示无搜索结果图标
        })
      }
    })
    app.globalData.search = false
  },
  getOptions: function (bizLine, pageNum) {
    let that = this
    const { userAuthorization } = that.data
    const toOptions = { //非首页搜索
      url: `${urlItem}public/search/by/name`,
      data: {
        "pageNum": pageNum,
        "pageSize": 20,
        "searchParams": {
          "itemName": that.data.wxSearchData,
          "userId": userAuthorization ? cache.get("userId", "null") : 0,
          "branchNo": app.globalData.branch.branchNo,
          "blId": that.data.blId
        }
      }
    }
    const inOptions = { //首页搜索
      url: `${urlItem}public/user/applet/homepage/search`,
      data: {
        "pageNum": pageNum,
        "pageSize": 20,
        "searchParams": {
          "branchNo": app.globalData.branch.branchNo,
          "itemName": that.data.wxSearchData,
          "userId": userAuthorization ? cache.get("userId", "null") : 0
        }
      }
    }
    return bizLine == 'isIndex' ? inOptions : toOptions
  },
  // 下滑获取更多数据
  getMoreMess: function () {
    let that = this
    let { bizLine, pageNum, wxSearchData, isShowList, isHasShop } = that.data
    if (wxSearchData.length < 1 || isShowList || isHasShop) {
      return false
    }
    pageNum = Number(++pageNum)
    const options = that.getOptions(bizLine, pageNum)
    wx.showLoading({ title: '加载中' })
    axios.post(options).then(res => {
      wx.hideLoading()
      let { order } = that.data //之前保存的商品数据
      let neworder = res.data.respData.filter(item => item.stockQty >= 0 && item.itemStatus != 'FORSALE')
      if (neworder.length > 0) { //有搜索结果
        order.push(...neworder)
        that.setData({ order, pageNum })
      } else { //没有搜索结果
        --pageNum
        that.setData({
          pageNum
        })
        that.showToast('没有更多了(˶˚  ᗨ ˚˶)')
      }
    })
    app.globalData.search = false
  },
  Snatch: function (e) { // 预售 马上抢
    let item = e.currentTarget.dataset.item, that = this
    price = item.activitySalePrice == null ? item.salePrice : item.activitySalePrice
    refund = item.refundValue == null ? 0 : item.refundValue
    that.setData({
      item,
      number: 1,
      isMember: true,
      stockQty: item.stockQty, //库存量
      TotalPrice: item.activitySalePrice == null ? item.salePrice : item.activitySalePrice,
      refundValue: item.refundValue == null ? 0 : item.refundValue,
      quantityLimitTotal: item.quantityLimitTotal,
      limitedByUser: item.limitedByUser
    })
  },
  plus: function () { //商品数量增加
    let that = this, { number, limitedByUser, stockQty } = that.data
    if (limitedByUser == null) { //限购数等于空 没有上限  根据库存判定
      if (number < stockQty) { //判定库存
        that.setData({
          number: number + 1,
          TotalPrice: (number + 1) * price,
          refundValue: (number + 1) * refund
        })
      } else {
        that.showToast('单品已经达到上限')
      }
    } else {
      if (limitedByUser > stockQty) { //如果预售上限不为空，判定预售上限是否小于库存  T：判定购买数量是否小于预售上线  F:用库存去决定购买上限
        if (number < stockQty) {
          that.setData({
            number: number + 1,
            TotalPrice: (number + 1) * price,
            refundValue: (number + 1) * refund
          })
        } else {
          that.showToast('单品已经达到上限')
        }
      } else {
        if (number < limitedByUser) {
          that.setData({
            number: number + 1,
            TotalPrice: (number + 1) * price,
            refundValue: (number + 1) * refund
          })
        } else {
          that.showToast('单品已经达到上限')
        }
      }
    }
  },
  reduce: function () { //商品减少
    let that = this, { number } = that.data
    if (number > 1) {
      that.setData({
        number: number - 1,
        TotalPrice: (number - 1) * price,
        refundValue: (number - 1) * refund
      })
    }
  },
  toVip: function (e) { //预售 跳转VIP
    let that = this, isStatus = e.currentTarget.dataset.isstatus
    let { item, number } = that.data, json = []
    json.push(item)
    const originaPrice = item.salePrice * that.data.number;
    const totalPrice = item.activitySalePrice == null ? item.salePrice * that.data.number : item.activitySalePrice * number;
    json[0].quantity = number;
    json[0].bizLine = that.data.bizLine;
    json[0].thumbPic = that.data.item.picAddr;
    json[0].comb = false;
    json[0].blId = that.data.blId;
    json[0].vipPrice = item.salePrice; //会员价
    app.globalData.order = json;
    wx.navigateTo({
      url: `/pages/confirmOrder/confirmOrder?commoditStatus=Presale&isStatus=${isStatus}&originaPrice=${originaPrice}&totalPrice=${totalPrice}`
    })
  },
  showToast: function (tips, icon) {
    let icons = icon || 'none'
    wx.showToast({
      title: tips,
      icon: icons,
      duration: 1500
    })
  }
})