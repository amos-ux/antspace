import axios from '../../utils/axios.js';
const app = getApp();
const cache = require("../../utils/cache.js");
Page({
  data: {
    current: 0,
    status: null,
    shopDesc: [],
    commodity: {},
    picDetailDTO: {},
    openWindow: false,//打开背景弹窗
    cartQuantity: 0,//购物车数量
    branchNo: null,//店铺号
    itemNo: null,
    blId: null,
  },
  onLoad: function (options) {
    console.log(options);
    console.log(cache.get("branchNo", "null"))
    const branchNo = options.branchNo ? options.branchNo : cache.get("branchNo", "null")
    const itemNo = options.itemNo ? options.itemNo : cache.get("itemNo", "null")
    const blId = options.blId ? options.blId : cache.get("blId", "null")
    this.setData({ branchNo, itemNo, blId })
  },

  onShow: function () {
    let that = this
    const options = { branchNo: that.data.branchNo, itemNo: that.data.itemNo, blId: that.data.blId }
    that.getGoodMess(options)//获取商品信息
    that.getCarNum(that.data.branchNo)//获取购物车数据
  },

  bindchange: function (e) {
    this.setData({
      current: e.detail.current + 1
    })
  },
  toIndex: function () {
    if (cache.get("sessionId", "null") != "null") { //登录
      wx.navigateTo({
        url: '/pages/connectWifi/connectWifi'
      })
    } else {//跳转注册页面
      wx.navigateTo({
        url: '/pages/register/register',
      })
    }
  },
  //加入购物车
  shopping: function (e) {
    let that = this
    if (cache.get("sessionId", "null") != "null") {
      let item = e.target.dataset.item
      if (item.stockQty != 0) {
        axios.postData({
          url: `${app.baseUrl}service-item/trolley/addItemToTrolley`,
          data: {
            "sessionId": cache.get("sessionId", "null"),
            "itemNo": that.data.commodity.itemNo,
            "branchNo": that.data.branchNo,
            "quantity": "1",
            "blId": that.data.commodity.blId,
            "isCombined": that.data.commodity.isCombined,
            "combSubItems": that.data.commodity.combSubItems
          }
        }).then(res => {
          wx.showToast({
            icon: "none",
            title: '加入购物车成功'
          })
          that.setData({
            cartQuantity: that.data.cartQuantity + 1
          })
        }, rest => {
          wx.showToast({
            icon: "none",
            title: rest.data.respDesc,
          })
        })
      }
    } else {
      wx.navigateTo({
        url: '/pages/register/register',
      })
    }
  },
  // 获取商品信息
  getGoodMess: function (options) {
    let that = this
    const { branchNo, itemNo, blId } = that.data
    const general = axios.postData({
      url: `${app.baseUrl}service-item/public/search/by/name`,
      data: {
        "pageNum": 1,
        "pageSize": 20,
        "searchParams": {
          "branchNo": branchNo,
          "itemNo": itemNo,
          "blId": blId,
          "userId": 0, // 用户编号
        }
      }
    })//获取商品信息
    const message = axios.getData({
      url: `${app.baseUrl}service-item/user/get/item/detail/by/BranchNoAnditemNo/${branchNo}/${itemNo}`
    })// 获取商品详情
    Promise.all([general, message]).then(res => {
      // console.log(res);
      let commodity = res[0].data.respData ? res[0].data.respData[0] : ''
      if (commodity.stTimes.length != 0) {
        const { stTimes } = commodity
        let foodstr = stTimes.map(item => {
          return item.stName + '供应：' + item.activityTimeFrom.slice(0, 5) + '-' + item.activityTimeTo.slice(0, 5)
        })
        commodity.foodstr = foodstr.join('、')
      }
      const shopDesc = res[1].data.respData ? res[1].data.respData.picDetailDTO ? res[1].data.respData.picDetailDTO.bigPic : '' : ''
      const picDetailDTO = res[1].data.respData ? res[1].data.respData.picDetailDTO ? res[1].data.respData.picDetailDTO : {} : {}
      that.setData({ commodity, shopDesc, picDetailDTO, current: 1 })
    })
  },
  // 开启弹窗 / 关闭弹窗
  openWindow: function (e) {
    const { status } = e.currentTarget.dataset, openWindow = !this.data.openWindow
    this.setData({ status, openWindow })
  },
  // 阻止事件向下传递
  preventTouchMove: function () { },  
  getCarNum: function (branchNo) {
    let that = this
    if (cache.get("sessionId", "null") != "null") {
      axios.getData({
        url: `${app.baseUrl}service-item/trolley/queryTrolleyCount?branchNo=${branchNo}&sessionId=${cache.get("sessionId", "null")}`
      }).then(rest => {
        const cartQuantity = rest.data.respData ? rest.data.respData : 0
        that.setData({ cartQuantity })
      })
    }
  }
})