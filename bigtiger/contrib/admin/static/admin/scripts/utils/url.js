/*
********************************************************
B.Url Url操作相关的工具函数
********************************************************
*/

B.namespace('B.Url');
B.Url.getAbsoluteUrl = (function() {
	/* 
	 * 获取url的绝对路径。
	*/
	var a;
	return function(url) {
		if(!a) a = document.createElement('a');
		a.href = url;

		return a.href;
		};
	}
)();

B.Url.getParentUrl = function () {
	/*
	 * 获取iframe 页面的父页面的URL。
	 * https://www.nczonline.net/blog/2013/04/16/getting-the-url-of-an-iframes-parent/
	 * 在chrome中支持window.location.ancestorOrigins[0]但是firefox不支持。
	*/
    var isInIframe = (parent !== window),
        parentUrl = null;

    if (isInIframe) {
        parentUrl = document.referrer;
    }
    return parentUrl;
};