var canvas = document.getElementById("drawingPad");
var context = canvas.getContext("2d");
var isMouseDown = false;
var mouseX = 0;
var mouseY = 0;

context.strokeStyle = "#000000";
clearBoard();

var socket = io();
currentStroke = {};


/*
 * Generator functions
 */
function Point(x, y, type){
    return {'x':x,'y':y, 'type':type};
}

/*
 * Socket Listeners
 */
socket.on('stroke', function(stroke){
    console.log("having a stroke");
    drawStroke(stroke);
});

socket.on('clear', clearBoard);

/*
 * Canvas functions
 */
function clearBoard() {
    canvas.width = canvas.width; 
    context.fillStyle = "#ffffff";
    context.fillRect(0,0,canvas.width,canvas.height);
}

function drawStroke(stroke) {
    
    // Terrible solution
    while(isMouseDown);

    for (i=0; i<stroke.points.length; i++){
        drawPoint(stroke.points[i]);
    } 
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
        currentStroke = {'points':[Point(mouseX, mouseY, 'start')]};   
        
    } else if (event.type === "mouseup"){
        isMouseDown = false;
        mouseX = event.offsetX;
        mouseY = event.offsetY;
        currentStroke.points.push(Point(mouseX, mouseY, 'end'));
        
        
        // Send stroke
        socket.emit('stroke', currentStroke);
        
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
window.addEventListener("mouseup", handleEvent);
canvas.addEventListener("mousemove", handleEvent);

var clearBtn = document.getElementById("clearButton");
clearBtn.addEventListener("click", function(evt){
    socket.emit('clear', '');
    clearBoard();
});


