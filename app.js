//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  globalData: {
    account:{
      mobile:null,
      students:[],
      curStudent:null
    },
    curBook:{},
    curLessonId: null,
    url:"http://58.221.162.134:88"
  }
})