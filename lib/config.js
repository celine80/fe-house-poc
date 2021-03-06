var log = require('log4js').getLogger('lib.config');
var _ = require('lodash');
var fs = require('fs');
var Path = require('path');
var yamljs = require('yamljs');
var argv = require('yargs').argv;
require('yamlify/register');

var rootPath = argv.cwd ? argv.cwd : process.cwd();
var setting;
var localDisabled = false;
var localConfigPath = Path.join(rootPath, 'config.local.yaml');

var Promise = require('bluebird');
Promise.defer = defer;

function defer() {
	var resolve, reject;
	var promise = new Promise(function() {
		resolve = arguments[0];
		reject = arguments[1];
	});
	return {
		resolve: resolve,
		reject: reject,
		promise: promise
	};
}

module.exports = function() {
	if (!setting) {
		load();
	}
	return setting;
};

module.exports.disableLocal = function() {
	localDisabled = true;
	setting = {};
	load();
};

module.exports.reload = function reload() {
	setting = {};
	load();
	return setting;
};

module.exports.set = function(name, value) {
	setting[name] = value;
	return setting;
};

var log4jsConfig = Path.join(rootPath, 'log4js.json');
if (!fs.existsSync(log4jsConfig)) {
	log4jsConfig = Path.join(__dirname, '..', 'log4js.json');
}
require('log4js').configure(log4jsConfig);

/**
 * load configuration from config.yaml.
 * Besides those properties in config.yaml, there are extra available properties:
 * - rootPath {string} root path, normally it is identical as process.cwd()
 * - dependencyMode {boolean} true if it is running as dependency in node_modules folder
 * - internalRecipeFolderPath {string} the internal recipe folder path, it will be
 * 		resolved to relative path to this platform package folder, even it is under node_modules
 * 		folder loaded as dependency
 */
function load() {
	log.debug('root Path: ' + rootPath);
	setting = setting || {};
	// some extra config properties
	_.assign(setting, {
			rootPath: rootPath,
			// It is running as dependency in node_modules folder
			dependencyMode: Path.resolve(__dirname, '..') !== process.cwd(),
		},
		require('../config.yaml'));

	log.info('Running this platform as dependency: ' + setting.dependencyMode);

	if (setting.dependencyMode && fs.existsSync('config.yaml')) {
		_.assign(setting, yamljs.parse(fs.readFileSync('config.yaml', 'utf8')));
	}

	if (!localDisabled && fs.existsSync(localConfigPath)) {
		_.assign(setting, yamljs.parse(fs.readFileSync(localConfigPath, 'utf8')));
	}

	setting.internalRecipeFolderPath = Path.resolve(__dirname, '..', setting.internalRecipeFolder);
	if (setting.recipeFolder) {
		setting.recipeFolderPath = Path.resolve(rootPath, setting.recipeFolder);
	}
	if (setting.devMode) {
		log.info('Developer mode');
	} else {
		log.info('Production mode');
	}
	validateConfig();

	var defaultEntrySet = setting.defaultEntrySet = {};
	if (setting.defaultEntryPackages) {
		[].concat(setting.defaultEntryPackages).forEach(function(entryFile) {
			defaultEntrySet[entryFile] = true;
		});
	}
	setting.port = normalizePort(setting.port);
	return setting;
}

function validateConfig() {
	if (!setting.nodeRoutePath) {
		log.error('"nodeRoutePath" must be set in config.yaml');
		throw new Error('Invalid configuration');
	}

	['staticAssetsURL',
	'nodeRoutePath',
	'compiledDir'].forEach(function(prop) {
		setting[prop] = trimTailSlash(setting[prop]);
	});

	var contextMapping = setting.packageContextPathMapping;
	if (contextMapping) {
		_.forOwn(contextMapping, function(path, key) {
			contextMapping[key] = trimTailSlash(path);
		});
	}
}

function trimTailSlash(url) {
	if (url === '/') {
		return url;
	}
	return _.endsWith(url, '/') ? url.substring(0, url.length - 1) : url;
}

function normalizePort(val) {
	var port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return false;
}
