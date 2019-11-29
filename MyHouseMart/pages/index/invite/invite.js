// pages/index/invite/invite.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show:null,
    listValue:null
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
      this.setData({
        show:false
      })
    }
  }
})
