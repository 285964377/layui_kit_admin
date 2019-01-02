// 处理组件的渲染和操作
layui.define(['layer'], function (exports) {
  var layer = layui.layer,
    $ = layui.jquery;

  var MOD_NAME = 'component';
  var classNames = {
    nav: {
      NAV: '.kit-nav',
      ITEM: '.kit-item',
      SHOW: 'layui-show',
      THIS: 'layui-this'
    }
  };
  var Component = function () {
    this.version = '1.0.1';
  };
  Component.prototype.render = function (modName, filterName) {
    var that = this;
    if (modName === undefined) {
      _private.renderNav(filterName);
    } else {
      switch (modName) {
        case 'nav':
          _private.renderNav(filterName);
          break;
      }
    }
    return that;
  };

  Component.prototype.init = function () {
    this.render();
    return this;
  };
  Component.prototype.on = function (events, callback) {
    return layui.onevent.call(this, MOD_NAME, events, callback);
  }

  var _private = {
    renderNav: function (filterName) {
      var _nav = filterName === undefined ?
        $(classNames.nav.NAV) : $('.kit-nav[lay-filter=' + filterName + ']');

      var navs = _nav.find(classNames.nav.ITEM).each(function () {
        var _that = $(this);
        var _child = _that.find('ul.kit-nav-child');
        // 是否拥有二级
        var hasChild = _child.length > 0;
        if (hasChild) {
          _that.children('a').addClass('child');
          _child.addClass('layui-anim').addClass('layui-anim-upbit');
        }
        // 绑定点击事件
        _that.off('click').on('click', function (e) {
          layui.stope(e);
          // 如果拥有二级则显示二级
          if (hasChild) {
            _that.addClass(classNames.nav.SHOW);
            $(document).one('click', function () {
              _that.removeClass(classNames.nav.SHOW);
              // $(this).off('click');
            });
          } else {
            // 切换选中状态
            _that.parents(classNames.nav.NAV)
              .find(classNames.nav.ITEM)
              .removeClass('layui-this');
            _that.addClass(classNames.nav.THIS);
            // 隐藏二级
            _that.parent('.kit-nav-child')
              .parent('.layui-show')
              .removeClass(classNames.nav.SHOW);

            //获取过滤器名称
            var filter = _that.parents(classNames.nav.NAV).attr('lay-filter');
            //执行事件
            layui.event.call(this, MOD_NAME, 'nav(' + filter + ')', {
              elem: _that
            });
          }
        });
      });
    }
  };

  var component = new Component();
  component.init();

  //输出component接口
  exports('component', component);
});