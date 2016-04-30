var socket = io();


socket.on('redirect', function(url) {
    window.location = '/boards/'+url+'/';
});

var newRoomBtn  = document.getElementById("newRoomButton");
newRoomBtn.addEventListener("click", function(evt){
    var name = document.getElementById("newInput").value;
    //console.log("BLAH");
    socket.emit('newRoom', name);
});

var joinRoomBtn  = document.getElementById("joinRoomButton");
joinRoomBtn.addEventListener("click", function(evt){
    var room = document.getElementById("joinInput").value;
    console.log(room);
    window.location = '/boards/'+room+'/';
});