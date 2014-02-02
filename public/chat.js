$(document).ready(function() {
	if(typeof _WEBSOCKET_URL == 'undefined') {
		var _WEBSOCKET_URL = '';
	}
	if(typeof _ID == 'undefined') {
		var _ID = Math.floor((Math.random()*200)+1);
	}
	if(typeof _NAME == 'undefined') {
		var _NAME = 'guest ' + _ID;
	}

	var socket = io.connect(_WEBSOCKET_URL);
	var messages = [];
	var _SERVER = 'Robot';

	socket.on('connecting', function() {
		var data = {
			username: _SERVER,
			message: 'Kapcsolódás folyamatban! Kérlek várj!',
			time: formatTimeOfDay($.now())
		};
		writeMessage(data);
	});

	socket.on('connect', function() {
		socket.emit('storeClientInfo', {
			userid: _ID,
			username: _NAME
		});
		var data = {
			username: _SERVER,
			message: _NAME + ' belépett a chatre!',
			time: formatTimeOfDay($.now())
		};
		sendMessage(data);
	});

	socket.on('userLeft', function(user) {
		var data = {
			username: _SERVER,
			message: user + ' kilépett!',
			time: formatTimeOfDay($.now())
		};
		sendMessage(data);
	});

	socket.on('participants', function(data) {
		var users = [];
		var html = '';
		$.each(data, function(i, user) {
			users.push({
				userid: user.userid,
				username: user.username
			});
		});
		users.sort(function(a, b) {
			if(a.username > b.username){return 1;}
			if(a.username < b.username){return -1;}
			return 0;
		});
		$.each(users, function(i, user) {
			html += '<div class="name">';
				html += user.username
				html += '<span class="id">' + user.userid + '</span>';
			html += '</div>';
		});
		$('#chat_participants').html(html);
	});

	socket.on('message', function(data) {
		if(data.message) {
			writeMessage(data);
		} else {
			console.log('There is a problem: ', data);
		}
	});

	function sendMessage(data) {
		if($.trim(data.message)) {
			socket.emit('send', {
				username: data.username,
				message: $.trim(data.message),
				time: data.time
			});
			$('#chat_text').val('');
		}
	}

	function writeMessage(data) {
		messages.push(data);
		var html = '';
		for(var i=0; i<messages.length; i++) {
			html += '<span class="time">' + messages[i].time + '</span>';
			html += '<span class="name"> ' + messages[i].username + ': </span>';
			html += messages[i].message + '<br />';
		}
		$('#chat_content').html(html);
		$('#chat_content').scrollTop($('#chat_content')[0].scrollHeight);
	}

	$('#chat_send').on('click', function() {
		var data = {
			username: _NAME,
			message: $('#chat_text').val(),
			time: formatTimeOfDay($.now())
		};
		sendMessage(data);
	});
	$("#chat_text").keyup(function(e) {
		if(e.keyCode == 13) {
			var data = {
				username: _NAME,
				message: $('#chat_text').val(),
				time: formatTimeOfDay($.now())
			};
			sendMessage(data);
		}
	});

	function formatTimeOfDay(millisSinceEpoch) {
		var secondsSinceEpoch = (millisSinceEpoch / 1000) | 0;
		var secondsInDay = ((secondsSinceEpoch % 86400) + 86400) % 86400;
		var seconds = secondsInDay % 60;
		var minutes = ((secondsInDay / 60) | 0) % 60;
		var hours = (secondsInDay / 3600) | 0;
		hours++;
		return hours + (minutes < 10 ? ":0" : ":")
			+ minutes;
			//+ minutes + (seconds < 10 ? ":0" : ":")
			//+ seconds;
	}
});