// pages/index/shade/shade.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    clickSwiper:{
      type: Boolean,
      value: true
    },
    branchName: String,
    range: Number,
    planName:Array,
    planNamec: Array,
    planNamef: Array,
    planNamen:Array,
    planNames: Array,
    coupon: Boolean,
    pickupFrom: Boolean,
    deliveryFrom: Boolean,
    branchNo:null

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表 
   */
  methods: {
    
    close(){
      console.log(this.properties.clickSwiper)
      console.log(this.properties.planNamec)

        this.setData({
          clickSwiper:false
        })
    },
    preventTouchMove(){}
  }
})
