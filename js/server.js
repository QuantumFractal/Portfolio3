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


http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  console.log('a user connected!');
  
  socket.on('disconnect', function(){
    console.log('a user left!');
  });
});