/*
********************************************************
B.CascadeSelect html中select控件级联选择              
********************************************************
*/

B.namespace('B.CascadeSelect');
B.CascadeSelect = (function () {
	
	var Constr = function (options) {
		var defConfig = {'srcId': '', 'tarId': '', 'url': '', 'changed': null, 'dataFilter': null};
		options = $.extend({}, defConfig, options);
		
		var srcId = options.srcId,
			tarId = options.tarId,
			url = options.url,
			changed = options.changed,
			dataFilter = options.dataFilter;

		if (srcId.indexOf('#') === -1) {
			srcId = '#' + srcId;
		}

		if (tarId.indexOf('#') === -1) {
			tarId = '#' + tarId;
		}

		if (typeof url !== 'string' || url === '') { 
			throw {
				name: 'Error',
				message: 'url参数错误'
			};	
		}

		var $srcEl = $(srcId),
			$tarEl = $(tarId),
			that = this;

		$srcEl.change(function () {
			that.change();
		});

		this.change = function () {
			// 获取源select的选择项，然后调用远程数据访问，设置子select的选项，并执行回调函数。
			var selectedVal = $srcEl.children('option:selected').val(),
				tarSelectedVal = $tarEl.children('option:selected').val(),
				query = {'dscode': selectedVal};
				
			$.getJSON(url, query, function(data){
  				$tarEl.empty();
  				
  				if (typeof dataFilter === 'function') {
  					data = dataFilter(data);
  				}

  				var item = null;
  				for (var i = 0, max = data.length; i < max; i++) {
  					item = data[i];
  					if (tarSelectedVal == item.Code) {
  						$('<option selected="selected"></option>').val(item.Code).text(item.Text).appendTo($tarEl);
  					} else {
  						$('<option></option>').val(item.Code).text(item.Text).appendTo($tarEl);
  					}
  				}

  				if (typeof changed === 'function') {
  					changed(data);
				}
			});
		};
	};
	return Constr;
})();