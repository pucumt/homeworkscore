
const callback = require('./callback.js')
const CryptoJS = require('./crypto-js.js');
const uuidv4 = require('./we-uuidv4.js');
const recorderManager = wx.getRecorderManager()

function Recorder (appKey,appSecret,server){
  console.log(appKey)
  if(!appKey || !appSecret){
    throw new Error('参数错误，appKey or appSecret is invalid');
  }
  var serverUrl = server || 'wss://wx.api.17kouyu.com/'
  var sdkVersion = 16777472
  var isReady = true
  var request = {}
  var isConnect = false
  var audio = {
    audioType: 'mp3',
    channel: 1,
    sampleBytes: 2,
    sampleRate: 16000
  }
  var app = {
    userId: '',
    applicationId: appKey,
    timestamp: '',
    sig: '',
  }
  var record_options = {
    duration: 10000,
    sampleRate: 16000,
    numberOfChannels: 1,
    encodeBitRate: 64000,
    format: 'mp3',
    frameSize: 5
  }
  var onStart = null
  var onStop = null
  var onScore = null
  var onError = null
  var start = function (args){
    args = args || {}
    if (!isReady){
      callback.fail(args, { errCode: 10001, errMsg: 'must stoped before start record' })
      return 
    }
    isReady = false
    if (!args.hasOwnProperty('duration')){
      callback.fail(args, { errCode: 10002, errMsg: 'param duration is invalid' })
      return;
    }
    
    if (!args.hasOwnProperty('serverParams') || typeof (args.serverParams) !== "object") {
      callback.fail(args, { errCode: 10002, errMsg: 'param serverParams is invalid' })
      return;
    }
    if (!args.serverParams.hasOwnProperty('userId')) {
      args.serverParams.userId = 'guest'
    }
    
    if (!args.serverParams.hasOwnProperty('coreType')) {
      callback.fail(args, { errCode: 10002, errMsg: 'param coreType is invalid' })
      return
    }
    //开始录音回调
    if (args.hasOwnProperty('onStart') && typeof args.onStart == "function") {
      onStart = args.onStart
    }

    //停止录音回调
    if (args.hasOwnProperty('onStop') && typeof args.onStop == "function") {
      onStop = args.onStop
    }
    //获得评分回调
    if (args.hasOwnProperty('onScore') && typeof args.onScore == "function") {
      onScore = args.onScore
    }

    args.serverParams.tokenId = uuidv4()
    //RecordId
    if (args.hasOwnProperty('onRecordIdGenerated') && typeof args.onRecordIdGenerated == "function") {
      args.onRecordIdGenerated({ recordId: args.serverParams.tokenId})
    }
    app.userId = args.serverParams.userId

    //录音机参数
    record_options.duration = parseInt(args.duration)

    //判断是否切换内核
    var isReConnect = request && request.coreType == args.serverParams.coreType ? false :true
    request = args.serverParams

    connectServer(
      isReConnect,
      function () {
        //连接服务器成功
        cmd_start(
          //发送开始指令成功
          function () {
            //开始录音
            recorderManager.start(record_options)
          }, 
          function () {
            callback.fail(args, { errCode: 20002, errMsg: 'cmd start failed' })
        })
      }, 
      function (e) {
        console.log(e)
        callback.fail(args, { errCode: 20001, errMsg: 'connectServer failed' })
      })
  }


  //主动停止录音
  var stop = function (args) {
    recorderManager.stop()
  }
  
  //发送开始录音指令
  var cmd_start = function (success, fail){
    app.timestamp = String(Date.parse(new Date()) / 1000)
    app.sig = CryptoJS.SHA1(appKey + app.timestamp + app.userId + appSecret).toString()
    var cmd = {
      cmd:'start',
      param:{
        app: app,
        audio: audio,
        request: request
      }
    }
    sendSocketMessage({
      data: JSON.stringify(cmd),
      success: success,
      fail: fail
    })
  }
  //发送连接指令
  var cmd_connect = function (success, fail){
    var timeStamp =String(Date.parse(new Date()) / 1000)
    var sig = CryptoJS.SHA1(appKey + timeStamp + appSecret).toString()
    
    var cmd = {
      cmd: 'connect',
      param: {
        sdk: {
          version: sdkVersion,
          source: 4,
          protocol: 1
        },
        app: {
          applicationId: appKey,
          sig: sig,
          timestamp: timeStamp
        }
      }
    }
    sendSocketMessage({
      data:JSON.stringify(cmd),
      success: success,
      fail: fail
    })
  }
  //发送停止录音指令
  var cmd_stop = function (success, fail){
    sendSocketMessage({
      data: new ArrayBuffer(0), 
      success:success, 
      fail:fail
    })
  }

 
  //连接服务器
  var connectServer = function (reConnect,success,fail){
    if (!reConnect && isConnect){
      success()
      return
    }
    isConnect = false
    socketOpen = false
    wx.closeSocket({
      complete:function(){
        console.log(serverUrl + request.coreType + '?e=0&t=0')
        wx.connectSocket({
          url: serverUrl + request.coreType + '?e=0&t=0',
          success: function () {
            cmd_connect(function () {
              isConnect = true
              success()
            }, function (e) {
              isConnect = false
              fail(e)
            })
          },
          fail: function (e) {
            isConnect = false
            fail(e)
          },
          complete: function (e) {
            console.log('connectServer', e)
          }
        })
      }
    })

  }
  var socketOpen = false
  var socketMsgQueue = []

  //发送数据包
  wx.onSocketOpen(function (res) {
    socketOpen = true
    for (var i = 0; i < socketMsgQueue.length; i++) {
      sendSocketMessage(socketMsgQueue[i])
    }
    socketMsgQueue = []
  })
  function sendSocketMessage(msg) {
    msg = msg || {}
    if (socketOpen) {
      console.log(Date.now(),msg)
      wx.sendSocketMessage({
        data: msg.data,
        success: msg.hasOwnProperty('success') ? msg.success:null,
        fail: msg.hasOwnProperty('fail') ? msg.fail : null
      })
    } else {
      socketMsgQueue.push(msg)
    }
  }

  //服务器返回数据
  wx.onSocketMessage(function (res) {
    if (typeof onScore === 'function') {
      onScore(res.data)
    }
    isReady = true
  })
  //服务器连接断开
  wx.onSocketClose(function (res) {
    isConnect = false
    isReady = true
    socketOpen = false
    console.log('WebSocket 已关闭！')
  })



/*=====================录音机管理======================== */
  

  recorderManager.onStart(() => {
    if (typeof onStart === 'function'){
      onStart()
    }
  })

  recorderManager.onStop((res) => {
    const { tempFilePath } = res
    if (typeof onStop === 'function') {
      onStop(res)
    }
  })

  recorderManager.onFrameRecorded((res) => {

    const { frameBuffer } = res
    sendSocketMessage({
      data: frameBuffer
    })
    if (res.isLastFrame) {
      cmd_stop()
    }
  })

  this.start = start
  this.stop = stop
};
module.exports = {
  Recorder: Recorder
};