/*
 *   Server file which handles all drawing requests and such
 *
 */
var express = require('express');
var path = require("path");
var colors = require("colors");
var app = express();
var shortid = require("shortid");

var swig  = require('swig');
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view cache', false);

var http = require('http').Server(app);
var io = require('socket.io')(http);

var rooms = [];

app.use('/js', express.static(path.join(__dirname, '..', 'js')));
app.use('/css', express.static(path.join(__dirname, '..', 'css')));

function Room(name, shortid){
    return {'name':name, 'shortid':shortid, 'numUsers': 0, 'history':[]};
}

app.get('/', function(req, res) {
    res.render('homepage');
});

io.on('connection', function(socket){
    var roomID;
    
    console.log("[Info] A user connected!")

    // Room Functions
    socket.on('newRoom', function(name) {
        var id = shortid.generate();
        rooms[id] = Room(name, id);
        
        if (name.trim() === ''){
            name = 'Whiteboard!';
        }
        
        // Add a new route
        app.get('/boards/'+id, function(req, res){
            res.render('whiteboard', {
                'roomID': id,
                'roomName': name
            });
        });
        
        socket.emit('redirect', id);
        console.log("[Success] Someone made a new room \""+name+"\"("+id+")");
    });

    socket.on('joinRoom', function(room) {
        roomID = room;
        if(typeof rooms[roomID] === 'undefined') {
            console.log("[Error] Cannot find that room!");
        } else {
            console.log("[Success] Somone joined room \""+rooms[roomID].name+"\"("+roomID+")");
            socket.join(room);
            socket.emit('getHistory', rooms[roomID].history);
        }
    });

    socket.on('disconnect', function() {
        console.log("[Info] A user left.")
    });

    // Drawing Functions
    socket.on('clear', function() {
        if(typeof rooms[roomID] === 'undefined') {
            console.log("[Error] Cannot find that room!");
        } else {
            console.log("[Success] Somone cleared the board in room \""+rooms[roomID].name+"\"("+roomID+")");
            rooms[roomID].history = [];
            socket.broadcast.to(roomID).emit('clear');
        }
    });

    socket.on('stroke', function(stroke) {
        if(typeof rooms[roomID] === 'undefined') {
            console.log("[Error] Cannot find that room!");
        } else {
            console.log("[Success] Someone had a stroke in room \""+rooms[roomID].name+"\"("+roomID+")");
            rooms[roomID].history.push(stroke);
            socket.broadcast.to(roomID).emit('stroke', stroke);
        }
    });

    socket.on('undo', function() {
        if(typeof rooms[roomID] === 'undefined') {
            console.log("[Error] Cannot find that room!");
        } else {            
            console.log("[Success] Somone undid something in room \""+rooms[roomID].name+"\"("+roomID+")");
            if(rooms[roomID].history.length != 0){
                rooms[roomID].history.pop();
            }
            io.in('game').emit('getHistory', rooms[roomID].history);
        }
    });
});

http.listen(3000, function(){
    console.info('listening on *:3000'.green);
});
