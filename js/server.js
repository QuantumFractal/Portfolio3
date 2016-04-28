/*
 *   Server file which handles all drawing requests and such
 *
 */
var express = require('express');
var path = require("path");
var app = express();
var shortid = require("shortid");

var swig  = require('swig');
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view cache', false);


var http = require('http').Server(app);
var io = require('socket.io')(http);

board_history = [];
rooms = [];

app.use('/js', express.static(path.join(__dirname, '..', 'js')));
app.use('/css', express.static(path.join(__dirname, '..', 'css')));

function Room(name, shortid){
    return {'name':name, 'shortid':shortid, 'numUsers': 0, 'history':[]};
}

app.get('/', function(req, res) {
    res.render('homepage');
});

app.get('/tester', function(req, res){
    res.render('whiteboard', {
        'roomID': 'dangus'
    });
});

io.on('connection', function(socket){
    console.log('a user connected!');

    // Room Functions
    socket.on('newRoom', function(name) {
        var id = shortid.generate();
        rooms[id] = Room(name, id);
        console.log("Made new room named "+name+" with id "+id);  
        
        // Add a new route
        app.get('/boards/'+id, function(req, res){
            res.render('whiteboard', {
                'roomID': id,
                'roomName': name
            });
        });
        
        socket.emit('redirect', id);
    });

    socket.on('joinRoom', function(room) {
        console.log("Someone Joined room "+JSON.stringify(room));
        socket.join(room);
    });


    socket.on('disconnect', function() {
        console.log('user disconnected');
    });

    // Drawing Functions
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
