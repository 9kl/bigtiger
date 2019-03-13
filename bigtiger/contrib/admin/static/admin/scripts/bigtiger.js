/*
********************************************************
B project global                          
********************************************************
*/

var B = B || {};
B.namespace = function (ns_string) {
    var parts = ns_string.split('.'),
        parent = B,
        i = 0;

    if (parts[0] === 'B') {
      parts = parts.slice(1);
    }

    for (i = 0; i < parts.length; i++) {
      if (typeof parent[parts[i]] === 'undefined') {
        parent[parts[i]] = {};
      }
      parent = parent[parts[i]];
    }
    return parent;
};

/*
********************************************************
B.Guid                             
********************************************************
*/
B.namespace('B.Guid');
B.Guid = (function(){
	var S4 = function () {
		return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	};
	
	var Constr = function () {
		this.newid = function () {
			return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
		};
	};
	return new Constr();
})();

/*
********************************************************
B.sl                              
********************************************************
*/
B.namespace('B.sl');
B.sl = (function () {
    var slInstance = null,
        slLoadedExtendFun = function () { //alert('slLoadedExtendFun');
        };

    return {
      silverlightLoad: function (sender, args) {
        try {
          var slControl = sender.getHost();
          if (slControl != null) {
            slInstance = slControl.Content.SL;

            if (typeof slLoadedExtendFun === 'function') {
              slLoadedExtendFun();
            }
          }
        }
        catch (ex) {
          alert("初始化SL组件失败，提示信息：" + ex.Message);
        }
      },
      getSLInstance: function () {
        return slInstance;
      }
    };
}());