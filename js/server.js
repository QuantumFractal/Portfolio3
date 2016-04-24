/*
 *   Server file which handles all drawing requests and such
 *
 */

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require("path");

app.use('/js', express.static(path.join(__dirname, '..', 'js')));
app.use('/css', express.static(path.join(__dirname, '..', 'css')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

io.on('connection', function(socket){
  console.log('a user connected!');
  
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  
  socket.on('clear', function(msg){
    console.log('someone cleared the canvas');
    io.emit('clear', msg);
  });
  
  socket.on('stroke', function(stroke){
    console.log('Someone had a stroke!\n'+JSON.stringify(stroke));
    io.emit('stroke', stroke);
  })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
