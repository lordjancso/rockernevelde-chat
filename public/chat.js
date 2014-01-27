$(document).ready(function() {
	var socket = io.connect();
	var messages = [];
    var _NAME = "guest "+Math.floor((Math.random()*20)+1);

	socket.on('connecting', function() {
		console.log('connecting...');
	});

	socket.on('connect', function() {
		socket.emit('storeClientInfo', {
			customId: _NAME
		});
		socket.emit('send', {
			message: _NAME + ' belépett a chatre!',
			time: formatTimeOfDay($.now())
		});
	});
	
	socket.on('participants', function(data) {
		var users = [];
		var html = '';
		jQuery.each(data, function(i, user) {
			users.push(user.customId);
		});
		users.sort();
		jQuery.each(users, function(i, user) {
			html += user + '<br/>';
		});
		$('#participants').html(html);
	});

	socket.on('left', function(data) {
		console.log('left');
		socket.emit('send', {
			message: data + ' kilépett a chatről!',
			time: formatTimeOfDay($.now())
		});
	});

    socket.on('message', function(data) {
        if(data.message) {
            messages.push(data);
            var html = '';
            for(var i=0; i<messages.length; i++) {
				if(!messages[i].time) messages[i].time = formatTimeOfDay($.now())
                html += '<b>' + messages[i].time + ' ' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
                html += messages[i].message + '<br />';
            }
			$('#content').html(html);
			$('#content').scrollTop($('#content')[0].scrollHeight);
        } else {
            console.log("There is a problem: ", data);
        }
    });
	
	function sendMessage() {
		var text = $('#field').val();
		socket.emit('send', {
			username: _NAME,
			message: text,
			time: formatTimeOfDay($.now())
		});
		$('#field').val('');
	}

	$('#send').on('click', sendMessage);

	$("#field").keyup(function(e) {
		if(e.keyCode == 13) {
			sendMessage();
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
			+ minutes + (seconds < 10 ? ":0" : ":")
			+ seconds;
	}
});