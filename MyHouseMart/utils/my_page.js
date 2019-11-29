import {
  webUrl
} from "./util"

/**
 * 
 * @param {String} url 
 * @return {Boolean} Boolean
 */
function checkUrl(url) {
  if (typeof url != 'string') {
    throw new Error(`${url}类型错误或者URL为空`)
  }
  return true
}
/**
 * 
 * @param {Boolean} loadding 
 */
function load(loading = true) {
  if (typeof loading != 'boolean') {
    throw new Error(`传入${typeof loading}类型错误,参数请传布尔类型`)
  }
  if (loading) {
    wx.showNavigationBarLoading()
  }
}
/**
 * 
 * @param {*} res 
 * @return {*} any
 */
function checkRes(res) {
  if (res.data.respCode == '0000') {
    return res.data
  } else {
    return false
  }
}
/**
 * 
 * requset( xxx, {xxx:xxx}, true, POST).then(res=>{
 * 
 * })
 * @String url 
 * @Object parms 
 * @Boolean loading 
 * @String method 
 * @return {Promise} Object
 */
function request(url, parms, loading = true, method = 'POST') {
  load(loading)
  if (checkUrl(url)) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: webUrl + url,
        // url:url,
        data: parms,
        method: method,
        header: {
          "content-type": "application/json;"
        },
        success(res) {
          let data = checkRes(res)
          if (data) {
            wx.hideNavigationBarLoading()
            wx.hideLoading();
            resolve(data)
          } else {
            wx.hideNavigationBarLoading()
            wx.hideLoading();
            reject(data)
            wx.showModal({
              title: '服务器繁忙',
              content: '服务器出问题了，开发工程师正在努力抢修中.....',
              showCancel: false, //是否显示取消按钮
              // cancelText:'取消',
              confirmText: "我知道了",
              success: function(res) {
                if (!res.cancel) {
                  if (getCurrentPages().length != 1) {
                    wx.navigateBack({
                      delta: 1
                    })
                  }
                }
                // if(res.confirm) request(url, parms, loading, method = 'POST')

              }
            })
          }
        },
        fail() {
          wx.hideNavigationBarLoading()
          wx.hideLoading();
          wx.showModal({
            title: '网络错误',
            content: '网络开小差了,请选择您的操作',
            cancelText: '取消',
            showCancel: true, //是否显示取消按钮
            confirmText: "重新加载",
            success: function(res) {
              if (res.confirm) request(url, parms, loading, method)
            }
          })
        }
      })
    })
  }
}
export default request