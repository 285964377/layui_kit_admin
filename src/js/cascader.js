/**
  扩展一个cascader模块
**/

layui.define(['layer', 'utils', 'axios', 'laytpl'], function(exports) { //提示：模块也可以依赖其它模块，如：layui.define('layer', callback);
  const MOD_NAME = 'cascader',
    $ = layui.jquery,
    layer = layui.layer,
    utils = layui.utils,
    _ = layui.lodash,
    laytpl = layui.laytpl;

  const _private = {
    tpl: [
      '<div class="kit-cascader" kit-filter="{{d.filter}}">',
      '  <div class="kit-cascader-title">',
      '    <span class="kit-cascader-show">{{d.placeholder}}</span>',
      '    <div class="kit-icon">',
      '      <i class="layui-icon">&#xe61a;</i>',
      '    </div>',
      '  </div>',
      '  {{d.content}}',
      '</div>'
    ],
    // 渲染HTML
    renderHTML: function(opts) {
      var that = this;
      const { _elem, data, callback, filter } = opts;

      var temps = ['<ul class="kit-cascader-list">'];
      var pid = 0; //一级菜单pid为0 ，这是一个约定
      that.recursion(temps, data, pid);
      // 读取input属性
      const { placeholder } = _elem[0];
      _elem.attr('lay-filter', filter);
      if (temps.length > 0) {
        // 闭合ul
        temps.push('</ul>');
        // 渲染页面
        laytpl(that.tpl.join('')).render({
          placeholder: placeholder === '' ? 'Please select' : placeholder,
          content: temps.join(''),
          filter
        }, function(html) {
          _elem.after(html);
          utils.isFunction(callback) && callback();
        });
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
          temp.push('<li class="kit-item" data-value="' + item.value + '" data-label="' + item.label + '">');
          temp.push('<a href="javascript:;">');
          temp.push('<span>' + item.label + '</span>');
          var children = item.children;
          if (children !== undefined && children !== null && children.length > 0) {
            temp.push('<i class="layui-icon">&#xe602;</i>');
          }
          temp.push('</a>');
          if (children !== undefined && children !== null && children.length > 0) {
            temp.push('<ul class="kit-cascader-child layui-anim layui-anim-fadein">');
            that.recursion(temp, children, item.id);
            temp.push('</ul>');
          }
          temp.push('</li>');
        });
      }
    },
  };

  class Cascader {
    constructor() {
      this.config = {
        filter: utils.randomCode()
      };
    }
    set(options) {
      $.extend(true, this.config, options);
      return this;
    }
    render(opts) {
      const that = this;
      const config = that.config;
      const options = {
        elem: undefined,
        defaultValues: [],
        disabled: false,
        data: [],
        onChange: undefined,
        onClick: undefined,
        filter: config.filter
      };
      $.extend(true, options, opts);
      if (options.elem === undefined) {
        console.warn('Cascader Error:请为cascader绑定elem.');
        return;
      } else if (utils.isString(options.elem) && $(options.elem).length === 0) {
        console.warn('Cascader Error:请为cascader绑定elem.');
        return;
      } else if (utils.isObject(options.elem) && options.elem.length === 0) {
        console.warn('Cascader Error:请为cascader绑定elem.');
        return;
      } else {
        options.elem = utils.isString(options.elem) ? $(options.elem) : options.elem;
      }
      if (options.elem.length > 1) {
        console.warn('Cascader Error:一次只能渲染一个Cascader.');
        return;
      }
      _private.renderHTML({
        filter: options.filter,
        _elem: options.elem,
        data: [{
          id: 1,
          pid: 0,
          value: '440000',
          label: '广东省',
          children: [{
            id: 2,
            pid: 1,
            value: '440100',
            label: '广州市',
            children: [{
              id: 3,
              pid: 2,
              value: '440106',
              label: '天河区'
            }, {
              id: 4,
              pid: 2,
              value: '440104',
              label: '越秀区'
            }, {
              id: 5,
              pid: 2,
              value: '440105',
              label: '海珠区'
            }]
          }]
        }, {
          id: 11,
          pid: 0,
          value: '510000',
          label: '四川省',
          children: [{
            id: 22,
            pid: 11,
            value: '510100',
            label: '成都市',
            children: [{
              id: 33,
              pid: 22,
              value: '510101',
              label: '市辖区'
            }, {
              id: 44,
              pid: 22,
              value: '510104',
              label: '锦江区'
            }, {
              id: 55,
              pid: 22,
              value: '510105',
              label: '青羊区'
            }]
          }]
        }],
        callback: function() {
          that.bind(options);
        }
      });
    }
    bind(options) {
      var _elem = $('*[kit-filter=' + options.filter + ']');
      var _input = _elem.find('.kit-cascader-show');
      var _cascaderBox = undefined;
      _input.on('click', function(e) {
        layui.stope(e);
        _cascaderBox = _elem.find('.kit-cascader-list');
        if (!_cascaderBox.hasClass('layui-show')) {
          _cascaderBox.addClass('layui-show');
          $(document).one('click', function(e1) {
            layui.stope(e1);
            _cascaderBox.removeClass('layui-show');
          });
        }
      });
      // 处理选项点击事件
      _elem.find('.kit-item').on('click', function(e) {
        layui.stope(e);
        let selectedData = {
          values: [],
          labels: [],
          objs: []
        };
        // 获取当前点击的DOM
        const _item = $(this);
        // 选中当前DOM 移除其他DOM样式
        _item.addClass('layui-this').siblings().removeClass('layui-this');
        // 获取该节点下的子节点
        const _child = _item.children('.kit-cascader-child');
        // 是否存在子节点
        const hasChildren = _child.length > 0;
        if (hasChildren) {
          // 移除其他兄弟节点的选中状态
          _item.siblings().find('.kit-item').removeClass('layui-this');
          // 移除其他兄弟节点的显示状态
          _item.siblings().find('.kit-cascader-child').removeClass('layui-show');
          // 显示当前子节点
          _child.addClass('layui-show');
        } else {
          // 读取选择的数据
          _elem.find('li.layui-this').each(function(i, e) {
            const value = $(this).attr('data-value');
            const label = $(this).attr('data-label');
            selectedData.values.push(value);
            selectedData.labels.push(label);
            selectedData.objs.push({
              value,
              label
            });
          });
          // 隐藏
          _cascaderBox && _cascaderBox.removeClass('layui-show');
          // 赋值
          _input.html(selectedData.labels.join('/'));
          options.elem.val(selectedData.values.join(','));
          //执行事件
          utils.isFunction(options.onChange) && options.onChange({
            elem: options.elem,
            obj: selectedData
          });
        }
        //执行事件
        utils.isFunction(options.onClick) && options.onClick({
          elem: _item,
          obj: {
            value: _item.attr('data-value'),
            label: _item.attr('data-label')
          }
        });
      });
    }
    hello() {
      layer.msg('cccc');
    }
    on(events, callback) {
      return layui.onevent.call(this, MOD_NAME, events, callback);
    }
  }

  // var cascader = new Cascader();

  //输出test接口
  exports(MOD_NAME, Cascader);
});