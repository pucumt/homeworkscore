// pages/learn/category.js
const app = getApp()

Page({
  onShareAppMessage: function (res) {
    return {
      title: app.globalData.account.curStudent.name+' 的成绩单'
    };
  },
  /**
   * 页面的初始数据
   */
  data: {
    categories: [],
    msg: null
  },
  gotoCategory: function (e) {
    app.globalData.curType = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../learn/index'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    var that = this;
    wx.request({
      url: app.globalData.url + '/app/contentTypes2',
      data: {
        studentId: app.globalData.account.curStudent._id,
        lessonId: app.globalData.curLessonId
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
          var categories = [],
            paraObj;
          if (res.data.wordCount) {
            categories.push({
              type: 1,
              name: "单词 ",
              process: "进度(" + (res.data.stuLesson && res.data.stuLesson.wordProcess || 0) + "/" + res.data.wordCount + ")",
              score: (res.data.stuLesson && parseFloat(res.data.stuLesson.wordAve) || '')
            });
          }

          if (res.data.sentCount) {
            categories.push({
              type: 2,
              name: "朗诵 ",
              process: "进度(" + (res.data.stuLesson && res.data.stuLesson.sentProcess || 0) + "/" + res.data.sentCount + ")",
              score: (res.data.stuLesson && parseFloat(res.data.stuLesson.sentAve) || '')
            });
          }

          if (res.data.isPara) {
            categories.push({
              type: 0,
              name: "背诵 ",
              process: " ",
              score: (res.data.stuLesson && parseFloat(res.data.stuLesson.paragraphAve) || '')
            });
          }

          paraObj && categories.push(paraObj);
          that.setData({
            categories: categories
          });
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