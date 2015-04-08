cordova.define('loader', function(require, exports, module) {
	var cordova = require('cordova');


	function injectScript(url, onload, onerror) {
	    var script = document.createElement("script");
	    // onload fires even when script fails loads with an error.
	    script.onload = onload;
	    // onerror fires for malformed URLs.
	    script.onerror = onerror;
	    script.src = url;
	    document.head.appendChild(script);
	};

	function load(config, onload, onerror) {
		if (config.id in cordova.define.moduleMap) {
            onload();
        } else {
            injectScript(config.file, function() {
                if (config.id in cordova.define.moduleMap) {
                    onload();
                } else {
                    onerror();
                }
            }, function() {
                onerror();
            });
        };
	};

    function getConfigByService(service) {
        var moduleList = require("cordova/plugin_list");

        var config = null;

        for (var i = 0, max = moduleList.length; i < max; i++) {
            var clobbers = moduleList[i].clobbers || [];

            if (service.indexOf(clobbers) > -1) {
                config = {
                    file: moduleList[i].file,
                    id: moduleList[i].id
                };

                break;
            };
        };
        return config;
    };


    function exec(service, action, args) {

        var config = getConfigByService(service);

        if(!config) {
            throw "plugin " + service + " not found";
        };

        load(config, function() {

            var plugin = cordova.require(config.id);
            if (!(action in plugin)) {
                throw service + " plugin " + action + " not found";
            }

            // TODO: 防呆处理
            plugin[action](args);

        }, function() {
            throw "error when load " + config.file;
        });
    };

	module.exports = {
		exec: exec
	};
});
