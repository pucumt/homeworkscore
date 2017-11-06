//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
  },
  globalData: {
    account: {
      mobile: null,
      students: [],
      curStudent: null
    },
    curBook: {},
    curLessonId: null,
    curType: 0,
    url: "https://bfbeducation.com" //"http://58.221.162.134:88"
  }
})