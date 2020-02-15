console.log("Code Running here");

var CANVAS_WIDTH = 480;
var CANVAS_HEIGHT = 400;
var FLOOR_HEIGHT = 40;
var BLOCK_HEIGHT = 20;
var HOLE_WIDTH = 40;
var MIN_GAP = 20;
var NUM_FLOORS = Math.ceil(CANVAS_HEIGHT/FLOOR_HEIGHT) + 1;

var floors = new Array(NUM_FLOORS);
for (var i = 0; i < floors.length; i++) {
	floors[i] = new Array(2);
}
for (var i = 0; i < floors.length; i++) {
	floors[i][0] = (CANVAS_WIDTH - HOLE_WIDTH) * Math.random();
	floors[i][1] = (CANVAS_WIDTH - HOLE_WIDTH) * Math.random();
	while (Math.abs(floors[i][0] - floors[i][1]) < HOLE_WIDTH + MIN_GAP) {
		floors[i][1] = (CANVAS_WIDTH - HOLE_WIDTH) * Math.random();
	}
	if (floors[i][0] > floors[i][1]) {
		var temp = floors[i][0];
		floors[i][0] = floors[i][1];
		floors[i][1] = temp;
	}
}

var floor_offset = 0;

var canvasElement = $("<canvas width='" + CANVAS_WIDTH + "' height='" + CANVAS_HEIGHT + "'></canvas>");
var canvas = canvasElement.get(0).getContext("2d");
canvasElement.appendTo('#game1');

var FPS = 30;
setInterval(function() {
    update();
    draw();
}, 1000/FPS);

function update() { 
    floor_offset = floor_offset + 2;
	update_blocks();
 }
function draw() {
	canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	draw_blocks();
}
function update_blocks() {
	if (floor_offset >= FLOOR_HEIGHT) {
		for (var i = 0; i < floors.length - 1; i++) {
			floors[i][0] = floors[i+1][0];
			floors[i][1] = floors[i+1][1];
		}
		floors[floors.length - 1][0] = (CANVAS_WIDTH - HOLE_WIDTH) * Math.random();
		floors[floors.length - 1][1] = (CANVAS_WIDTH - HOLE_WIDTH) * Math.random();
		while (Math.abs(floors[i][0] - floors[i][1]) < HOLE_WIDTH + MIN_GAP) {
			floors[floors.length - 1][1] = (CANVAS_WIDTH - HOLE_WIDTH) * Math.random();
		}
		if (floors[i][0] > floors[i][1]) {
			var temp = floors[i][0];
			floors[i][0] = floors[i][1];
			floors[i][1] = temp;
		}
		floor_offset = floor_offset - FLOOR_HEIGHT;
	}
}
function draw_blocks() {
    for (var i = 0; i < floors.length; i++) {
		canvas.fillRect(0, i * FLOOR_HEIGHT - floor_offset, floors[i][0], BLOCK_HEIGHT);
		canvas.fillRect(floors[i][0] + HOLE_WIDTH, i * FLOOR_HEIGHT - floor_offset, floors[i][1] - floors[i][0] - HOLE_WIDTH, BLOCK_HEIGHT);
		canvas.fillRect(floors[i][1] + HOLE_WIDTH, i * FLOOR_HEIGHT - floor_offset, CANVAS_WIDTH - floors[i][1] - HOLE_WIDTH, BLOCK_HEIGHT);
	}
}