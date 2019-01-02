layui.define(['layer', 'laytpl', 'utils', 'lodash', 'route'], function(exports) {
  var layer = layui.layer,
    $ = layui.jquery,
    laytpl = layui.laytpl,
    utils = layui.utils,
    _ = layui.lodash,
    storage = utils.localStorage,
    route = layui.route;


  const KITADMINTABS = 'KITADMINTABS';

  var TABS = '.kit-tabs',
    PREV = '.kit-tabs-prev',
    NEXT = '.kit-tabs-next',
    TOOLS = '.kit-tabs-tools',
    TAB_TITLE = '.kit-tab-title',
    TAB_CLOSE = '.kit-tab-close',
    TOOLSBOX = '.kit-tabs-toolsbox';

  var tabsContent = undefined,
    tabsTitle = undefined,
    toolsBox = undefined,
    templates = {
      TITLE: ['<li lay-id="{{d.id}}" data-path={{d.path}}>',
        '<span title="{{d.title}}">',
        '{{#if(d.icon){}}',
        '<i class="layui-icon">{{d.icon}}</i> ',
        '{{#}}}',
        '{{d.title}}',
        '</span>',
        '<i class="layui-icon kit-tab-close">&#x1006;</i>',
        '</li>'
      ].join(''),
      CONTENT: ['<div class="kit-tabs-item" data-path={{d.path}} lay-tab-id="{{d.id}}" data-component="{{d.component}}" data-rendered="{{d.rendered}}">',
        '<router-view></router-view>',
        '</div>'
      ].join(''),
      TOOLSITEM: [
        '<li class="kit-item" lay-id="{{d.id}}">',
        '<a href="javascript:;">',
        '<span title="{{d.title}}">{{d.title}}</span>&nbsp;',
        '<i class="layui-icon layui-close">&#x1006;</i>',
        '</a>',
        '</li>'
      ].join('')
    };

  var Tabs = function() {
    this.config = {
      onChangeBefore: undefined,
      onChanged: undefined,
      onRendered: undefined
    };
    this.version = '1.0.2';
  }
  var isInit = false;
  Tabs.prototype.set = function(options) {
    var that = this;
    $.extend(true, that.config, options);
    return that;
  };
  Tabs.prototype.render = function(callback) {
    var that = this;
    var target = $(TABS).attr('kit-target');
    tabsTitle = tabsTitle === undefined ? $(TAB_TITLE) : tabsTitle;
    tabsContent = tabsContent === undefined ? $('div.kit-tabs-content[kit-tabs="' + target + '"]') : tabsContent;
    toolsBox = toolsBox === undefined ? $(TOOLSBOX).children('ul') : toolsBox;

    tabsTitle.children('li').each(function(index, element) {
      var _that = $(this);
      var layid = _that.attr('lay-id');
      _that.off('click').on('click', function() {
        that.switch(layid);
      });
      var close = _that.find(TAB_CLOSE);
      if (close.length === 1) {
        close.off('click').on('click', function(e) {
          layui.stope(e);
          that.remove(layid);
        });
      }
      // 绑定工具栏的移除事件
      $(TOOLSBOX).find('.layui-close').off('click').on('click', function(e) {
        layui.stope(e);
        var parent = $(this).parents('.kit-item')
        var layid = parent.attr('lay-id');
        that.remove(layid);
      });
    });
    _private.prevHandler();
    _private.nextHandler();
    _private.toolHandler();
    _private.toolBoxHandler(that);
    if (!isInit) {
      isInit = true;
      _private.initCaches(that);
    }
    utils.isFunction(callback) && callback({
      tabCount: $(TAB_TITLE).children('li').length,
      isIndex: _private.findTitle(_private.getCurrId()).attr('data-path') === '#/'
    });
    return that;
  };
  Tabs.prototype.add = function(options, callback) {
    var that = this,
      config = that.config;
    if (options.active === undefined) {
      // 读取缓存的tabs
      var items = _private.getCaches();
      var item = utils.find(items, function(d) {
        return d.path === options.path;
      });
      // 如果在缓存中找到对应的tab信息则覆盖id
      if (item !== undefined) {
        options.id = item.id;
      }
      if (that.exists(options.id)) {
        that.switch(options.id);
        return;
      } else if (that.existsByPath(options.path)) { //如果通过layid找不到则通过路由地址找
        var t = that.getByPath(options.path);
        that.switch(t.id);
        return;
      }
    } else {
      // 处理读取历史初始化的tabs
      if (that.exists(options.id)) {
        that.switch(options.id, true);
        return;
      } else if (that.existsByPath(options.path)) { //如果通过layid找不到则通过路由地址找
        var t = that.getByPath(options.path);
        that.switch(t.id, true);
        return;
      }
    }
    laytpl(templates.TITLE).render(options, function(html) {
      // 渲染title
      tabsTitle.append(html);
      // 渲染主体内容
      laytpl(templates.CONTENT).render(options, function(chtml) {
        tabsContent.append(chtml);
        //添加至右侧工具栏
        laytpl(templates.TOOLSITEM).render(options, function(thtml) {
          toolsBox.append(thtml);
          // 处理缓存
          var items = _private.getCaches();
          var item = utils.find(items, function(d) {
            return d.path === options.path;
          });
          // 如果不存在，则添加一个
          if (item === undefined) {
            items.push({
              id: options.id,
              title: options.title,
              path: options.path,
              component: options.component,
              rendered: false,
              active: true,
              icon: options.icon
            });
          } else {
            // 更新id
            item.id = options.id;
          }
          _private.setCaches(items); //保存缓存数据
          // 重新渲染
          that.render();
          if (options.active === undefined) {
            that.switch(options.id); //获取焦点
          } else {
            if (options.active) that.switch(options.id, true);
          }
          utils.isFunction(callback) && callback();
        });
      });
      // utils.isFunction(config.onRendered) && config.onRendered();
    });
  };
  Tabs.prototype.remove = function(layid) {
    var that = this;
    var _title = _private.findTitle(layid);
    // 如果是删除当前获取焦点的选项卡才销换到上一个，否则不切换
    if (_title.hasClass('layui-this')) {
      var prevLayid = _title.prev().attr('lay-id');
      // 切换到上一个选项卡
      that.switch(prevLayid);
    }
    // 移除
    _title.remove();
    _private.findContent(layid).remove();
    _private.findTools(layid).remove();

    var items = _private.getCaches();
    var rIndex = items.findIndex(p => p.id === layid);
    items.splice(rIndex, 1);
    _private.setCaches(items);
  };
  Tabs.prototype.switch = function(layid, isInit = false) {
    var that = this,
      config = that.config;
    var _that = _private.findTitle(layid);
    if (_that.length === 0)
      return;
    var liWidth = _that.width() + 50;
    var ol = _that[0].offsetLeft;
    var tabWidth = tabsTitle.parent('div.kit-tab').width();
    if (ol > tabWidth) {
      var c = ol - tabWidth + liWidth;
    }
    var path = _that.attr('data-path');
    var items = _private.getCaches();
    var item = utils.find(items, function(d) {
      return d.path === path;
    });
    // 如果是初始化，只切换到上一次选中的选项卡
    if (item !== undefined && item.active && isInit) {
      handle();
      _that.click(); // 模拟点击当前选中的选项卡
    }
    // 如果是点击切换
    if (!isInit) {
      handle();
      _.forEach(items, function(item) {
        item.active = false;
      });
      var currActive = utils.find(items, function(d) {
        return d.path === path;
      });
      if (currActive !== undefined) {
        currActive.active = true;
      }
      _private.setCaches(items);
      var _content = _private.getContent(layid);
      // 如果该选项卡未渲染则需要执行渲染操作
      if (!_content.isRendered) {
        _private.renderHTMLForContent(_content.elem, _content.path);
      }
    }

    // 触发选项卡切换事件
    utils.isFunction(config.onChanged) && config.onChanged(layid);
    /** 
     * 处理样式切换
     */
    function handle() {
      // 切换对应的title item
      _that.addClass('layui-this')
        .siblings().removeClass('layui-this');

      if (_that[0].offsetLeft > (_that[0].offsetWidth + _that.parents('div.kit-tab').width())) {
        _that.parent('ul.kit-tab-title').css('left', -_that[0].offsetLeft - _that[0].offsetWidth + _that.parents('div.kit-tab').width())
      }
      // _that.parent('ul.kit-tab-title').css('left', -_that[0].offsetLeft);

      // console.log(_that);
      // console.log(_that[0].offsetLeft);
      // console.log(_that[0].offsetWidth);
      // console.log('div.kit-tab:' + _that.parents('div.kit-tab').width());
      // console.log('div.kit-tabs:' + _that.parents('div.kit-tabs')[0].offsetWidth);

      // 切换对应的content item
      _private.findContent(layid)
        .addClass('layui-show')
        .siblings().removeClass('layui-show');
      // 切换对应的tools item
      _private.findTools(layid)
        .addClass('layui-this')
        .siblings().removeClass('layui-this');

      var _content = _private.getContent(layid);
      // 设置浏览器地址显示
      utils.setUrlState(_content.path, _content.path);
    }
  }
  Tabs.prototype.switchByPath = function(path) {
    var that = this;
    var _title = _private.findTitleByPath(path);
    if (_title.length > 0) {
      that.switch(_title.attr('lay-id'));
    }
  }
  Tabs.prototype.exists = function(layid) {
    return _private.findTitle(layid).length > 0;
  }
  Tabs.prototype.existsByPath = function(path) {
    return _private.findTitleByPath(path).length > 0;
  }
  Tabs.prototype.get = function(layid) {
    var that = this;
    if (!that.exists(layid))
      return null;
    var _title = _private.findTitle(layid);
    var title = _title.children('span').text();
    var path = _title.attr('data-path');
    var _content = _private.getContent(layid);
    return {
      id: layid,
      title: title,
      path: path,
      _content: _content
    };
  }
  Tabs.prototype.getByPath = function(path) {
    var that = this;
    if (!that.existsByPath(path))
      return null;
    var _title = _private.findTitleByPath(path);
    var title = _title.children('span').text();
    var layid = _title.attr('lay-id');
    return {
      id: layid,
      title: title,
      path: path
    };
  }
  Tabs.prototype.getCurrId = function() {
    return _private.getCurrId();
  };
  Tabs.prototype.init = function() {
    var that = this;
    _private.initCaches(that);
    return that;
  };
  /**
   * 刷新指定的选项卡，如果参数为空则刷新当前的选项卡
   * @param {*} layid 
   */
  Tabs.prototype.refresh = function(layid) {
    layid = layid || _private.getCurrId();
    var _content = _private.getContent(layid);
    _private.renderHTMLForContent(_content.elem, _content.path);
  };

  var _private = {
    renderHTMLForContent(_container, path) {
      route.render(path, _container, function() {
        // 将状态更新为已渲染
        _container.attr('data-rendered', 'true');
      });
    },
    prevHandler: function() {
      // prev event
      $(PREV).off('click').on('click', function() {
        var tabsLeft = tabsTitle[0].style.left;
        var left = parseInt(tabsLeft.substr(0, tabsLeft.indexOf('px')));
        if (left === 0) {
          return;
        } else {
          left += $(TABS).width();
          left = left > 0 ? 0 : left;
          tabsTitle.animate({
            'left': left + 'px'
          });
        }
      });
    },
    nextHandler: function() {
      // next event
      $(NEXT).off('click').on('click', function() {
        var tabsLeft = tabsTitle[0].style.left;
        var left = parseInt(tabsLeft.substr(0, tabsLeft.indexOf('px')));

        var tabsWidth = $(TABS).width();
        var liCountWidth = -18;
        tabsTitle.children('li').each(function() {
          var width = $(this).width();
          liCountWidth += (width + 48);
        });
        if (tabsWidth < liCountWidth && (left - tabsWidth) > -liCountWidth) {
          left = (left - tabsWidth) >= 0 ? 0 : (left - tabsWidth);

          tabsTitle.animate({
            'left': left + 'px'
          });
        }
      });
    },
    toolHandler: function() {
      $(TOOLS).off('click').on('click', function(e) {
        layui.stope(e);
        $(TOOLSBOX).show();
        $(document).one('click', function() {
          $(TOOLSBOX).hide();
        });
      });
    },
    toolBoxHandler: function(tabs) {
      var that = this;
      $(TOOLSBOX).find('li.kit-item').each(function() {
        var _that = $(this);
        var action = _that.data('action');
        var currId = _that.attr('lay-id');
        _that.off('click').on('click', function() {
          var layid = that.getCurrId();
          switch (action) {
            case 'closeOther':
              tabsTitle.find('li:not("[lay-id=' + layid + ']")').each(function(i, e) {
                var id = $(this).attr('lay-id');
                if (i !== 0) {
                  tabs.remove(id);
                }
              });
              break;
            case 'closeAll':
              tabsTitle.find('li:first-child').siblings().each(function() {
                var id = $(this).attr('lay-id');
                tabs.remove(id);
              });
              break;
            case 'refresh':
              var _c = _private.getContent(layid);
              _private.renderHTMLForContent(_c.elem, _c.path);
              break;
            default:
              var _content = _private.getContent(currId);
              if (!_content.isRendered) {
                _private.renderHTMLForContent(_content.elem, _content.path);
              }
              tabs.switch(currId);
              break;
          }
          $(TOOLSBOX).hide();
        });
      });
    },
    initCaches: function(_that) {
      var items = this.getCaches();
      _.forEach(items, function(item) {
        _that.add(item);
      });
    },
    findTitle: function(layid) {
      return tabsTitle.children('li[lay-id="' + layid + '"]');
    },
    findTitleByPath: function(path) {
      return tabsTitle.children('li[data-path="' + path + '"]');
    },
    findContent: function(layid) {
      return tabsContent.children('div.kit-tabs-item[lay-tab-id="' + layid + '"]');
    },
    getContent: function(layid) {
      var _content = this.findContent(layid);
      return {
        elem: _content,
        component: _content.attr('data-component'),
        path: _content.attr('data-path'),
        isRendered: _content.attr('data-rendered') === 'true',
      };
    },
    findTools: function(layid) {
      return toolsBox.find('li.kit-item[lay-id="' + layid + '"]');
    },
    getCurrId: function() {
      return tabsTitle.find('li.layui-this').attr('lay-id');
    },
    getCaches: function() {
      var items = storage.getItem(KITADMINTABS);
      if (items === null) {
        items = [];
      }
      return items;
    },
    setCaches: function(data) {
      storage.setItem(KITADMINTABS, data)
    }
  }

  var tabs = new Tabs();

  //输出tabs接口
  exports('tabs', tabs);
});