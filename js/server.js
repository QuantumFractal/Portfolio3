/*
 *   Server file which handles all drawing requests and such
 *
 */
var express = require('express');
var path = require("path");
var app = express();

var swig  = require('swig');
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view cache', false);


var http = require('http').Server(app);
var io = require('socket.io')(http);

board_history = [];

app.use('/js', express.static(path.join(__dirname, '..', 'js')));
app.use('/css', express.static(path.join(__dirname, '..', 'css')));

app.get('/', function(req, res) {
  res.render('homepage', {
    'roomID': 'dangus'
  });
});

app.get('/tester', function(req, res){
  res.render('whiteboard', {
    'roomID': 'dangus'
  });
});

io.on('connection', function(socket){
  console.log('a user connected!');
  
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
  
  socket.on('clear', function(msg) {
    console.log('someone cleared the canvas');
    board_history = [];
    io.emit('clear', msg);
  });
  
  socket.on('stroke', function(stroke) {
    console.log('Someone had a stroke!\n');
    board_history.push(stroke);
    socket.broadcast.emit('stroke', stroke);
  });
  
  socket.on('undo', function() {
    console.log('Somone undid something!');
    socket.broadcast.emit('undo');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
