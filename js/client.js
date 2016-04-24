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
function Point(x, y){
    return {'x':x,'y':y};
}

/*
 * Socket Listeners
 */
socket.on('stroke', drawStroke);

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
    
}

function handleEvent(event) {
    if(event.type === "mousedown"){
        isMouseDown = true;
        mouseX = event.offsetX;
        mouseY = event.offsetY;
        context.beginPath();
        context.moveTo(mouseX, mouseY);
        
        // Save starting point
        currentStroke = {'points':[Point(mouseX, mouseY)]};   
        
    } else if (event.type === "mouseup"){
        isMouseDown = false;
        
        // Send stroke
        socket.emit('stroke', currentStroke);
        
    } else if (event.type === "mousemove"){
        if (isMouseDown) {
            mouseX = event.offsetX;
            mouseY = event.offsetY;

            context.lineTo(mouseX, mouseY);
            context.stroke();
            
            // Save intermediate points
            currentStroke.points.push(Point(mouseX, mouseY));
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


