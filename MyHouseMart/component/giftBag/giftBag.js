// component/giftBag/giftBag.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

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
    openGift(){
      
      wx.navigateTo({
        url: '/my_member/inviteFriends/inviteFriends',
      })
     this.triggerEvent('myevent', false)
    },
    close(){
      this.triggerEvent('event', false)
    }
  }
})
