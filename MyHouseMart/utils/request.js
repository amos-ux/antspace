let _http = {

  get(options) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: options.url || 'url',
        data: options.data || 'data',
        method: options.method || 'GET',
        dataType: options.dataType || 'json', //如果设为json，会尝试对返回的数据做一次 JSON.parse
        header: options.header || {
          "content-type": "application/json"
        },
        success: (res) => {
          resolve(this.handleSuccess(res))
        },
        fail: (err) => {
          reject(this.handleError(err));
        }
      }); 
    })
  },

  post(options) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: options.url || 'url',
        data: options.data || 'data', //请求的参数",
        method: options.method || 'POST',
        dataType: options.dataType || 'json', //如果设为json，会尝试对返回的数据做一次 JSON.parse
        header: options.header || {
          "content-type": "application/json"
        },
        success: res => {
          resolve(this.handleSuccess(res))
        },
        fail: (err) => {
          reject(this.handleError(err));
        }
      });
    })
  },

  /**
   * 处理请求成功
   * @param res
   * @returns {{data: (string|null|((node:any)=>any)
   */
  handleSuccess: function(res, _this = null) {
    if (res.data.respCode === '0000' || res.data.respCode == "00") {
      return {
        data: res.data.respData || {}
      };
    } else {
      // this.errorModal({
      //   title: "网络繁忙",
      //   content: "服务器遇到问题了，工程师正在全力抢救中"
      // })
      return {};
    }
  },

  /**
   * 处理请求错误
   * @param error
   * @returns {void}
   */
  handleError: function(error) {
    let msg = "请求失败";
    if (error.status == 400) {
      console.log('请求参数正确');
    }
    if (error.status == 404) {
      console.error('请检查路径是否正确');
    }
    if (error.status == 500) {
      this.errorModal({
        title: "网络错误",
        content: "服务器出问题了,等一下吧"
      })
    }
    if (error.status == 504) {
      this.errorModal({
        title: "网络错误",
        content: "服务器出问题了,等一下吧"
      })
    }
  },

  /**
   * 错误弹窗
   */
  errorModal: function(options) {
    wx.showModal({
      title: options.title,
      content: options.content,
      showCancel: false, //是否显示取消按钮
      confirmText: "确定", //默认是“取消”
      success: function(res) {
        if (!res.cancel) {
          if (getCurrentPages().length != 1) {
            wx.navigateBack()
          }
        }
      }
    })
  }
}
export default _http;