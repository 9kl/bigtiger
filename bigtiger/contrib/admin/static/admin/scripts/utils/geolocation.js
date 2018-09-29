/*
********************************************************
B.GeoLocation 获取地理位置          
********************************************************
*/

B.namespace('B.GeoLocation');
B.GeoLocation = (function () {

	var amapConfig = {},
		qmapConfig = {},
		getCurrentPositionByIp = function (successCallback, errorCallback, options) {
			/*
			 * 高德地图通过ip获取当前所在位置。
			 * http://lbs.amap.com/api/webservice/guide/api/ipconfig/ 
			 */
		
			var queryData = {'key' : amapConfig.key};
			$.getJSON(amapConfig.ipUrl, queryData, function(data) {
	        		if (data.status == 0) {
	        			errorCallback(data);
	        		} else {
	        			var rectangle = data.rectangle.split(';');
	        			var lt = rectangle[0].split(',');

	        			var coords = {
	        				'longitude': lt[0],
	        				'latitude': lt[1],
	        				'altitude': null,
	        				'accuracy': data.rectangle,
	        				'altitudeAccuracy': null,
	        				'heading': null,
	        				'speed': null
	        			};
	        			var position = {'coords': coords, 'timestamp': null, 'positionType': 'ip', 'latitude': coords.latitude, 'longitude': coords.longitude};
	        			successCallback(position);
	        		}
	        });
		},
		getCurrentPositionByQMap = function (successCallback, errorCallback, options) {
			var defConfig = {timeout: 8000, failTipFlag: true};
			options = $.extend({}, defConfig, options);
			
			var geo = new qq.maps.Geolocation(qmapConfig.key, qmapConfig.referer);
			geo.getLocation(function (position) {
				position = {'coords': position, 'timestamp': null, 'positionType': 'qmap', 'latitude': position.lat, 'longitude': position.lng};
				successCallback(position);
			}, function (error) {
				if (enableIpPosition) {
					console.warn('qmap获取当前位置坐标失败，将切换到通过ip地址获取当前位置坐标。');
					getCurrentPositionByIp(successCallback, errorCallback, options);
				} else {
					errorCallback(error);
				}
			}, options)
		},
		getCurrentPositionByH5 = function (successCallback, errorCallback, options) {
			var defConfig = {enableHighAcuracy: true, timeout : 5000, maximumAge: 3000, enableIpPosition: true};
			options = $.extend({}, defConfig, options);
			
			navigator.geolocation.getCurrentPosition(function (position) {
				var coords = position.coords,
					timestamp = position.timestamp;

				position = {'coords': coords, 'timestamp': timestamp, 'positionType': 'h5', 'latitude': coords.latitude, 'longitude': coords.longitude};
				successCallback(position);
			}, function (error) {
				if (enableIpPosition) {
					console.warn(error.message);
					console.warn('h5获取当前位置坐标失败，将切换到通过ip地址获取当前位置坐标。');
					getCurrentPositionByIp(successCallback, errorCallback, options);
				} else {
					errorCallback(error);
				}
			}, options);
		},
		regeo = function (latitude, longitude, successCallback, errorCallback, queryOptions) {			
			/*
			 * 高德地图根据经纬度获取所在位置。
			 * http://lbs.amap.com/api/webservice/guide/api/georegeo#regeo
			 */
			var location = [latitude, longitude];
			var defQuery = {'key': amapConfig.key, 'location': location.join(',')};
			queryOptions = $.extend({}, defQuery, queryOptions);
			
			$.getJSON(amapConfig.regeoUrl, queryOptions, function(data) {
	        		if (data.status == 0) {
	        			errorCallback(data);
	        		} else {
	        			successCallback(data.regeocode.formatted_address, data);
	        		}
	        });
		};
	
	var Constr = function (options) {
		var defConfig = {
			'amapKey': '895931e4900f8a5e7aa86042ff035030',
			'amapIpUrl': 'http://restapi.amap.com/v3/ip',
			'amapRegeoUrl': 'http://restapi.amap.com/v3/geocode/regeo',
			'qmapKey': 'YNRBZ-GVWKX-JQG4V-7YJUU-ZO67J-BXFVA',
			'qmapJsUrl': 'https://3gimg.qq.com/lightmap/components/geolocation/geolocation.min.js',
			'qmapReferer': 'xunxingtong',
			'enableIpPosition': true
		};

		options = $.extend({}, defConfig, options);
		amapConfig.key = options.amapKey;
		amapConfig.ipUrl = options.amapIpUrl;
		amapConfig.regeoUrl = options.amapRegeoUrl;
		qmapConfig.key = options.qmapKey;
		qmapConfig.jsUrl = options.qmapJsUrl;
		qmapConfig.referer = options.qmapReferer;
		enableIpPosition = options.enableIpPosition;
		
		var geo = {
			'getCurrentPosition': null
		};
		
		if (typeof qq === undefined) {
			console.warn('由于ios10.0情况下不支持http方式方式获取位置信息，建议用腾讯地图组件：');
			console.warn(qmapConfig.jsUrl);
		}
		
		if (typeof qq !== undefined) {
			geo.getCurrentPosition = getCurrentPositionByQMap;
		} else if (navigator.geolocation) {
			geo.getCurrentPosition = getCurrentPositionByH5;
		} else {
			get.getCurrentPosition = getCurrentPositionByIp;
		}
		
		this.getCurrentPosition = geo.getCurrentPosition;
		this.regeo = regeo;
	};
	
	Constr.prototype.getClientIp = function () {
		if (returnCitySN == undefined) {
			throw {
				'name': 'Error',
				'message': '添加<script src="http://pv.sohu.com/cityjson?ie=utf-8"></script>到head中'
			}
		}
		return returnCitySN.cip;
	};
	
	return Constr;
})();