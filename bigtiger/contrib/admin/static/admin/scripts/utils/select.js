/*
********************************************************
B.Select 选择处理，主要是实现获取选择的项，及自动的单选  
********************************************************
*/

B.namespace('B.Select');
B.Select = (function () {
	var Constr = function (wrapper, selectItem, options) {
		var defConfig = {'selectedClassName': 'selected', 'selected': null};
		options = $.extend({}, defConfig, options);
		
		var $wrapper = $(wrapper);
		var getItems = function () {
				return $wrapper.find(selectItem);
			},
			each = function (each_callback) {
				var items = getItems();
				items.each(function () {
					each_callback($(this));
				});
			},
			cleanSelected = function () {
				each(function (item) {
					item.removeClass(options.selectedClassName);
				});
			},
			selectItemClick = (function () {
				var _onClick = function (itme) {
					cleanSelected();
					itme.addClass(options.selectedClassName);
				};
				
				if (typeof options.selected === 'function') {
					return function (item) {
						_onClick(item);
						options.selected(item);
					};
				} else {
					return _onClick;
				}
			})();
			
		$wrapper.on('click', selectItem, function () {
			selectItemClick.call(this, $(this));
		});

		this.getSelectedItem = function () {
			var selectedItem = null;
			each(function (item) {
				var className = item.attr('class');
				if (className.indexOf(options.selectedClassName) != -1) {
					selectedItem = item;
					return;
				}
			});
			return selectedItem;
		};
	};
	return Constr;
})();