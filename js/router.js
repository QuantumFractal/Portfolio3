var socket = io();


socket.on('redirect', function(url) {
    window.location = '/boards/'+url+'/';
});

var newRoomBtn  = document.getElementById("newRoomButton");
newRoomBtn.addEventListener("click", function(evt){
    var name = document.getElementById("newInput").value;
    
    socket.emit('newRoom', name);
});

var joinRoomBtn  = document.getElementById("joinRoomButton");
newRoomBtn.addEventListener("click", function(evt){
    var room = document.getElementById("roomInput").value;
    window.location = '/boards/'+url+'/';
});