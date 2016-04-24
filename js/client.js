var canvas = document.getElementById("drawingPad");
var context = canvas.getContext("2d");
var isMouseDown = false;
var mouseX = 0;
var mouseY = 0;

context.strokeStyle = "#000000";
clearBoard();

var socket = io();
currentStroke = {};

board_history = [];

/*
 * Generator functions
 */
function Point(x, y, type) {
    return {'x':x,'y':y, 'type':type};
}

function Stroke(color) {
    return {'color':color, 'visibility': true, 'points':[]};
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
    for (i=0; i<stroke.points.length; i++){
        drawPoint(stroke.points[i]);
    } 
    context.strokeStyle = currentSwatch.style.backgroundColor;
}

function drawPoint(point) {
    if (point.type === "start"){
        context.beginPath();
        context.moveTo(point.x, point.y);
    } else if (point.type === "drag"){
        context.lineTo(point.x, point.y);
        context.stroke();
    } else {
        context.closePath();
    }
}

function handleEvent(event) {
    if(event.type === "mousedown"){
        isMouseDown = true;
        mouseX = event.offsetX;
        mouseY = event.offsetY;
        context.beginPath();
        context.moveTo(mouseX, mouseY);
        
        // Save starting point
        currentStroke = Stroke(currentSwatch.style.backgroundColor);
        currentStroke.points.push(Point(mouseX, mouseY, 'start'));  
        
    } else if (event.type === "mouseup") {
        isMouseDown = false;
        mouseX = event.offsetX;
        mouseY = event.offsetY;
        currentStroke.points.push(Point(mouseX, mouseY, 'end'));
   
        // Send stroke
        socket.emit('stroke', currentStroke);
        
        // Save history
        board_history.push(currentStroke);
        
    } else if (event.type === "mousemove"){
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

var clearBtn = document.getElementById("clearButton");
clearBtn.addEventListener("click", function(evt){
    socket.emit('clear', '');
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