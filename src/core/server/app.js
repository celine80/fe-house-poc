var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var engines = require('consolidate');
var swig = require('swig');

module.exports = {
	activate: function(Api) {
		var app = createApp(Api.prototype.config());
		require('./setupApi')(Api, app);
		Api.prototype.eventBus.on('afterActivate', function() {
			setupErrorHandling(app);
		});
	}
};

function createApp(setting, setupRoutesAndViews) {
	var app = express();

	// view engine setup
	swig.setDefaults({
		varControls: ['{=', '=}']
	});
	app.engine('html', engines.swig);
	app.engine('jade', engines.jade);
	//TODO should be a list fetched from packages
	app.set('views', [path.join(__dirname, 'views')]);
	app.set('view engine', 'html');

	// uncomment after placing your favicon in /public
	//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
	app.use(logger('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: false
	}));
	app.use(cookieParser());
	app.get('/', function(req, res) {
		console.log('......');
		res.render('index', {quote: 'Hellow packages'});
	});
	app.use(express.static(path.join(__dirname, 'public')));
	return app;
}

function setupErrorHandling(app) {
	// error handlers
	// catch 404 and forward to error handler
	app.use(function(req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	});
	// development error handler
	// will print stacktrace
	if (app.get('env') === 'development') {
		app.use(function(err, req, res, next) {
			res.status(err.status || 500);
			res.render('error.jade', {
				message: err.message,
				error: err
			});
		});
	}

	// production error handler
	// no stacktraces leaked to user
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error.jade', {
			message: err.message,
			error: {}
		});
	});

	return app;
}