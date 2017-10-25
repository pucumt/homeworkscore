// pages/learn/lessons.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lessons: null,
    msg:"还没有课文呢"
  },
  gotoLesson: function (e) {
    app.globalData.curLessonId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../learn/index'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.request({
      url: app.globalData.url +'/app/lessonList',
      data: {
        studentId: app.globalData.account.curStudent._id,
        bookId: app.globalData.curBook.bookId,
        minLesson: app.globalData.curBook.minLesson,
        maxLesson: app.globalData.curBook.maxLesson
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      method: "POST",
      success: function (res) {
        if (res.data.error) {
          that.setData({
            msg: res.data.error
          });
        }
        else {
          that.setData({
            lessons: res.data
          });
          if (res.data.length == 0) {
            that.setData({
              msg: "还没有课文呢"
            });
          }
        }
      },
      fail: function (e) {
        console.log(e);
        that.setData({
          msg: "出错了"
        });
        return;
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})