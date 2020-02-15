console.log("Code Running here");

var CANVAS_WIDTH = 480;
var CANVAS_HEIGHT = 400;

var canvasElement = $("<canvas width='" + CANVAS_WIDTH + "' height='" + CANVAS_HEIGHT + "'></canvas>");
var canvas = canvasElement.get(0).getContext("2d");
canvasElement.appendTo('body');

var FPS = 30;
setInterval(function() {
    PaymentRequestUpdateEvent();
    draw();
}, 1000/FPS);

function update() { 
    //comment
 }
function draw() { 
    //comment
 }