var express = require("express");
var app = express();
var port = process.env.PORT;

app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.get("/", function(req, res){
	res.render("page");
});

app.use(express.static(__dirname + '/public'));
var io = require('socket.io').listen(app.listen(port));
console.log("Listening on port " + port);

io.sockets.on('connection', function (socket) {
	socket.emit('message', { message: 'welcome to the chat' });
	io.sockets.emit('message', { message: 'new participant on the chat!' });
	socket.on('send', function (data) {
		io.sockets.emit('message', data);
	});
});

