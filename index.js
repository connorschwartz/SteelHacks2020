var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static('static'))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var counts =  [];

io.on('connection', function(socket){
	let room;
	socket.on('join room', function(room1) {
		room = room1
		if(counts[room]) {
			counts[room]++;
		}
		else{
			counts[room] = 1;
		}
		console.log("joined", room);
		if(counts[room] < 3){
			io.to(socket.id).emit('count',counts[room]);
			socket.join(room);
			if(counts[room] == 2) {
				socket.to(room).emit('start game', 'start!');
			}
		}
		else {
			counts[room] = 2;
			io.to(socket.id).emit('count',3);
		}
		//socket.to(socket.id)
		
	})
	socket.on('chat message', function(msg){
		console.log('message', msg);
	  socket.to(room).broadcast.emit('chat message', msg);
	});
	socket.on('disconnect', function(){
    if(room) {
			socket.to(room).broadcast.emit('disconnected', 'the other player disconnected');
		}
	});
	socket.on('rand', function(msg) {
		if (room) { 
			socket.to(room).broadcast.emit('rand', msg);
		}
	})
	socket.on('data', function(msg) {
		if(room) {
			socket.to(room).broadcast.emit('data', msg);
		}
	})
  });

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on port');
});