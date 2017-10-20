module.exports.fail = function(args,ret){
  if (args.hasOwnProperty('fail') && typeof args.fail == "function") {
    args.fail(ret);
  }
  this.complete(args, ret)
}
module.exports.complete = function(args, ret){
  if (args.hasOwnProperty('complete') && typeof args.complete == "function") {
    args.complete(ret);
  }
}
module.exports.success = function (args, ret) {
  if (args.hasOwnProperty('success') && typeof args.success == "function") {
    args.success(ret);
  }
  this.complete(args, ret)
}