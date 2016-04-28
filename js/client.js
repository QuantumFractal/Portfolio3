var canvas = document.getElementById("drawingPad");
var context = canvas.getContext("2d");
var isMouseDown = false;
var mouseX = 0;
var mouseY = 0;

context.strokeStyle = "#000000";
context.lineCap="round";
context.jointCap="round";
clearBoard();

var roomID = document.getElementById("roomID").value;
var socket = io();
currentStroke = {};
penSize = 1;
board_history = [];

/*
 * Generator functions
 */
function Point(x, y, type) {
    return {'x':x,'y':y, 'type':type};
}

function Stroke(color, size) {
    return {'color':color, 'size':size, 'visibility': true, 'points':[]};
}

/*
 * Socket Listeners
 */
socket.on('stroke', function(stroke) {
    console.log("Someone Stroked a color: "+stroke.color);
    drawStroke(stroke);
    board_history.push(stroke);
});

undocount = 0;
socket.on('undo', function() {
    undocount++;
    console.log('# of undos: '+undocount);
    undoLast();
});

socket.on('connect', function() {
   socket.emit('joinRoom', roomID);
});

socket.on('clear', clearBoard);

/*
 * Canvas functions
 */
function redraw(){
    clearBoard();
    
    for(i=0; i<board_history.length; i++){
        stroke = board_history[i];
        context.strokeStyle = stroke.color.toString();
        for (j=0; j<stroke.points.length; j++){
            drawPoint(stroke.points[j]);
        } 
        context.strokeStyle = currentSwatch.style.backgroundColor;
    }
}

function undoLast() {
    if(board_history.length > 0) {
        board_history.pop();
        redraw();
        return true;
    }
    return false;
}

function clearBoard() {
    canvas.width = canvas.width; 
    context.fillStyle = "#ffffff";
    context.fillRect(0,0,canvas.width,canvas.height);
    if (currentSwatch != undefined) {
    context.strokeStyle = currentSwatch.style.backgroundColor;
    }
}
function drawStroke(stroke) {
    
    // Terrible solution
    while(isMouseDown);

    context.strokeStyle = stroke.color.toString();
    var old = penSize;
    penSize = stroke.size;
    for (i=0; i<stroke.points.length; i++){
        drawPoint(stroke.points[i]);
    } 
    penSize = old;
    context.strokeStyle = currentSwatch.style.backgroundColor;
}

function drawPoint(point) {
    if (point.type === "start"){
        context.beginPath();
        context.lineWidth = penSize;
        context.lineCap="round";
        context.jointCap="round";
        context.moveTo(point.x, point.y);
    } else if (point.type === "drag"){
        context.lineTo(point.x, point.y);
        context.stroke();
    } else {
        context.closePath();
    }
}

function handleEvent(event) {
    if(event.type === "mousedown" || event.type === "touchstart"){
        isMouseDown = true;
        mouseX = event.offsetX;
        mouseY = event.offsetY;
        context.beginPath();
        context.lineWidth = penSize;
        context.lineCap="round";
        context.jointCap="round";
        context.moveTo(mouseX, mouseY);
        
        // Save starting point
        currentStroke = Stroke(currentSwatch.style.backgroundColor, penSize);
        currentStroke.points.push(Point(mouseX, mouseY, 'start'));  
        
    } else if (event.type === "mouseup" || event.type === "touchend") {
        isMouseDown = false;
        mouseX = event.offsetX;
        mouseY = event.offsetY;
        currentStroke.points.push(Point(mouseX, mouseY, 'end'));
   
        // Send stroke
        socket.emit('stroke', currentStroke);
        
        // Save history
        board_history.push(currentStroke);
        
    } else if (event.type === "mousemove" || event.type === "touchmove"){
        if (isMouseDown) {
            mouseX = event.offsetX;
            mouseY = event.offsetY;
            
            context.lineTo(mouseX, mouseY);
            context.stroke();
            
            // Save intermediate points
            currentStroke.points.push(Point(mouseX, mouseY, 'drag'));
        } 
    }
}

/*
 * Canvas Listeners
 */
canvas.addEventListener("mousedown", handleEvent);
canvas.addEventListener("mouseup", handleEvent);
canvas.addEventListener("mousemove", handleEvent);
canvas.addEventListener("touchstart", handleEvent);
canvas.addEventListener("touchmove", handleEvent);
canvas.addEventListener("touchend", handleEvent);

var clearBtn = document.getElementById("clearButton");
clearBtn.addEventListener("click", function(evt){
    socket.emit('clear', '', roomID);
    clearBoard();
    board_history = [];
});

var undoBtn = document.getElementById("undoButton");
undoBtn.addEventListener("click", function(evt){
    last = undoLast();
    if (last == true) {
        socket.emit('undo');
    }
});

/*
 * Palette functons
 */
var palette = document.getElementById("palette");
var swatches = palette.children;
var currentSwatch; // we'll keep track of what swatch is active in this.

for (var i = 0; i < swatches.length; i++) {
    var swatch = swatches[i];
    if (i == 0) {
        currentSwatch = swatch;
    }

    // when we click on a swatch...
    swatch.addEventListener("click",function (evt) {
       
        this.className = "active"; // give the swatch a class of "active", which will trigger the CSS border.
        currentSwatch.className = ""; // remove the "active" class from the previously selected swatch
        currentSwatch = this; // set this to the current swatch so next time we'll take "active" off of this.

        
        context.strokeStyle = this.style.backgroundColor; // set the background color for the canvas.
    });
}

/*
 * Size functions
 */
var size = document.getElementById("size");
var sizes = size.children;
var currentSize

for (var i = 0; i < sizes.length; i++) {
    var size = sizes[i];
    if (i == 0) {
        currentSize = size;
    }

    size.addEventListener("click",function (evt) {
      
        this.className = "active"; 
        currentSize.className = ""; 
        currentSize = this; 
        
        penSize = Number(this.innerHTML); // set the background color for the canvas.
    });
}

var clipboard = new Clipboard('.clip');
clipboard.on('success', function(e) {
    alert("Copied Room ID to Clipboard!")
});
clipboard.on('error', function(e) {
    console.log(e);
});