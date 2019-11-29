let axios = {
  get(options) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: options.url || 'url',
        data: options.data || 'data',
        method: options.method || 'GET',
        dataType: options.dataType || 'json',
        header: options.header || { "content-type": "application/json" },
        success: res => {
          if(res.data.respCode == '0000' || res.data.code == "00"){
            resolve(res)
          }else{
            wx.showModal({
              title: '服务器出错',
              content: '开发工程师正在努力抢修中',
              showCancel: false,
              confirmText: "确定",
              success: function (res) {
                if (!res.cancel) {
                  if (getCurrentPages().length != 1) {
                    wx.navigateBack()
                  }
                }
              }
            })
            reject(res)
          }
        },
        fail: (err) => {
          wx.showModal({
            title: '网络错误',
            content: '网络开小差了哦，请选择您的操作',
            showCancel: false,
            confirmText: "确定",
            success: function (res) {
              if (!res.cancel) {
                if (getCurrentPages().length != 1) {
                  wx.navigateBack()
                }
              }
            }
          })
          reject(err)
        },
        complete: () => {}
      });
    })
  },
  post(options) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: options.url || 'url',
        data: options.data || 'data',
        method: options.method || 'POST',
        dataType: options.dataType || 'json',
        header: options.header || { "content-type": "application/json" },
        success: res => {
          if(res.data.respCode=='0000' || res.data.code == "00"){
            resolve(res)
          }else{
            wx.showModal({
              title: '服务器出错',
              content: '开发工程师正在努力抢修中',
              showCancel: false,
              confirmText: "确定",
              success: function (res) {
                if (!res.cancel) {
                  if (getCurrentPages().length != 1) {
                    wx.navigateBack()
                  }
                }
              }
            })
            reject(res)
          }
        },
        fail: (err) => {
          wx.showModal({
            title: '网络错误',
            content: '网络开小差了哦，请选择您的操作',
            showCancel: false,
            confirmText: "确定",
            success: function (res) {
              if (!res.cancel) {
                if (getCurrentPages().length != 1) {
                  wx.navigateBack()
                }
              }
            }
          })
          reject(err)
        },
        complete: () => {}
      });
    })
  },
  getData(options){
    return new Promise((resolve, reject) => {
      wx.request({
        url: options.url || 'url',
        data: options.data || 'data',
        method: options.method || 'GET',
        dataType: options.dataType || 'json',
        header: options.header || { "content-type": "application/json" },
        success: res => {
          if(res.data.respCode == '0000' || res.data.code == "00"){
            resolve(res)
          }else{
            reject(res)
            if(options.isToast ? options.isToast : false){
              wx.showToast({
                icon: 'none',
                title: '服务器出问题了，开发工程师正在努力抢修中...'
              })
            }
          }
        },
        fail: (err) => {
          reject(err)
          if(options.isToast ? options.isToast : false){
            wx.showToast({
              icon: 'none',
              title: '网络开小差了,请稍后重试',
            })
          }
        },
        complete: () => {}
      });
    })
  },
  postData(options){
    return new Promise((resolve, reject) => {
      wx.request({
        url: options.url || 'url',
        data: options.data || 'data',
        method: options.method || 'POST',
        dataType: options.dataType || 'json',
        header: options.header || { "content-type": "application/json" },
        success: res => {
          if(res.data.respCode=='0000' || res.data.code == "00"){
            resolve(res)
          }else{
            reject(res)
            if(options.isToast ? options.isToast : false){
              wx.showToast({
                icon: 'none',
                title: '服务器出问题了，开发工程师正在努力抢修中...'
              })
            }
          }
        },
        fail: (err) => {
          reject(err)
          if(options.isToast ? options.isToast : false){
            wx.showToast({
              icon: 'none',
              title: '网络开小差了,请稍后重试',
            })
          }
        },
        complete: () => {}
      });
    })
  }
}
export default axios;