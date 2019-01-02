layui.define(['layer', 'laytpl', 'utils', 'lodash'], function (exports) {
  const $ = layui.jquery,
    layer = layui.layer,
    laytpl = layui.laytpl,
    _ = layui.lodash,
    utils = layui.utils,
    _body = $('body');
  const Sidebar = function () {
    this.version = '1.0.0';
  };
  const tpl = [
    '<div class="kit-sidebar" style="{{d.direction}}:-{{d.width}};width:{{d.width}};" kit-sidebar="{{d.id}}">',
    '<div class="kit-sidebar-body">',
    '  <div class="layui-card">',
    '    <div class="layui-card-header">',
    '      <span class="nowrap" title="{{d.title}}">{{d.title}}</span>',
    '      <div class="kit-sidebar-reload" title="刷新">',
    '        <i class="layui-icon">&#xe669;</i>',
    '      </div>',
    '      <div class="kit-sidebar-close" title="关闭">',
    '        <i class="layui-icon">&#x1006;</i>',
    '      </div>',
    '    </div>',
    '    <div class="layui-card-body">',
    '      {{d.content}}',
    '    </div>',
    '  </div>',
    '</div>',
    '</div>'
  ].join('');
  const load_tpl = [
    '<div class="kit-sidebar-loading layui-anim layui-anim-fadein">',
    '    <div>',
    '        <i class="layui-icon layui-anim layui-anim-rotate layui-anim-loop">&#xe63e;</i>',
    '    </div>',
    '</div>',
  ]
  Sidebar.prototype.defaults = {
    elem: undefined, // 触发按钮
    content: '', // 内容
    shade: false, //显示遮盖层
    shadeClose: true, // 点击遮盖层关闭
    title: '未命名', //标题
    direction: 'right', //方向  支持left or right 
    dynamicRender: false, //是否动态渲染
    url: undefined, //远程地址
    width: '280px', //盒子的宽度
    done: undefined
  };
  Sidebar.prototype.render = function (options) {
    const that = this;
    // 克隆默认配置 -- 为了默认配置的干净
    let defaults = _.cloneDeep(that.defaults);
    $.extend(true, defaults, options);
    const config = defaults;
    // validate
    if (!utils.oneOf(config.direction, ['left', 'right'])) {
      utils.error('Sidebar error: [direction] property error,Only "left" or "right" .');
      return that;
    }
    const data = {
      title: config.title,
      id: utils.randomCode(),
      content: config.content,
      direction: config.direction,
      width: config.width
    };
    if (config.dynamicRender) {
      const url = config.url + '?version=' + new Date().getTime();
      utils.tplLoader(url, function (content) {
        data.content = content;
        _private.renderHTML(config, data);
      }, function (errMsg) {
        data.content = errMsg;
        _private.renderHTML(config, data);
      })
    } else {
      _private.renderHTML(config, data);
    }
    return that;
  };
  const _private = {
    renderHTML: function (config, data) {
      const _elem = $(config.elem);
      if (_elem.attr('kit-sidebar-target') !== undefined) {
        return;
      }
      laytpl(tpl).render(data, function (html) {
        // 添加遮盖层
        if (config.shade) {
          html = html + '<div class="kit-shade" kit-shade="' + data.id + '"></div>';
        }
        _body.append(html);
        typeof config.done === 'function' && config.done();
        // 处理事件
        const _sidebar = $('div[kit-sidebar="' + data.id + '"]');
        const _shade = $('div[kit-shade="' + data.id + '"]');
        _elem.attr('data-toggle', 'off');
        _elem.attr('kit-sidebar-target', 'true');
        _elem.on('click', function () {
          const toggle = $(this).data('toggle');
          switch (toggle) {
            case 'on':
              _sidebar.animate({
                [config.direction]: '-' + config.width
              });
              _shade.hide();
              $(this).data('toggle', 'off');
              break;
            case 'off':
              _sidebar.animate({
                [config.direction]: '0px'
              });
              _shade.show();
              $(this).data('toggle', 'on');
              break;
          }
        });
        // 如果是elem为object 则直接触发事件
        if (typeof config.elem === 'object') {
          _elem.click();
        }
        // 遮盖层点击关闭
        config.shadeClose && _shade.on('click', function () {
          _elem.click();
        });
        // 绑定刷新事件
        _sidebar.find('.kit-sidebar-reload').on('click', function () {
          const _that = this;
          if (config.dynamicRender) {
            // 显示加载层
            _private.showLoading(_sidebar);
            const url = config.url + '?version=' + new Date().getTime();
            utils.tplLoader(url, function (data) {
              $(_that).parent().next('.layui-card-body').html(data);
              // 关闭加载层
              _private.hideLoading(_sidebar);
            }, function (errMsg) {
              $(_that).parent().next('.layui-card-body').html('Loading error:' + errMsg);
              // 关闭加载层
              _private.hideLoading(_sidebar);
            })
          }
        });
        // 绑定关闭事件
        _sidebar.find('.kit-sidebar-close').on('click', function () {
          _elem.click();
        });
      });
    },
    // 显示加载层
    showLoading: function (_sidebar) { //fadein
      _sidebar.append(load_tpl.join(''));
    },
    // 移除加载层
    hideLoading: function (_sidebar) {
      setTimeout(function () {
        const _load = _sidebar.find('.kit-sidebar-loading');
        _load.addClass('layui-anim-fadeout');
        setTimeout(function () {
          _load.remove();
        }, 300);
      }, 500);
    }
  };
  const sidebar = new Sidebar();
  //输出sidebar接口
  exports('sidebar', sidebar);
});