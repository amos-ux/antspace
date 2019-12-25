// pages/index/temponent2/temponentsecond.js
var call = require("../../../utils/call.js");
var cache = require("../../../utils/cache.js");
let app=new getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    twoList:null,
    blPic: String,
    cartQuantity:Number,
    userAuthorization:Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    hide_good_box: true,
    specification: [],
    option: false,
    options: [],
    extOptions: [],
  },
  lifetimes:{
    attached(){
      this.busPos = {};
      this.busPos['x'] = 15;//购物车的位置
      this.busPos['y'] = app.globalData.hh - 100;
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toggleToast(e) {
      this.triggerEvent('myevent', e.detail)
    },
    hide(e) {
      this.setData({
        option: e.detail
      })
    },
    touchOnGoods: function (e) {
      console.log(e)
      if (this.properties.userAuthorization) {
        let specification = e.currentTarget.dataset.item
        let option = e.currentTarget.dataset.item.extOptions
        if (option == null || option.length==0) {
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
            var myEventDetail = this.properties.cartQuantity + 1
            this.triggerEvent('myevent', myEventDetail)
            // 如果good_box正在运动
            if (!this.data.hide_good_box) return;
            this.finger = {};
            var topPoint = {};
            this.finger['x'] = e.touches["0"].clientX;
            this.finger['y'] = e.touches["0"].clientY;
            if (this.finger['y'] < this.busPos['y']) {
              topPoint['y'] = this.finger['y'] - 150;
            } else {
              topPoint['y'] = this.busPos['y'] - 150;
            }
            topPoint['x'] = Math.abs(this.finger['x'] - this.busPos['x']) / 2;
            if (this.finger['x'] > this.busPos['x']) {
              topPoint['x'] = (this.finger['x'] - this.busPos['x']) / 2 + this.busPos['x'];
            } else {
              topPoint['x'] = (this.busPos['x'] - this.finger['x']) / 2 + this.finger['x'];
            }
            this.linePos = app.bezier([this.finger, topPoint, this.busPos], 20);
            this.startAnimation();
          }, (rest) => {
            wx.showToast({
              icon: "none",
              title: rest.respDesc,
            })
          })
        } else { //有规格
          this.setData({
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
    },
    //跳转商品详情
    details(e) {
      let details = e.currentTarget.dataset.item
      console.log(e.currentTarget.dataset.item)
      details.remarksName = details.remarksName.replace("'", "").replace("&", "").replace("=", "");
      details.itemName = details.itemName.replace("'", "").replace("&", "").replace("=", "");
      console.log(JSON.parse(JSON.stringify(details)))
      wx.navigateTo({
        url: "/pages/goodsDetails/goodsDetails?details=" + JSON.stringify(details),
      })
    },
    startAnimation: function () {
      var index = 0,
        that = this,
        bezier_points = that.linePos['bezier_points'],
        len = bezier_points.length - 1;
      this.setData({
        hide_good_box: false,
        bus_x: that.finger['x'],
        bus_y: that.finger['y']
      })
      this.timer = setInterval(function () {
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
  },
})
