// pages/learn/index.js
const Recorder = require('../../vendor/skegn_weapp_sdk_v2/index.js').Recorder;
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    words: [], // TBD
    sentences: [], // TBD
    paragraph: null, // TBD
    id: 0,
    isRecord: false,
    getScore: false,
    showPara:false,
    src: null,
    msg: null
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
    }, 3000)
  },
  showSentenceScore: function (sentences){
    var option = { showPara:true };
    for(var i =0;i<sentences.length;i++)
    {
      option['sentences[' + i + '].score'] = sentences[i].overall;
    }
    this.setData(option);
  },
  saveScore: function (score, wordId, contentType, recordId, scoreResult, setScore) {
    var that = this;
    wx.request({
      url: app.globalData.url + '/app/score',
      data: {
        studentId: app.globalData.account.curStudent._id,
        lessonId: app.globalData.curLessonId,
        wordId: wordId,
        contentType: contentType,
        score: score,
        recordId: recordId,
        scoreResult: JSON.stringify(scoreResult)
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
        setScore();
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
    if (!this.audioCtx.paused) {
      this.audioCtx.stop();
    }
    var that = this;
    if (this.data && this.data.src) {
      this.audioCtx.src = this.data.src;
    }
  },
  toRecord: function (e) {
    if (this.data.isRecord) {
      this.recorder.stop();
      return;
    }
    if (!this.audioCtx.paused)
    {
      this.audioCtx.stop();
    }
    
    var that = this,
      duration,
      contentType;
    this.setData({
      id: e.currentTarget.dataset.id,
      showPara: (e.currentTarget.dataset.type != "para")
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
          console.log("onscore:", ret);
          var data = JSON.parse(ret);

          // wx.setClipboardData({
          //   data: ret,
          //   success: function (res) {
          //   }
          // }) // used to log copy

          if (!data.result) {
            if(data.error)
            {
              that.showMsg("评测出错了，请重新尝试：" + data.error);
            }
            return;
          }
          var score = data.result.overall,
            sentences = (e.currentTarget.dataset.type == "para" && data.result.sentences); // word
          // console.log("得分" + data.result.overall);
          // console.log(ret)

          function setScore() {
            var index,
              option = {
                isRecord: false,
                getScore: true
              },
              src = that.data.src;
            switch (e.currentTarget.dataset.type) {
              case "para":
                that.data.paragraph.score = score;
                that.data.paragraph.src = src;
                option.paragraph = that.data.paragraph;
                that.showSentenceScore(data.result.sentences);
                break;
              case "word":
                index = that.data.words.findIndex(o => { return o._id == e.currentTarget.dataset.id; });
                option['words[' + index + '].score'] = score;
                option['words[' + index + '].src'] = src;
                break;
              default:
                index = that.data.sentences.findIndex(o => { return o._id == e.currentTarget.dataset.id; });
                option['sentences[' + index + '].score'] = score;
                option['sentences[' + index + '].src'] = src;
                break;
            }
            that.setData(option);
          }
          that.saveScore(score, e.currentTarget.dataset.id, contentType, data.recordId, sentences, setScore);
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
  toplay2: function (e) {
    if (!this.data.paragraph)
    {// only when the paragraph is exist will play
      return;
    }
    this.setData({
      src: app.globalData.url + "/uploads/books/" + app.globalData.curBook.bookId + "/" + app.globalData.curLessonId + "/" + e.currentTarget.dataset.id + ".mp3"
    });
    this.play();
  },
  toReplay: function (e) {
    // console.log(e.currentTarget.dataset.scoreid);
    if (e.currentTarget.dataset.src) {
      this.setData({
        src: e.currentTarget.dataset.src
      });
      this.play();
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log("... onload ...");
    var that = this;
    this.recorder = new Recorder('17KouyuTestAppKey', '17KouyuTestSecretKey');
    this.audioCtx = wx.createInnerAudioContext();
    this.audioCtx.onCanplay(() => {
      // console.log('准备好要播放')
      that.audioCtx.play();
    })
    this.audioCtx.onPlay(() => {
      // console.log('开始播放')
    })
    this.audioCtx.onError((res) => {
      that.showMsg(res.errMsg)
      console.log(res.errCode)
    })
    //  return;

    wx.request({
      url: app.globalData.url + '/app/contents',
      data: {
        studentId: app.globalData.account.curStudent._id,
        lessonId: app.globalData.curLessonId,
        contentType: app.globalData.curType
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
              paragraph = null;
            res.data.forEach(content => {
              if (content.scoreId)
              {
                content.score = parseFloat(content.score);
                content.src = app.globalData.url + "/uploads/scores/" + app.globalData.account.curStudent._id + "/" + content.scoreId + ".mp3";
              }
              
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
    if (!this.audioCtx.paused) {
      this.audioCtx.stop();
    }
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
