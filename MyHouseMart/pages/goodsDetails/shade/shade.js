Component({
  /**
   * 组件的属性列表
   */
  properties: {
show:null
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
    },
    // 阻止事件向下传递
    preventTouchMove() { },
  }
})
