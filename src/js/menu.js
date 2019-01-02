layui.define(['jquery', 'utils', 'axios'], function(exports) { //提示：模块也可以依赖其它模块，如：layui.define('layer', callback);
  var $ = layui.jquery,
    utils = layui.utils,
    _ = layui.lodash,
    axios = layui.axios,
    storage = utils.localStorage;
  var Menu = function() {
    this.config = {
      elem: undefined, // 容器
      onClicked: undefined, // 点击后触发的回调
      dynamicRender: false, // 是否动态渲染 --如果此参数为true,则需要设置elem,[data或者remote]参数
      data: [], // 数据
      remote: { //此配置请参数axios的request配置，文档地址：https://www.kancloud.cn/yunye/axios/234845
        url: undefined,
        method: 'get'
      },
      cached: false, // 是否开启缓存,注：只缓存远程加载的数据。
      cacheKey: 'KITADMINMENU', // 缓存key
      isJump: true, //是否直接跳转页面
      onlyOne: true
    };
    this.version = '1.0.2';
  }
  var MENU = '.kit-menu',
    MENU_ITEM = '.kit-menu-item',
    MENU_CHILD = '.kit-menu-child',
    THIS = '.layui-this',
    SHOW = '.layui-show';
  // 设置参数
  Menu.prototype.set = function(options) {
    var that = this;
    $.extend(true, that.config, options);
    return that;
  };
  // 渲染
  Menu.prototype.render = function() {
    var that = this,
      config = that.config;
    // 是否需要动态渲染
    if (config.dynamicRender) {
      //本地数据优先级最高
      if (config.data.length > 0) {
        // 缓存数据
        storage.setItem(config.cacheKey, data);
        // 渲染DOM
        _private.renderHTML(config.elem, config.data, function() {
          // 绑定事件
          that.bind();
        });
      } else {
        //是否已经处理
        var isHandled = false;
        if (config.cached) {
          var data = storage.getItem(config.cacheKey);
          if (data !== null && data !== undefined) {
            isHandled = true;
            _private.renderHTML(config.elem, data, function() {
              that.bind();
            });
          }
        }
        if (!isHandled) {
          // 远程读取
          _private.loadData(config.remote, function(data) {
            // 缓存数据
            storage.setItem(config.cacheKey, data);
            // 渲染DOM
            _private.renderHTML(config.elem, data, function() {
              that.bind();
            });
          });
        }
      }
    } else {
      //绑定事件
      that.bind();
    }
    return that;
  };
  // 绑定事件
  Menu.prototype.bind = function() {
    var that = this,
      config = that.config;
    $(MENU).find(MENU_ITEM).each(function() {
      var _item = $(this);
      var _a = _item.children('a');
      var isOneLevel = _item.parent()[0].className === 'kit-menu';
      if (isOneLevel) {
        _item.attr('lay-one', true);
      }
      var hasChild = _item.find('ul.kit-menu-child').length > 0;
      if (hasChild) {
        _a.addClass('child');
      }
      var layid = _item.attr('lay-id');
      if (layid === '' || layid === undefined) {
        layid = utils.randomCode();
        _item.attr('lay-id', layid);
      }
      _a.off('click').on('click', function(e) {
        layui.stope(e);
        if (!hasChild) {
          $(MENU).find(MENU_ITEM).removeClass('layui-this');
          _item.addClass('layui-this');
        } else {
          if (_item.hasClass('layui-show')) {
            _item.removeClass('layui-show');
          } else {
            _item.addClass('layui-show');
          }
          // 只展开一个
          if (config.onlyOne) {
            if (_item.attr('lay-one')) {
              _item.siblings().removeClass('layui-show');
            }
          }
        }
        utils.isFunction(config.onClicked) && config.onClicked({
          elem: _item,
          hasChild: hasChild,
          data: {
            href: _a.attr('href'),
            layid: layid
          }
        });
        // 拦截a标签的跳转
        if (!config.isJump) {
          return false;
        }
      });
    });
    if (location.hash !== undefined && location.hash !== '' && location.hash !== null) {
      // 默认选中
      var hash = '#' + layui.router(location.hash).href.split('?')[0];
      var _active = $(MENU).find('a[href="' + hash + '"]');
      if (_active.length > 0) {
        _active.parents('li').each(function() {
          var _that = $(this);
          if (!_that.hasClass('layui-show')) {
            _that.children('a').click();
          }
        });
      }
    }
    return that;
  };
  // 移除缓存
  Menu.prototype.removeCache = function(key) {
    var that = this,
      config = that.config;
    key = key || config.cacheKey;
    utils.localStorage.removeItem(key);
  };

  // 私有方法
  var _private = {
    // 渲染HTML
    renderHTML: function(elem, data, callback) {
      var that = this;
      var temps = ['<ul class="kit-menu">'];

      var pid = 0; //一级菜单pid为0 ，这是一个约定
      that.recursion(temps, data, pid);
      if (temps.length > 0) {
        // 闭合ul
        temps.push('</ul>');
        var _elem = $(elem);
        if (_elem.length === 0) {
          utils.error('Menu config error:请配置elem参数.');
          return;
        }
        _elem.html(temps.join(''));
        utils.isFunction(callback) && callback();
      }
    },
    // 递归组装dom
    recursion: function(temp, datas, pid) {
      var that = this;
      var curr = [];
      _.forEach(datas, function(item, index) {
        if (item.pid === pid)
          curr.push(item);
      });
      if (curr.length > 0) {
        _.forEach(curr, function(item) {
          var open = item.open ? 'layui-show' : '';
          temp.push('<li class="kit-menu-item ' + open + '">');
          var href = _.isEmpty(item.path) ? 'javascript:;' : item.path;
          if (item.blank) {
            temp.push('<a href="' + href + '" target="_blank">');
          } else {
            temp.push('<a href="' + href + '">');
          }
          temp.push('<i class="layui-icon">' + item.icon + '</i> ');
          temp.push('<span>' + item.title + '</span>');
          temp.push('</a>');
          var children = item.children;
          if (children !== undefined && children !== null && children.length > 0) {
            temp.push('<ul class="kit-menu-child kit-menu-child layui-anim layui-anim-upbit">');
            that.recursion(temp, children, item.id);
            temp.push('</ul>');
          }
          temp.push('</li>');
        });
      }
    },
    // 远程加载数据
    loadData: function(options, callback) {
      axios(options)
        .then(function(res) {
          if (res.status === 500)
            throw new Error(res.statusText);
          return res.data;
        })
        .then(function(data) {
          callback(data);
        })
        .catch(function(error) {
          utils.error(error);
        });
    }
  };

  var menu = new Menu();

  //输出menu接口
  exports('menu', menu);
});