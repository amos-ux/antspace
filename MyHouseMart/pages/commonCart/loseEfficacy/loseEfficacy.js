// pages/shoppingTrolly/loseEfficacy/loseEfficacy.js
var app = getApp();
var cache = require("../../../utils/cache.js");
var call = require("../../../utils/call.js")
var confirm = require("../../../utils/confirm.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    outmodedItems:null
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false,
    outmodedItems:[]
  },
  ready() {
    this.setData({
      outmodedItems: this.properties.outmodedItems
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
 
    empty(){
      let that = this
      wx.showModal({
        content: '你确认清空全部失效商品吗',
        success(res){
          if(res.confirm){
            let data = []
            let outmodedItems = that.properties.outmodedItems
            outmodedItems.map(i => {
              data.push({
                "itemNO": i.itemNo, "bizLine": i.bizLine
              })
            })
            console.log(data)
            call.postData("/service-item//trolley/deleteTrolley?sessionId=" + cache.get("sessionId", null) + "&branchNo=" + app.globalData.branch.branchNo, data, (res) => {
                  that.setData({
                    outmodedItems:[]
                  })
                  
            })
           
          }else if(res.cancel){

          }
        }
      })
        
    },
    open() {
      this.setData({
        show: !this.data.show
      })
    },
  }
})
