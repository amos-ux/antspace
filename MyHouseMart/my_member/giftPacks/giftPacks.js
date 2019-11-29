const app = getApp()
const cache = require("../../utils/cache.js");
import axios from '../../utils/axios.js';
Page({
  data: {
    giftPackage: [],//超值大礼包
    userInfo: {}
  },
  // 会员权益
  openVip: function () {
    wx.navigateTo({
      url: '/my_member/openVip/openVip?status=vipInterests'
    })
  },
  // 邀请好友
  toInvite:function(){
    wx.navigateTo({
      url: '/my_member/inviteFriends/inviteFriends'
    })
  },
  gift: function () {
    let that = this
    axios.get({
      url: `${app.baseUrl}service-item/user/include/member/combination/${app.globalData.branch.branchNo}/${cache.get("userId", null)}`
    }).then(res => {
      if (res.data.respData) {
        let giftPackage = (res.data.respData.itemPromotions)
        const userInfo = wx.getStorageSync("userInfo")
        giftPackage.map(item => {
          item.picAddr = item.picAddr ? item.picAddr : 'https://antspace-prod-img-1.oss-cn-shenzhen.aliyuncs.com/16b5af2afaa.png'//图片
          item.thumbPic = item.picAddr ? item.picAddr : 'https://antspace-prod-img-1.oss-cn-shenzhen.aliyuncs.com/16b5af2afaa.png'//图片
          item.isCombined = 'Y'//是否套餐
          item.combSubItems[0].blId = item.combSubItems[0].blId ? item.combSubItems[0].blId : 0
          item.comb = false
          let { combSubItems } = item, disPrice = 0
          combSubItems.map(data => {
            data.bizLine = data.bizLine ? data.bizLine : 0
            data.isCombined = 'Y'
            data.returnMoney = true
            disPrice += data.quantity * data.salePrice
          })
          item.disPrice = item.salePrice
          item.salePrice = disPrice
        })
        that.setData({ giftPackage, userInfo })
      }
    })
  },
  toJoinMenber: function () {
    wx.navigateTo({
      url: '/my_member/JoinMember/JoinMember'
    })
  },
  onLoad: function (options) { },
  onShow: function () {
    this.gift()
  },
  freeBuy: function (e) {
    const { iscanbuy, item: items, status } = e.currentTarget.dataset
    if (iscanbuy) {
      const { salePrice: originaPrice, disPrice: totalPrice } = items
      let { combSubItems, orderItemType } = items, order = [], itemQty = 0
      combSubItems.map(item => {
        item.orderItemType = orderItemType
        itemQty += item.quantity
      })
      items.isCombined = 'Y'
      items.itemQty = itemQty
      items.quantity = 1
      items.blId = items.blId ? items.blId : 0
      items.returnMoney = status == 'firstFree' ? true : false
      items.refundValue = status == 'firstFree' ? items.disPrice : items.refundValue * 1
      order.push(items)
      app.globalData.order = order
      wx.navigateTo({
        url: `/pages/confirmOrder/confirmOrder?commoditStatus=myPage&originaPrice=${originaPrice}&totalPrice=${totalPrice}&status=${status}`
      })
    }
  },
  toActivity: function (e) {
    wx.navigateTo({
      url: `/my_member/eventDesc/eventDesc?status=${e.currentTarget.dataset.status}`
    })
  }
})