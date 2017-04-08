/* Author: Zefizz ********* */
/*         *********        */
/*         *********        */


/*include required modules*/
var fs   = require('fs');
var http = require('http');
var mime = require('mime-types');
var url  = require('url');

/*setup server*/
var server = http.createServer(handle);
server.listen(2406);
console.log('Now listening on 2406');

/*store root directory*/
var ROOT = './public';

/*the request handler*/
function handle(req,res) {
	
	reqUrl = url.parse(req.url);
	var filename = ROOT+req.url;
	console.log('serving' + filename);
	
	/*rout to take when GET req for /hero is received*/
	if(reqUrl.pathname==='/hero') {
		if(!reqUrl.query)	//query is not defined
			serveHome();	//serve homepage to be safe
		else {
			/*parse the requred filename based on the qeury*/
			filename = ROOT+'/heroes/'+reqUrl.query.substring(reqUrl.query.indexOf('=')+1)+'.json';
			/*read the file and serve the data - async*/
			fs.readFile(filename, function(err,data) {
				if(err) serveError(err);
				else servePage(data);
			});
		}
	}
	/*rout to take when requesting ALL the heores*/	
	else if(req.url==='/allHeroes') {
		/*read all filenames in the dir to an array, send as JSON object*/
		fs.readdir(ROOT+'/heroes',function(err,files) {
			var allHeroesObj = JSON.stringify({'heroes':files});
			console.log(allHeroesObj);
			servePage(allHeroesObj);
		});
	}	
	/*determine what to do with the other requests*/
	else fs.stat(filename,function(err,stats) {
		if(err) serveError(err);
		else if(stats.isDirectory()) {
			//console.log('a dir, a dir, a female dir');
			serveHome();
		}else {
			/*read the file and serve data- async*/
			fs.readFile(filename,function(err,data) {
				if(err) serveError(err);
				else servePage(data);
			});
		}
	});
	
	/*serve up some hot errors*/
	function serveError(err) {
		/*serve 404 page*/
		if(err.message.startsWith('ENOENT')) {
			fs.readFile(ROOT+'/404p.html',function(err,data) {
				servePage(data);
			});
		}else {
			res.writeHead(500,{'content-type':'text/html'});
			res.end(err.message);
		}
	}

	/*respond with the requested page*/
	function servePage(data) {
		if(filename.endsWith('.json')) //send JSON text
			res.writeHead(200,{'content-type':'application/JSON'});
		else	//send the requested page
			res.writeHead(200,{'content-type':mime.lookup(filename)||'text/html'});
		res.end(data);
	}

	/*respond with homepage*/
	function serveHome() {
		var home = ROOT+'/index.html';
		/*read file - async*/
		fs.readFile(home,function(err,data) {
			if(err) serveError(err);
			else servePage(data);
		});
	}
}

