// component/specification/specification.js
var call = require("../../utils/call.js");
var cache = require("../../utils/cache.js");
let app = new getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    specification:null,
    options:null,
    cartQuantity:null
  },
  lifetimes: {
    attached() {
      this.busPos = {};
      this.busPos['x'] = 15;//购物车的位置
      this.busPos['y'] = app.globalData.hh - 100;
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    options:[],
    hide_good_box: true,

  },
  ready() {
    let items = []
   this.properties.options.forEach((i,sign) => {
     i.i=false
     i.options.forEach((item,index) => {
      items.push({
        j:item,
        s:false
      })
      i.options = items;
      })
     items = [];
    })
    console.log(this.properties.options)
    this.setData({
      options: this.properties.options
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    click(e){
      let options = this.properties.options
      let item = e.currentTarget.dataset.item
      console.log(item)
      let index = e.currentTarget.dataset.index
      let a = e.currentTarget.dataset.a
        options[a].options.forEach(item=>{
          item.s=false
        })
      options[a].i=true
      options[a].options[index].s=true
      console.log(options)
      this.setData({
        options:options
      })
    },
    close(){
        this.triggerEvent("hide",false)
    },
    shoppingCart(e){
      console.log(e)
        let options = this.properties.options
        let extOptions = []
          options.map(i=>{
            i.options.map(e=>{
              if(e.s){
                extOptions.push(e.j)
              }
            })
          })
      let data = {
        "sessionId": cache.get("sessionId", null),
        "itemNo": e.currentTarget.dataset.item.itemNo,
        "quantity": "1",
        "extOptions": extOptions,
        "branchNo": app.globalData.branch.branchNo,
        "blId": e.currentTarget.dataset.item.blId,
        "isCombined": e.currentTarget.dataset.item.isCombined,
        "combSubItems": e.currentTarget.dataset.item.combSubItems
      }
      call.postData("/service-item/trolley/addItemToTrolley", data, (res) => {
        console.log(res)
        var myEventDetail = this.properties.cartQuantity + 1
        this.triggerEvent('myevent', myEventDetail)

      }, (rest) => {
        wx.showToast({
          icon: "none",
          title: rest.respDesc,
        })
      })
      // console.log(extOptions)
      // this.triggerEvent('myevent', extOptions)
      this.triggerEvent("hide", false)

    }
  }
})
