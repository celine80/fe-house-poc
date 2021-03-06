var env = {
	activate: function(api, apiPrototype) {
		env.config = api.config;
		env.api = apiPrototype;
		env.packageUtils = apiPrototype.packageUtils;
	},

	/**
	 * called by gulp or other compilation time tool
	 */
	_setup: function(config, packageUtils, buildUtils) {
		env.config = config;
		env.packageUtils = packageUtils;
		env.buildUtils = buildUtils;
	}
};
module.exports = env;
