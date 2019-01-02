layui.define(['layer', 'lodash', 'laytpl', 'utils'], function (exports) {
  var layer = layui.layer,
    $ = layui.jquery,
    _ = layui.lodash,
    laytpl = layui.laytpl,
    utils = layui.utils,
    _body = $('body');

  const SELECT = '.kit-select';
  const RENDER = '.kit-select-render';
  const INPUT = '.kit-select-input';

  const tpl_drop = [
    '<ul class="kit-select-dropdown layui-anim layui-anim-upbit" style="width:{{d.width}}px;top:{{d.top}}px;" kit-target="{{d.targetId}}">',
    '  <li class="kit-item">',
    '    <a href="javascript:;">#xxx</a>',
    '  </li>',
    '  <li class="kit-item">',
    '    <a href="javascript:;">#xxx</a>',
    '  </li>',
    '  <li class="kit-item">',
    '    <a href="javascript:;">#xxx</a>',
    '  </li>',
    '  <li class="kit-item">',
    '    <a href="javascript:;">#xxx</a>',
    '  </li>',
    '</ul>',
  ];
  const tpl = [
    '<div class="kit-select" kit-id="{{d.targetId}}">',
    '  <div class="kit-select-render">',
    '    <div class="kit-select-input">',
    '      <ul class="kit-select-tags">',
    '        <li class="kit-item">',
    '          <a href="javascript:;">',
    '            <span>#1xx</span>',
    '            <i class="layui-icon">&#x1006;</i>',
    '          </a>',
    '        </li>',
    '        <li class="kit-item">',
    '          <input type="text" />',
    '        </li>',
    '      </ul>',
    '    </div>',
    '  </div>',
    '</div>',
  ];

  class Select {
    constructor() {
      this.config = {

      };
    }
    render(filter) {
      const _selector = filter === undefined ?
        $('select.kit-select-target') :
        $('select.kit-select-target[lay-filter=' + filter + ']');

      _selector.each(function () {
        const _that = $(this);
        const targetId = utils.randomCode();
        this.id = targetId;
        this.style.display = 'none';
        console.log(_that);
        const { multiple } = this;
        console.log(multiple);
        laytpl(tpl.join('')).render({
          targetId
        }, (html) => {
          _that.after(html);
          const _select = $('.kit-select[kit-id=' + targetId + ']')
          const width = _select.width();
          const { clientHeight } = _select[0];
          console.log(_select);
          _select.find(INPUT).on('click', function (e) {
            layui.stope(e);
            const _input = $(this).find('input');
            _input.focus();
            _input.on('input propertychange', function (e) {
              layui.stope(e);
              const _this = $(this);
              const len = _this.val().length;
              $(this).width(len * 8);
            })
            const drop = $('.kit-select-dropdown[kit-target=' + targetId + ']');
            const hasDrop = drop.length > 0;
            if (!hasDrop) {
              laytpl(tpl_drop.join('')).render({
                targetId, width,
                top: clientHeight + 2
              }, (html) => {
                _select.find(RENDER).append(html);
              });
            } else {
              drop.show();
            }
            $(document).on('click', function () {
              $('.kit-select-dropdown[kit-target=' + targetId + ']').hide();
              $(this).off('click');
            });
          });
        });
        // options 
        let opts = [];
        _.forEach(this.children, (opt, index) => {
          opts.push({
            value: opt.value,
            text: opt.innerText
          });
        });
        $(this).on('change', function () {
          console.log('cc');
        });
      });
      console.log('cccc');
    };
  }

  const select = new Select();

  //输出utils接口
  exports('select', select);
});