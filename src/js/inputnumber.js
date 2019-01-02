layui.define(['jquery', 'laytpl'], function(exports) {
  var $ = layui.jquery,
    laytpl = layui.laytpl;

  var tpl = [
    '<div class="kit-inputnumber" kit-in-for="{{d.id}}" style="left:{{d.left}}px;">',
    '  <div class="kit-inputnumber-up"><i class="layui-icon">&#xe619;</i></div>',
    '  <div class="kit-inputnumber-down"><i class="layui-icon">&#xe61a;</i></div>',
    '</div>'
  ];

  var InputNumber = function() {
    this.config = {
      max: 1000000,
      min: 0,
      precision: 1,
      defaultType: 'integer',
      onClicked: undefined
    };
  }
  var UP = '.kit-inputnumber-up',
    DOWN = '.kit-inputnumber-down',
    IN = '.kit-inputnumber';
  InputNumber.prototype.set = function(options) {
    var that = this;
    $.extend(true, that.config, options);
    return that;
  };
  InputNumber.prototype.render = function() {
    var that = this,
      config = that.config;
    $('input[kit-target="inputnumber"]').each(function() {
      var _that = $(this);
      var rendered = _that.attr('data-rendered');
      if (!rendered) {
        // 随机id
        var id = _private.randomCode();
        laytpl(tpl.join('')).render({
          id: id,
          left: _that[0].offsetWidth - 28
        }, function(html) {
          var min = _that[0].min || config.min; // 读取最小值
          var max = _that[0].max || config.max; // 读取最大值
          var precision = _that.attr('kit-in-precision') || config.precision; //向量
          var type = _that.attr('kit-in-type') || config.defaultType;         //类型

          _that[0].id = id;
          _that.parent().append(html);
          _that.attr('data-rendered', 'true');

          var val = _that.val();
          if (_private.validate(val) == 0) {
            _that.val(0);
          }
          switch (config.defaultType) {
            case 'integer':
              if (parseInt(val) > parseInt(max)) {
                _that.val(max);
              }
              if (parseInt(val) < parseInt(min)) {
                _that.val(min);
              }
              break;
            case 'double':
              if (parseFloat(val) > parseFloat(max)) {
                _that.val(max);
              }
              if (parseFloat(val) < parseFloat(min)) {
                _that.val(min);
              }
              break;
          }
          // 监听事件
          var _in = $('div[kit-in-for="' + id + '"]');
          _in.find(UP).off('click').on('click', function() {
            var v = _private.validate(_that.val());
            if (config.defaultType === 'integer') {
              var c = parseInt(v);
              c += parseInt(precision);
              max = parseInt(max);
              if (c >= max)
                c = max;
              _that.val(c);
            }
            _private.isFunction(config.onClicked) && config.onClicked({
              elem: _that,
              value: v
            });
          });
          _in.find(DOWN).off('click').on('click', function() {
            var v = _private.validate(_that.val());
            if (config.defaultType === 'integer') {
              var c = parseInt(v);
              c -= parseInt(precision);
              min = parseInt(min);
              if (c <= min)
                c = min;
              _that.val(c);
            }
            _private.isFunction(config.onClicked) && config.onClicked({
              elem: _that,
              value: v
            });
          });
        });
      }
    });
  };
  var _private = {
    randomCode: function() {
      return Math.random().toString(36).substr(2);
    },
    validate: function(val) {
      if (!(val !== '' && _validate.isInteger(val) || _validate.isDouble(val))) {
        return 0;
      }
      return val;
    },
    isFunction: function(obj) {
      return typeof obj === 'function';
    }
  };
  var _validate = {
    isInteger: function(val) {
      return val.length != 0 && /^[-+]?\d*$/.test(val);
    },
    isDouble: function(val) {
      return val.length != 0 && /^[-\+]?\d+(\.\d+)?$/.test(val);
    }
  }

  var inputNumber = new InputNumber();

  exports('inputnumber', inputNumber);
});