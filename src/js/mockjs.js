layui.define(['mockjsbase', 'utils', 'lodash'], function(exports) {
  var Mock = layui.mockjsbase,
    utils = layui.utils,
    _ = layui.lodash;
  var mockjs = {
    // 通过此方法注入配置
    inject: function(APIs) {
      if (typeof APIs !== 'object') {
        utils.error('mockjs inject error:APIs参数类型只能为object,请检查.');
        return;
      }
      var keys = _.keys(APIs);
      _.forEach(keys, function(item, index) {
        var key = item.split(' '),
          method = key[0].toLocaleLowerCase(),
          url = key[1];
        // 验证请求方式
        if (!utils.oneOf(method, ['get', 'post', 'put', 'delete'])) {
          utils.error('mockjs config error:请求方式只支持：[GET,POST,PUT,DELETE]');
          return;
        }
        // 验证模板类型
        var template = APIs[item];
        if (!utils.oneOf(typeof template, ['object', 'array', 'function'])) {
          utils.error('mockjs config error:template 只支持类型为：[object,array,function] 的处理方式.');
          return;
        }
        // Mock.mock(拦截地址，请求方式/get/post/put/delete,处理模版);  
        // 参考：https://github.com/nuysoft/Mock/wiki/Mock.mock()
        // 注册Mock拦截
        Mock.mock(url, method, template);
      })
    }
  };
  //输出mockjs接口
  exports('mockjs', mockjs);
});