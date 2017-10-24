// pages/learn/list.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    students: null,
    index: 0,
    curStudent: null
  },
  changeStudent: function (e) {
    app.globalData.account.curStudent = this.globalStudents[parseInt(e.detail.value)];
    this.setData({
      index: e.detail.value
    })
  },
  showList: function () {
    this.setData({
      curStudent: 1
    });
    this.toGetList();
  },
  toGetList: function () {

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.globalStudents = app.globalData.account.students;
    if (this.globalStudents.length > 0) {
      var studentNames = [];
      this.globalStudents.forEach(function (student) {
        studentNames.push(student.name);
      });
      this.setData({
        students: studentNames
      });
      app.globalData.account.curStudent = this.globalStudents[0];

      if (this.globalStudents.length == 1) {
        this.setData({
          curStudent: 1
        });
        this.toGetList();
      }
    }
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