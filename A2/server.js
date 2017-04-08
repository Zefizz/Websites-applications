/* Author: Zefizz ********* */
/*         *********       */
/*         *********       */

/*include required modules*/
var fs    = require('fs');
var http  = require('http');
var mime  = require('mime-types');
var url   = require('url');
var board = require('makeBoard');

/*setup server*/
var server = http.createServer(handle);
server.listen(2406);
console.log('Now listening on 2406');

/*declare some variables*/
var BOARD_SIZE = 4;
var ROOT       = './public';

/*store the user list, containing user objects*
 *user objects have a board and a score*/
var userList = {};

/*the request handler*/
function handle(req,res) {
	
	reqUrl = url.parse(req.url);
	var filename = ROOT+req.url;
	console.log('serving' + reqUrl.pathname);
	
	/*handle POST requests*/
	if(req.method==='POST') {
		/*handle the intro requests by starting new game for user*/
		if(reqUrl.pathname==='/memory/intro') {
			var reqBody = '';
			req.on('data',function(chunk){
				reqBody += chunk;
			});
			req.on('end',function(){
				/*create new user object with the received data, overwrite previous*/
				var userName = JSON.parse(reqBody).name;
				var userObj = {'board':board.makeBoard(BOARD_SIZE),'score':0};
				userList[userName] = userObj;
				respond(200,'OK');
			});
		}
		else
			respond(500,'no route implemented');
	}
	
	/*handle GET requests*/
	else if(req.method==='GET') {
		/*retrieve info from the user's board*/
		if(reqUrl.pathname==='/memory/card') {
			/*get the user and the value of their board at the indices provided*/
			var name = extractParam('name');
			var row  = extractParam('row');
			var col  = extractParam('col');
			
			/*ensure we have the required information*/
			if(!name || !row || !col) {
				respond(404,'invalid query!');
				return 1;
			}
			/*get user, ensure it exists*/
			var user = userList[name];
			if(!user) {
				respond(404,'user ' + name + ' not found!');
				return 1;
			}
			/*check rows for errors*/
			if(col>=BOARD_SIZE || row>=BOARD_SIZE || col<0 || row<0) {
				respond(404,'invalid indices (' + row + ',' + col + ')');
				return 1;
			}
			
			/*finally, respond with the data*/
			var rVal = '' + user.board[row][col];	//neede to store value in a string
			respond(200,rVal);
		}
		
		/*determine what to do with the other GET requests*/
		else {
			fs.stat(filename,function(err,stats) {
				if(err)
					serveError(err);
				else if(stats.isDirectory())
					serveHome();
				else {
					/*read the file and serve data- async*/
					fs.readFile(filename,function(err,data) {
						if(err) serveError(err);
						else respond(200,data);
					});
				}
			});
		}
	}
	
	/*don't accept other request methods*/
	else
		respond(500,"method not implemented");

	
	/*get the requested param value from the query string*/
	function extractParam(param) {
		var str = reqUrl.query;
		
		/*return undefined if param does not exist*/
		if(!str.includes(param))
			return false;
		
		/*start at the first letter of the parameter*/
		str = str.substring(str.indexOf(param+'=')+param.length+1);
		
		/*end before next parameter, if any*/
		if(str.includes('&'))
			str = str.substring(0,str.indexOf('&'));
		
		return str;
	}
	
	/*serve up some hot errors*/
	function serveError(err) {
		/*serve 404 page*/
		if(err.message.startsWith('ENOENT')) {
			fs.readFile(ROOT+'/404p.html',function(err,data) {
				respond(404,data);
			});
		/*serve some other error, presumed server*/
		}else {
			respond(500,err.message);
		}
	}

	/*respond with the requested page*/
	function servePage(data) {
		res.writeHead(200,{'content-type':mime.lookup(filename)||'text/html'});
		res.end(data);
	}

	/*respond with homepage*/
	function serveHome() {
		fs.readFile(ROOT+'/index.html',function(err,data) {
			if(err) respond(404);
			else respond(200,data);
		});
	}
	
	/*respond with the requested data*/
	function respond(code,data) {
		res.writeHead(code,{'content-type':mime.lookup(req.url)||'text/html'});
		res.end(data);
	}
}

