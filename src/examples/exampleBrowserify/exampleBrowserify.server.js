
module.exports.activate = function(api) {
	api.router().get('/', function(req, res) {
		res.redirect('/' + api.packageName + '/index.html');
	});
};
