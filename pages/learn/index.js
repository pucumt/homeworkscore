// pages/learn/index.js
const Recorder = require('../../vendor/skegn_weapp_sdk_v2/index.js').Recorder;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    words: ['english', 'teacher', 'student'],
    sentences: ['It is beautiful', 'I like learning english very much', 'Do you like the weather today'],
    result: "result",
    id: 0,
    isRecord:false,
    getScore:false,
    score:0,
    src:null
  },
  toRecord: function (e) {
    if (this.data.isRecord)
    {
      this.recorder.stop();
      return;
    }

    var that = this;
    this.setData({
      result: e.currentTarget.dataset.word,
      id: e.currentTarget.dataset.id
    });
    this.recorder.start({
      duration: 3000,
      serverParams: { // 录音服务参数
        coreType: e.currentTarget.dataset.type+".eval", // 选择内核sent.eval
        refText: e.currentTarget.dataset.word, // 参考文本
        scale: 100,
        precision: 1,
        dict_type: 'KK'
      },
      onStart: function () {
        //开始录音
        that.setData({
          isRecord: true,
          getScore:false
        });
      },
      onScore: function (ret) { // 评分成功需要显示评分结果 
        var data = JSON.parse(ret);
        console.log(ret)
        that.setData({
          result: 'done get',
          isRecord: false,
          getScore:true,
          score: data.result.overall // this will be change later
        });
      },
      onStop: function (ret) {
        that.setData({
          src: ret.tempFilePath // this will be change later
        });
      },
      fail: function (ret) {
        that.setData({
          isRecord: false,
          getScore: false
        });
      }
    });
  },
  toplay: function(e){

  },
  toReplay: function(e){
    // e.currentTarget.dataset.id
    var that = this;
    this.audioCtx.src = this.data.src;
    this.audioCtx.onCanplay(() => {
      // console.log('准备好要播放')
      that.audioCtx.play();
    })
    this.audioCtx.onPlay(() => {
      // console.log('开始播放')
    })
    this.audioCtx.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.recorder = new Recorder('17KouyuTestAppKey', '17KouyuTestSecretKey');
    this.audioCtx = wx.createInnerAudioContext();
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