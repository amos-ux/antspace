import axios from '../../utils/axios.js';
const app = getApp();
const cache = require("../../utils/cache.js");
Page({
  data: {
    order:[],
    cartQuantity: 0,
    hide_good_box: true,
    planNos:[],
    pageNum: 0,
    noshop:false,
    total:0
  },
  onLoad: function (options) {
    let that = this
    const {planNo} = options
    const planNos = planNo ? [planNo] : []
    that.setData({planNos})
    that.getDiscountList(planNos)
    that.busPos = {};
    that.busPos['x'] = 20; //购物车的位置
    that.busPos['y'] = app.globalData.hh - 60;
  },
  onShow: function () {
    this.quantity()
  },
  // 获取商品列表
  getDiscountList: function (planNos){
    let that = this
    let pageNum = Number(++that.data.pageNum)
    wx.showLoading({title: '加载中...'});
    axios.post({
      url:`${app.baseUrl}service-item/public/find/full/reduction/scrap/items`,
      data:{
        "pageNum": pageNum,
        "pageSize": 20,
        "searchParams":{
          "planNos":planNos,
          "branchNo":app.globalData.branch.branchNo
        }
      }
    }).then(res=>{
      wx.hideLoading()
      const {order:orders} = that.data
      const shopList = res.data.respData.data
      const total = res.data.respData.total == shopList.length ? res.data.respData.total : shopList.length
      let order = [...orders,...shopList]
      if(shopList.length == 0 && orders.length != 0){//新页面没有数据
        --pageNum
        that.showToast('没有更多了(˶˚  ᗨ ˚˶)')
      }
      that.setData({
        order,pageNum,total,
        noshop: order.length == 0 ? true : false
      })
    },()=>{
      wx.hideLoading()
    })
  },
  // 获取购物车数据
  quantity:function(){
    let that = this
    axios.getData({
      isToast:true,
      url:`${app.baseUrl}service-item/trolley/queryTrolleyCount?branchNo=${app.globalData.branch.branchNo}&sessionId=${cache.get("sessionId", this)}`
    }).then(res=>{
      that.setData({
        cartQuantity: res.data.respData
      })
    },()=>{
      wx.hideLoading()
    })
  },
  // 跳转购物车
  skipSearch:function(){
    wx.navigateTo({
      url: '../commonCart/commonCart',
    })
  },
  // 跳转详情页
  details: function (e) {
    let details = e.currentTarget.dataset.item
    details.remarksName = details.remarksName.replace("'", '').replace("&", "").replace("=", "*");
    details.itemName = details.itemName.replace("'", '').replace("&", "").replace("=", "*");
    wx.navigateTo({
      url: "/pages/goodsDetails/goodsDetails?details=" + JSON.stringify(details),
    })
  },
  //加入购物车
  touchOnGoods: function (e) {
    let that = this
    axios.postData({
      url:`${app.baseUrl}service-item/trolley/addItemToTrolley`,
      data:{
        "sessionId": cache.get("sessionId", null),
        "itemNo": e.currentTarget.dataset.item.itemNo,
        "quantity": "1",
        "branchNo": app.globalData.branch.branchNo,
        "blId": e.currentTarget.dataset.item.blId,
        "isCombined": e.currentTarget.dataset.item.isCombined,
        "combSubItems": e.currentTarget.dataset.item.combSubItems
      }
    }).then(()=>{
      if (!that.data.hide_good_box) return;
      that.finger = {};
      let topPoint = {},{cartQuantity} = that.data
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
    },rest=>{
      const desc = rest.data.respDesc ? rest.data.respDesc : '加入购物车失败'
      that.showToast(desc)
    })
  },
  // 加入购物车动画
  startAnimation: function () {
    let index = 0,that = this,bezier_points = that.linePos['bezier_points'],len = bezier_points.length - 1
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
  // 页面相关事件处理函数--监听用户下拉动作
  onReachBottom: function () {
    let that = this
    const {total,noshop,planNos} = that.data
    if(!noshop){
      if(0 < total && total < 20){//只有一页数据
        that.showToast('没有更多了(˶˚  ᗨ ˚˶)')
      }else{
        that.getDiscountList(planNos)
      }
    }
  },
  showToast:function(tips,icon){
    let icons = icon || 'none'
    wx.showToast({ title: tips,icon: icons,duration: 1500 })
  }
})