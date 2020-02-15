var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

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
		io.to(socket.id).emit('count'," count " +  counts[room]);
		//socket.to(socket.id)
		socket.join(room);
	})
	socket.on('chat message', function(msg){
		console.log('message', msg);
	  socket.to(room).broadcast.emit('chat message', msg);
	});
  });

http.listen(3000, function(){
  console.log('listening on *:3000');
});