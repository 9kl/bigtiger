var app = app || {};

app.weatherData = (function() {
    var _ele = null,
        _template = null;

    var Constr = function() {
        _ele = $('#weather');
        _template = _.template($('#weather-template').html());
        
        this.refresh = function() {
                var xhr = new XMLHttpRequest();
                xhr.responseType='json';
                xhr.onreadystatechange = function() {
                    if (xhr.readyState != 4) {
                        return;
                    }
                    
                    if (xhr.status == 200) {
                        var data = xhr.response;
                        if (data) {
                            _ele.html(_template({'day': data.results[0].weather_data[0], 'day1': data.results[0].weather_data[1], 'day2': data.results[0].weather_data[2]}));
                        }
                    }
                };
                xhr.open('GET', '/admin/baidu_weather/');
                xhr.send();
        };
    };
    return Constr;
}());

// 内容区域高度管理
app.mainWindow = (function() {
    var _gridResizeFun = null,
        _mainResizeFun = null;

    var onMainWinResize = function() {
        var winHeight = $(window).height();

        if (typeof _gridResizeFun === 'function') {
            var h = winHeight - app.ui.header_height - app.ui.main_content_padding[0] - app.ui.main_content_padding[2] - app.ui.box_title;
            _gridResizeFun(h)
        }

        if (typeof _mainResizeFun === 'function') {
            var h = winHeight - app.ui.header_height - app.ui.main_content_padding[0] - app.ui.main_content_padding[2];
            _mainResizeFun(h);
        }
    };

    var Constr = function() {
        $(window).resize(onMainWinResize);

        this.gridResize = function(func) {
            _gridResizeFun = func;
            onMainWinResize();

        };

        this.mainResize = function(func) {
            _mainResizeFun = func;
            onMainWinResize();
        };

        this.clear = function() {
            _gridResizeFun = null;
            _mainResizeFun = null;
        };
    };

    return new Constr();
})();

app.menus = (function() {
    var find = function(menuId, menuItems) {
            var menuItem,
                max = menuItems.length,
                i = 0;

            for (i; i < max; i++) {
                menuItem = menuItems[i];
                if (menuId === menuItem.Id) {
                    return menuItem;
                } else if (menuItem.childs !== undefined) {
                    var item = findMenu(menuId, menuItem.childs);
                    if (item !== null) {
                        return item;
                    }
                }
            };
            return null;
        },
        treeFind = function(childs, menuId, depth) {
            var item = null;

            for (var i = childs.length - 1; i >= 0; i--) {
                item = childs[i];
                if (item.id === menuId) {
                    return item;
                }

                if (item.depth !== depth && item.childs !== undefined) {
                    var result = treeFind(item.childs, menuId, depth);
                    if (result !== undefined)
                        return result;
                }
            }
        },
        children = function(menuId, menuItems) {
            var menuItem,
                max = menuItems.length,
                i = 0;

            for (i; i < max; i++) {
                menuItem = menuItems[i];
                if (menuId === menuItem.Id) {
                    return menuItem;
                }
            };
            return null;
        };

    var Constr = function() {
        this.getMenu = function(menuId, depth) {
            depth = depth || 1;

            if (depth === 0)
                return app.rootMenu;

            var childs = app.rootMenu.childs;
            var menuItem = treeFind(childs, menuId, depth);
            return menuItem;
        };
    };

    return new Constr;
}());

var TopbarView = Backbone.View.extend({
    el: '.topbar-nav-list',

    events: {
        'click li': 'link'
    },

    initialize: function() {},

    render: function() {},

    link: function(e) {
        e.preventDefault();

        var thatEl = $(e.currentTarget),
            menuId = thatEl.attr('data-menu'),
            menuDepth = thatEl.attr('data-depth'),
            mainId = thatEl.attr('data-main');

        var menuItem = app.menus.getMenu(menuId, menuDepth);
        // 1级菜单的ID
        var mainMenuItem = app.menus.getMenu(mainId, 1);

        // 设置2级菜单
        app.views.sidebarView.show(mainMenuItem.childs);
        // 1级菜单选中
        app.views.menuView.setSelected(mainId);
        // 2级菜单选中
        app.views.sidebarView.setSelected(menuId);
        // link到菜单
        app.views.productView.link(menuItem);
    }
});

var MenuView = Backbone.View.extend({
    el: '.header_nav',

    events: {
        'click li': 'selected'
    },

    initialize: function() {
        this.$ifrInner = $('#ifrInner');
        this.$lis = this.$('ul li');
        this.render();
    },

    render: function() {
        var menuId = this.getSelected();
        this.link(menuId);
        return this;
    },

    selected: function(e) {
        e.preventDefault();
        var that = $(e.currentTarget);
        var menuId = that.attr('data-menu');

        this.setSelected(menuId);
        this.link(menuId);
    },

    link: function(menuId) {
        var menuItem = app.menus.getMenu(menuId, 1);
        if (menuItem === null) {
            return;
        }

        app.mainWindow.clear();
        app.views.productView.hideNav();

        if (menuItem.childs === undefined) {
            app.views.sidebarView.hide();
            app.views.productView.link(menuItem);
        } else {
            app.views.sidebarView.show(menuItem.childs);
            app.views.productView.show(menuItem);
        }
    },

    getSelected: function() {
        var menuId,
            domObj;

        this.$lis.each(function(i, domEle) {
            domObj = $(domEle);
            if (domObj.hasClass('selected')) {
                menuId = domObj.attr('data-menu');
            }
        });
        return menuId;
    },

    setSelected: function(menuId) {
        this.$lis.each(function(i, domEle) {
            if ($(domEle).attr('data-menu') !== menuId) {
                $(domEle).removeClass("selected");
            } else {
                $(domEle).addClass("selected");
            }
        });
    }
});

var SidebarView = Backbone.View.extend({
    el: '.sidebar',

    events: {
        'click .sidebar-fold': 'flod',
        'click .sidebar-title': 'navFlod',
        'click .nav-item': 'selected'
    },

    initialize: function() {
        this.$fold = this.$('.sidebar-fold');
        this.$inner = this.$('.sidebar-inner');
        this.$main = $('.viewFramework-body');

        this.template = _.template($('#sidebar-template').html());
    },

    render: function() {
        return this;
    },

    flod: function(e) {
        if (this.$main.hasClass('viewFramework-sidebar-full')) {
            this.$main.removeClass('viewFramework-sidebar-full');
            this.$main.addClass('viewFramework-sidebar-mini');
        } else {
            this.$main.removeClass('viewFramework-sidebar-mini');
            this.$main.addClass('viewFramework-sidebar-full');
        }

        if (window.hasOwnProperty('onMainWinResize')) {
            onMainWinResize();
        }
    },

    navFlod: function(e) {
        var obj = $(e.currentTarget),
            parentObj = obj.parent('.sidebar-nav');

        if (parentObj.hasClass('sidebar-nav-fold')) {
            parentObj.removeClass('sidebar-nav-fold');
        } else {
            parentObj.addClass('sidebar-nav-fold');
        }
    },

    selected: function(e) {
        e.preventDefault();

        var thatEl = $(e.currentTarget),
            menuId = thatEl.attr('data-menu'),
            menuDepth = thatEl.attr('data-depth');

        this.selectedMenuId(menuId, menuDepth);
    },

    selectedMenuId: function (menuId, menuDepth) {
        var menuItem = app.menus.getMenu(menuId, menuDepth);
        this.selectedMenuItem(menuItem);
    },

    selectedMenuItem: function (menuItem) {
        var menuId = menuItem.id,
            isChilds = menuItem.childs;

        if (isChilds) {
            // 4级菜单，内容页的nav导航菜单。如：设备信息的下级雨量监测站，水位监测站，视频监测站等。
            this.link(menuItem);
        } else {
            // 显示页面内容
            this.setSelected(menuId);
            this.linkUrl(menuItem);
        }
    },

    linkUrl: function(menuItem) {
        app.views.productView.hideNav();
        app.views.productView.link(menuItem);
    },

    link: function(menuItem) {
        this.setSelected(menuItem.id);
        app.views.productView.showNav(menuItem);
        // app.views.productView.link(menuItem, menuItem.menu_url);
        app.views.productView.link(menuItem);
    },

    show: function(menus) {
        this.$inner.html(this.template({ e: menus }));
        if (this.$main.hasClass('viewFramework-sidebar-none')) {
            this.$main.removeClass('viewFramework-sidebar-none');
            this.$main.addClass('viewFramework-sidebar-full');
        }
    },

    hide: function() {
        this.$main.removeClass('viewFramework-sidebar-full');
        this.$main.removeClass('viewFramework-sidebar-mini');
        this.$main.addClass('viewFramework-sidebar-none');
        this.$inner.empty();
    },

    setSelected: function(menuId) {
        this.$('.nav-item').each(function(i, domEle) {
            if ($(domEle).attr('data-menu') !== menuId) {
                $(domEle).removeClass("selected");
            } else {
                $(domEle).addClass("selected");
            }
        });
    }
});

var ProductView = Backbone.View.extend({
    el: '.viewFramework-product',

    events: {
        'click .product-item': 'productSelect',
        'click .product-nav-item': 'selected',
        'load #ifrInner': 'ifrInnerLoaded'
    },

    initialize: function() {
        this.template = _.template($('#product-template').html());
        this.navTemplate = _.template($('#product-nav-template').html());

        // this.full_template = _.template($('#product-full-template').html());
        this.$product = this.$('.product');
        this.$mainNav = this.$('.product-nav-main-scene');
        this.$subNav = this.$('.product-nav-sub-scene');
        this.$ifrInner = this.$('#ifrInner');
        this.iframe = document.getElementById("ifrInner");
    },

    selected: function(e) {
        // 四级菜单。
        e.preventDefault();

        var thatEl = $(e.currentTarget),
            menuId = thatEl.attr('data-menu'),
            menuDepth = thatEl.attr('data-depth');

        var menuItem = app.menus.getMenu(menuId, menuDepth);
        this.link(menuItem);
        this.setSelected(menuId);
    },

    setSelected: function(menuId) {
        this.$('.product-nav-item').each(function(i, domEle) {
            if ($(domEle).attr('data-menu') !== menuId) {
                $(domEle).removeClass("active");
            } else {
                $(domEle).addClass("active");
            }
        });
    },

    render: function() {

    },

    ifrInnerLoaded: function() {},

    productSelect: function(e) {
        // 重要菜单。
        e.preventDefault();

        var thatEl = $(e.currentTarget),
            menuId = thatEl.attr('data-menu'),
            menuDepth = thatEl.attr('data-depth');

        app.views.sidebarView.selectedMenuId(menuId, menuDepth);
    },

    link: function (menuItem, url, target, is_cache, is_cross) {
        // menuItem 不能为空，url, target, is_cache, is_cross用户覆盖menuItem的值。
        var $product = this.$product,
            menu_url = url || menuItem.menu_url_alias || menuItem.menu_url,
            menu_target = target || menuItem.menu_target,
            is_cache = is_cache || menuItem.is_cache,
            is_cross = is_cross || menuItem.is_cross;

        if (menu_target === 'iframe') {
            menu_url = '/admin/iframe/?url=' + menu_url;
        } else if (menu_target === 'iframe_scroll') {
            menu_url = '/admin/iframe_scroll/?url=' + menu_url;
        }

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) 
                return;

            $product.empty();
            if (xhr.status == 200) {
                $product.html(xhr.responseText);
            } else {
                $product.html(xhr.statusText);
            }
        };
        xhr.open('GET', menu_url);
        
        if (is_cross == 1) {
            xhr.withCredentials = true;
        }
        xhr.send();
    },

    showNav: function(menuItem) {
        this.$mainNav.html(this.navTemplate({ menuItem: menuItem }));
        if (!this.$el.hasClass('viewFramework-product-col-1')) {
            this.$el.addClass('viewFramework-product-col-1');
        }
    },

    hideNav: function() {
        if (this.$el.hasClass('viewFramework-product-col-1')) {
            this.$el.removeClass('viewFramework-product-col-1');
        }
    },
    show: function(menuItem) {
        // 点击头部一级菜单后，在product中现实该模块的功能介绍以及常用功能。
        var menuItems = [],
            childs1 = menuItem.childs,
            childs2 = null;

        // 获取所有叶子节点
        for (var m = 0, m_max = childs1.length; m < m_max; m++) {
            if (childs1[m].childs === undefined) {
                menuItems.push(childs1[m]);
            } else {
                childs2 = childs1[m].childs;
                for (var n = 0, n_max = childs2.length; n < n_max; n++) {
                    menuItems.push(childs2[n]);
                }
            }
        }
        
        // 显示特性和重要的菜单（叶子菜单少于5个则直接显示叶子菜单，否则显示重要的菜单）
        var feature = JSON.parse(menuItem.remark);
        if (menuItems.length < 5) {
            this.$product.html(this.template({ e: menuItem, lst: menuItems, feature: feature }));
        } else {
            var menuItems = _.filter(menuItems, function(item) { return item.is_important == 1; });
            this.$product.html(this.template({ e: menuItem, lst: menuItems, feature: feature }));
        }
        this.$ifrInner.hide();
    },

    hide: function() {

    },

    full: function() {

    },

    large: function() {

    },

    small: function() {

    }
});

var AppView = Backbone.View.extend({
    el: 'body',

    events: {},

    initialize: function() {

    },

    render: function() {
        return this;
    }
});