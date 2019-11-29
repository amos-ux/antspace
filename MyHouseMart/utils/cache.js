/** 
 * 将数据缓存到本地相关方法 
 **/
module.exports = {
  //添加一个元素
  put: function(key, val) {
    let time = 3000000;
    wx.setStorageSync(key, val)
    let seconds = parseInt(time);
    if (seconds > 0) {
      let timestamp = Date.parse(new Date());
      timestamp = timestamp / 1000 + seconds;
      wx.setStorageSync(key + 'dtime', timestamp + "")
    } else {
      wx.removeStorageSync(key + 'dtime')
    }
  },
  get: function(key, def) {
    let deadtime = parseInt(wx.getStorageSync(key + 'dtime'))
    if (deadtime) {
      if (parseInt(deadtime) < Date.parse(new Date()) / 1000) {
        if (def) {
          return def;
        } else {
          return;
        }
      }
    }
    let res = wx.getStorageSync(key);
    if (res) {
      return res;
    } else {
      return def;
    }
  },
  //指定Key移除某个元素
  remove: function(key) {
    wx.removeStorageSync(key);
    wx.removeStorageSync(key + 'dtime');
  },
  //清除所有已经保存的元素
  clear: function() {
    wx.clearStorageSync();
  }
};