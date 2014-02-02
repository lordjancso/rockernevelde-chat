var express = require("express");
var app = express();
var port = process.env.PORT;
if(typeof port == 'undefined') {
	port = 5000;
}
console.log(port);
console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
var clients = [];

app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.get("/", function(req, res){
	res.render("page");
});
app.use(express.static(__dirname + '/public'));

var io = require('socket.io').listen(app.listen(port));

io.sockets.on('connection', function(socket) {

	socket.on('storeClientInfo', function(data) {
		var clientInfo = new Object();
		clientInfo.userid = data.userid;
		clientInfo.username = data.username;
		clientInfo.clientId = socket.id;
		clients.push(clientInfo);
		io.sockets.emit('participants', clients);
	});

	socket.on('disconnect', function() {
		for(var i=0, len=clients.length; i<len; ++i) {
			var c = clients[i];
			if(c.clientId == socket.id) {
				clients.splice(i,1);
				io.sockets.emit('userLeft', c.username);
				io.sockets.emit('participants', clients);
				break;
			}
		}
	});

	socket.on('send', function(data) {
		io.sockets.emit('message', data);
	});

});