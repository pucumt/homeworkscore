// pages/learn/category.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    categories: [{ name: "背诵", type: 0 }, { name: "朗诵", type: 1 }],
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
    var that = this;
    wx.request({
      url: app.globalData.url + '/app/contentTypes',
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
          if (res.data.length == 0) {
            that.setData({
              msg: "还没有课文呢"
            });
          }
          else {
            var categories = [],
              paraObj;
            res.data.forEach(function (content) {
              var name;
              switch (content.contentType) {
                case 0:
                  name = "背诵";
                  paraObj = {
                    type: 0,
                    name: name
                  }
                  break;
                case 1:
                  name = "单词";
                  categories.push({
                    type: content.contentType,
                    name: name
                  });
                  break;
                default:
                  name = "朗诵";
                  categories.push({
                    type: content.contentType,
                    name: name
                  });
                  break;
              }
            });
            paraObj && categories.push(paraObj);
            that.setData({
              categories: categories
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