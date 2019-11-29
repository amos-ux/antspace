// component/redPacket/redPacket.js
let app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    userAuthorization:null
  },

  /**
   * 组件的初始数据
   */
  data: {
    animationData: 'openBtn 1.2s linear infinite',//领红包动效
  },

  /**
   * 组件的方法列表
   */
  methods: {
    skipButton() {
      console.log(app)
     wx.navigateTo({
       url: '/pages/ticketCenter/ticketCenter',
     })
      
      this.triggerEvent('myevent', false)
    },
    close() {
      this.triggerEvent('event', false)
    }
  }
})
