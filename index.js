var express = require("express");
var app = express();
var port = process.env.PORT;
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
		clientInfo.customId = data.customId;
		clientInfo.clientId = socket.id;
		clients.push(clientInfo);
		io.sockets.emit('participants', clients);
	});

	socket.on('disconnect', function(data) {
		for( var i=0, len=clients.length; i<len; ++i ){
			var c = clients[i];
			if(c.clientId == socket.id){
				clients.splice(i,1);
				io.sockets.emit('disconnect', c.customId);
				io.sockets.emit('participants', clients);
				break;
			}
		}
	});

	socket.on('send', function(data) {
		io.sockets.emit('message', data);
	});

});