// pages/learn/index.js
const Recorder = require('../../vendor/skegn_weapp_sdk_v2/index.js').Recorder;
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    words: [{ _id: "111", name: "english" }], // TBD
    sentences: [{ _id: "222", name: "I like english" }], // TBD
    paragraph: { _id: "333", name: "I like english very much!" }, // TBD
    id: 0,
    isRecord: false,
    getScore: false,
    src: null,
    msg: null
  },
  saveScore: function (score, wordId, contentType, recordId, setScore) {
    var that = this;
    wx.request({
      url: app.globalData.url + '/app/score',
      data: {
        studentId: app.globalData.account.curStudent._id,
        lessonId: app.globalData.curLessonId,
        wordId: wordId,
        contentType: contentType,
        score: score,
        recordId: recordId
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
        setScore(res.data.scoreId);
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
  play: function () {
    var that = this;
    if (this.data && this.data.src) {
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
    }
  },
  toRecord: function (e) {
    if (this.data.isRecord) {
      this.recorder.stop();
      return;
    }

    var that = this,
      duration,
      contentType;
    this.setData({
      id: e.currentTarget.dataset.id
    });
    switch (e.currentTarget.dataset.type) {
      case "para":
        contentType = 0;
        duration = e.currentTarget.dataset.duration;
        break;
      case "word":
        contentType = 1;
        duration = 3000;
        break;
      default:
        contentType = 2;
        duration = 6000;
        break;
    }
    try {
      this.recorder.start({
        duration: duration, // 3000 word / 6000 sent /setting para
        serverParams: { // 录音服务参数
          coreType: e.currentTarget.dataset.type + ".eval", // 选择内核sent.eval
          refText: e.currentTarget.dataset.word, // 参考文本
          scale: 100,
          precision: 1,
          dict_type: 'KK'
        },
        onStart: function () {
          //开始录音
          that.setData({
            isRecord: true,
            getScore: false
          });
        },
        onScore: function (ret) { // 评分成功需要显示评分结果 
          // console.log("onscore:", ret);
          var data = JSON.parse(ret);
          if (!data.result) {
            return;
          }
          var score = data.result.overall; // word
          // console.log("得分" + data.result.overall);
          // console.log(ret)

          function setScore(scoreId) {
            var index,
              option = {
                isRecord: false,
                getScore: true
              };
            switch (e.currentTarget.dataset.type) {
              case "para":
                that.data.paragraph.score = score;
                that.data.paragraph.scoreId = scoreId;
                option.paragraph = that.data.paragraph;
                break;
              case "word":
                index = that.data.words.findIndex(o => { return o._id == e.currentTarget.dataset.id; });
                option['words[' + index + '].score'] = score;
                option['words[' + index + '].scoreId'] = scoreId;
                break;
              default:
                index = that.data.sentences.findIndex(o => { return o._id == e.currentTarget.dataset.id; });
                option['sentences[' + index + '].score'] = score;
                option['sentences[' + index + '].scoreId'] = scoreId;
                break;
            }
            that.setData(option);
          }
          that.saveScore(score, e.currentTarget.dataset.id, contentType, data.recordId, setScore);
          // console.log("ceshi ...");
          // console.log(data.result.overall);
          // console.log(e.currentTarget.dataset.id);
          // console.log(contentType);
          // console.log(index);
        },
        onStop: function (ret) {
          // console.log("onstop:", ret);
          that.setData({
            src: ret.tempFilePath, // this will be change later
            isRecord: false,
            getScore: false
          });
          // just for test TBD
          // var contentType,
          //   index,
          //   option = {
          //     isRecord: false,
          //     getScore: true
          //   },
          //   score=20,
          //   data={
          //     recordId: "11111"
          //   };
          // switch (e.currentTarget.dataset.type) {
          //   case "para":
          //     contentType = 0;
          //     that.data.paragraph.score = score;
          //     option.paragraph = that.data.paragraph;
          //     break;
          //   case "word":
          //     contentType = 1;
          //     index = that.data.words.findIndex(o => { return o._id == e.currentTarget.dataset.id; });
          //     option['words[' + index + '].score'] = score;
          //     break;
          //   default:
          //     contentType = 2;
          //     index = that.data.sentences.findIndex(o => { return o._id == e.currentTarget.dataset.id; });
          //     option['sentences[' + index + '].score'] = score;
          //     break;
          // }
          // that.setData(option);
          // that.saveScore(score, e.currentTarget.dataset.id, contentType, data.recordId);
        },
        onRecordIdGenerated: function (ret) {
          // console.log("recordId");
          // console.log(ret.recordId);
        },
        onError: function (ret) {
           // console.log("onerror:",ret);
          // console.log(ret.recordId);
        },
        fail: function (ret) {
          // console.log("fail:", ret);
          that.setData({
            isRecord: false,
            getScore: false
          });
        }
      });
    }
    catch (ee) {
       console.log("systemerror:",ee);
    }
  },
  toplay: function (e) {
    this.setData({
      src: app.globalData.url + "/uploads/books/" + app.globalData.curBook.bookId + "/" + app.globalData.curLessonId + "/" + e.currentTarget.dataset.id + ".mp3"
    });
    this.play();
  },
  toReplay: function (e) {
    // e.currentTarget.dataset.id
    // audioUrl[0] = "../../uploads/books/" + $("#bookId").val() + "/" + $('#lessonId').val() + "/" + content._id + ".mp3";
    // /public/uploads/scores/' + studentId + '/'+scoreId + '.mp3'
    console.log(e.currentTarget.dataset.scoreid);

    if (e.currentTarget.dataset.scoreid) {
      this.setData({
        src: app.globalData.url + "/uploads/scores/" + app.globalData.account.curStudent._id + "/" + e.currentTarget.dataset.scoreid + ".mp3"
      });
      this.play();
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log("... onload ...");
    this.recorder = new Recorder('17KouyuTestAppKey', '17KouyuTestSecretKey');
    this.audioCtx = wx.createInnerAudioContext();

    var that = this;
    wx.request({
      url: app.globalData.url + '/app/contents',
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
            var words = [],
              sentences = [],
              paragraph;
            res.data.forEach(content => {
              switch (content.contentType) {
                case 0:
                  paragraph = content;
                  break;
                case 1:
                  words.push(content);
                  break;
                case 2:
                  sentences.push(content);
                  break;
              }
            });
            that.setData({
              msg: null,
              words: words,
              sentences: sentences,
              paragraph: paragraph
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
