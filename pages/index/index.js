//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userName: null,
    userPassword: null,
    msg: null
  },
  nameInput: function (e) {
    this.setData({
      userName: e.detail.value
    })
  },
  passwordInput: function (e) {
    this.setData({
      userPassword: e.detail.value
    })
  },
  showMsg: function (msg) {
    this.setData({
      msg: msg
    })
    var that = this;
    setTimeout(function () {
      that.setData({
        msg: null
      })
    }, 1500)
  },
  //事件处理函数
  openLearningMain: function () {
    if (this.data.userName == null || this.data.userPassword == null) {
      this.showMsg("用户名密码不能为空");
      return;
    }
    var that = this;
    wx.request({
      url: app.globalData.url+'/app/login', 
      data: {
        name: this.data.userName,
        password: this.data.userPassword
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      method: "POST",
      success: function (res) {
        if (res.data.sucess) {
          app.globalData.account.mobile = that.data.userName;
          app.globalData.account.students = res.data.students;
          wx.navigateTo({
            url: '../learn/list'
          })
        }
        else {
          var error = res.data.error;
          that.showMsg(error || "登录出错了");
          return;
        }
      },
      fail: function (e) {
        console.log(e);
        that.showMsg("登录出错了");
        return;
      }
    })
  },
  onLoad: function () {
  }
})