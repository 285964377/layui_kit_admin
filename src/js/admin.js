var mods = [
  'element', 'sidebar', 'mockjs', 'select',
  'tabs', 'menu', 'route', 'utils', 'component', 'kit'
];

layui.define(mods, function(exports) {
  var element = layui.element,
    utils = layui.utils,
    $ = layui.jquery,
    _ = layui.lodash,
    route = layui.route,
    tabs = layui.tabs,
    layer = layui.layer,
    menu = layui.menu,
    component = layui.component,
    kit = layui.kit;


  var Admin = function() {
    this.config = {
      elem: '#app',
      loadType: 'SPA'
    };
    this.version = '1.0.0';
  };

  Admin.prototype.ready = function(callback) {
    var that = this,
      config = that.config;

    // 初始化加载方式
    var getItem = utils.localStorage.getItem;
    var setting = getItem("KITADMIN_SETTING_LOADTYPE");
    if (setting !== null && setting.loadType !== undefined) {
      config.loadType = setting.loadType;
    }

    kit.set({
      type: config.loadType
    }).init();

    // 初始化路由
    _private.routeInit(config);
    // 初始化选项卡
    if (config.loadType === 'TABS') {
      _private.tabsInit();
    }
    // 初始化左侧菜单   -- 请先初始化选项卡再初始化菜单
    _private.menuInit(config);
    // 跳转至首页
    if (location.hash === '') {
      utils.setUrlState('主页', '#/');
    }

    // 处理 sidebar
    layui.sidebar.render({
      elem: '#ccleft',
      //content:'', 
      title: '这是左侧打开的栗子',
      shade: true,
      // shadeClose:false,
      direction: 'left',
      dynamicRender: true,
      url: 'views/table/teble2.html',
      width: '50%', //可以设置百分比和px
    });

    $('#cc').on('click', function() {
      var that = this;
      layui.sidebar.render({
        elem: that,
        //content:'', 
        title: '这是表单盒子',
        shade: true,
        // shadeClose:false,
        // direction: 'left'
        dynamicRender: true,
        url: 'views/form/index.html',
        width: '50%', //可以设置百分比和px
      });
    });
    // 监听头部右侧 nav
    component.on('nav(header_right)', function(_that) {
      var target = _that.elem.attr('kit-target');
      if (target === 'setting') {
        // 绑定sidebar
        layui.sidebar.render({
          elem: _that.elem,
          //content:'', 
          title: '设置',
          shade: true,
          // shadeClose:false,
          // direction: 'left'
          dynamicRender: true,
          url: 'views/setting.html',
          // width: '50%', //可以设置百分比和px
        });
      }
      if (target === 'help') {
        layer.alert('QQ群：248049395，616153456');
      }
    });

    // 注入mock
    layui.mockjs.inject(APIs);

    // 初始化渲染
    if (config.loadType === 'SPA') {
      route.render();
    }

    // 执行回调函数
    typeof callback === 'function' && callback();
  }

  var _private = {
    routeInit: function(config) {
      var that = this;
      // route.set({
      //   beforeRender: function (route) {
      //     if (!utils.oneOf(route.path, ['/user/table', '/user/table2', '/'])) {
      //       return {
      //         id: new Date().getTime(),
      //         name: 'Unauthorized',
      //         path: '/exception/403',
      //         component: 'views/exception/403.html'
      //       };
      //     }
      //     return route;
      //   }
      // });
      // 配置路由
      var routeOpts = {
        // name: 'kitadmin',
        r: [{
          path: '/user/index',
          component: '/views/user/index.html',
          name: '用户列表',
          children: [{
            path: '/user/create',
            component: 'views/user/create.html',
            name: '新增用户',
          }, {
            path: '/user/edit',
            component: 'views/user/edit.html',
            name: '编辑用户',
          }]
        }],
        routes: [{
          path: '/layui/fly',
          component: 'https://fly.layui.com/',
          name: 'Fly',
          iframe: true
        }, {
          path: '/layui',
          component: 'http://www.layui.com/',
          name: 'Layui',
          iframe: true
        }, {
          path: '/baidu',
          component: 'https://www.baidu.com/',
          name: '百度一下',
          iframe: true
        }, {
          path: '/user/index',
          component: '/views/user/index.html',
          name: '用户列表'
        }, {
          path: '/user/create',
          component: 'views/user/create.html',
          name: '新增用户',
        }, {
          path: '/user/edit',
          component: 'views/user/edit.html',
          name: '编辑用户',
        }, {
          path: '/cascader',
          component: 'views/cascader/index.html',
          name: 'Cascader'
        }, {
          path: '/',
          component: 'views/app.html',
          name: '主页'
        }, {
          path: '/user/my',
          component: 'views/profile.html',
          name: '用户中心'
        }, {
          path: '/inputnumber',
          component: 'views/inputnumber.html',
          name: 'InputNumber'
        }, {
          path: '/layui/grid',
          component: 'views/layui/grid.html',
          name: 'Grid'
        }, {
          path: '/layui/button',
          component: 'views/layui/button.html',
          name: '按钮'
        }, {
          path: '/layui/form',
          component: 'views/layui/form.html',
          name: '表单'
        }, {
          path: '/layui/nav',
          component: 'views/layui/nav.html',
          name: '导航/面包屑'
        }, {
          path: '/layui/tab',
          component: 'views/layui/tab.html',
          name: '选项卡'
        }, {
          path: '/layui/progress',
          component: 'views/layui/progress.html',
          name: 'progress'
        }, {
          path: '/layui/panel',
          component: 'views/layui/panel.html',
          name: 'panel'
        }, {
          path: '/layui/badge',
          component: 'views/layui/badge.html',
          name: 'badge'
        }, {
          path: '/layui/timeline',
          component: 'views/layui/timeline.html',
          name: 'timeline'
        }, {
          path: '/layui/table-element',
          component: 'views/layui/table-element.html',
          name: 'table-element'
        }, {
          path: '/layui/anim',
          component: 'views/layui/anim.html',
          name: 'anim'
        }, {
          path: '/layui/layer',
          component: 'views/layui/layer.html',
          name: 'layer'
        }, {
          path: '/layui/laydate',
          component: 'views/layui/laydate.html',
          name: 'laydate'
        }, {
          path: '/layui/table',
          component: 'views/layui/table.html',
          name: 'table'
        }, {
          path: '/layui/laypage',
          component: 'views/layui/laypage.html',
          name: 'laypage'
        }, {
          path: '/layui/upload',
          component: 'views/layui/upload.html',
          name: 'upload'
        }, {
          path: '/layui/carousel',
          component: 'views/layui/carousel.html',
          name: 'carousel'
        }, {
          path: '/layui/laytpl',
          component: 'views/layui/laytpl.html',
          name: 'laytpl'
        }, {
          path: '/layui/flow',
          component: 'views/layui/flow.html',
          name: 'flow'
        }, {
          path: '/layui/util',
          component: 'views/layui/util.html',
          name: 'util'
        }, {
          path: '/layui/code',
          component: 'views/layui/code.html',
          name: 'code'
        }, {
          path: '/user/table',
          component: '/views/table/teble.html',
          name: 'Table'
        }, {
          path: '/user/table2',
          component: '/views/table/teble2.html',
          name: '数据表格2'
        }, {
          path: '/user/table3',
          component: '/views/table/teble3.html',
          name: '数据表格3'
        }, {
          path: '/user/form',
          component: '/views/form/index.html',
          name: 'Form'
        }, {
          path: '/docs/mockjs',
          component: 'docs/mockjs.html',
          name: '拦截器(Mockjs)'
        }, {
          path: '/docs/menu',
          component: 'docs/menu.html',
          name: '左侧菜单(Menu)'
        }, {
          path: '/docs/route',
          component: 'docs/route.html',
          name: '路由配置(Route)'
        }, {
          path: '/docs/tabs',
          component: 'docs/tabs.html',
          name: '选项卡(Tabs)'
        }, {
          path: '/docs/utils',
          component: 'docs/utils.html',
          name: '工具包(Utils)'
        }, {
          path: '/views/select',
          component: 'views/select/index.html',
          name: 'Select'
        }, {
          path: '/exception/403',
          component: 'views/exception/403.html',
          name: '403'
        }, {
          path: '/exception/404',
          component: 'views/exception/404.html',
          name: '404'
        }, {
          path: '/exception/500',
          component: 'views/exception/500.html',
          name: '500'
        }]
      };
      if (config.loadType === 'TABS') {
        routeOpts.onChanged = function() {
          // 如果当前hash不存在选项卡列表中
          if (!tabs.existsByPath(location.hash)) {
            // 新增一个选项卡
            that.addTab(location.hash, new Date().getTime());
          } else {
            // 切换到已存在的选项卡
            tabs.switchByPath(location.hash);
          }
        }
      }
      // 设置路由
      route.setRoutes(routeOpts);
      return this;
    },
    addTab: function(href, layid) {
      var r = route.getRoute(href);
      if (r) {
        tabs.add({
          id: layid,
          title: r.name,
          path: href,
          component: r.component,
          rendered: false,
          icon: '&#xe62e;'
        });
      }
    },
    menuInit: function(config) {
      var that = this;
      // 配置menu
      menu.set({
        dynamicRender: false,
        isJump: config.loadType === 'SPA',
        onClicked: function(obj) {
          if (config.loadType === 'TABS') {
            if (!obj.hasChild) {
              var data = obj.data;
              var href = data.href;
              var layid = data.layid;
              that.addTab(href, layid);
            }
          }
        },
        elem: '#menu-box',
        remote: {
          url: '/api/getmenus',
          method: 'post'
        },
        cached: false
      }).render();
      return that;
    },
    tabsInit: function() {
      tabs.set({
        onChanged: function(layid) {
          // var tab = tabs.get(layid);
          // if (tab !== null) {
          //   utils.setUrlState(tab.title, tab.path);
          // }
        }
      }).render(function(obj) {
        // 如果只有首页的选项卡
        if (obj.isIndex) {
          route.render('#/');
        }
      });
    }
  }

  var admin = new Admin();
  admin.ready(function() {
    console.log('Init successed.');
  });

  //输出admin接口
  exports('admin', {});
});