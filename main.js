console.log("Code Running here");

var CANVAS_WIDTH = 480;
var CANVAS_HEIGHT = 400;
var FLOOR_HEIGHT = 70;		// Height of floor block plus gap
var BLOCK_HEIGHT = 20;		// Height of floor block
var HOLE_WIDTH = 40;		// Width of holes in the block
var MIN_GAP = 20;			// Minimum distance between holes
var PLAYER_SIZE = 32;
var PLAYER_SPEED = 3;
var NUM_FLOORS = Math.ceil(CANVAS_HEIGHT/FLOOR_HEIGHT) + 1;		// Need one extra floor to help phase in and out

// Create a 2d array to hold locations where gaps start for each floor block
var floors = new Array(NUM_FLOORS);
for (var i = 0; i < floors.length; i++) {
	floors[i] = new Array(2);
}
// Create 2 random holes in each floor block
for (var i = 0; i < floors.length; i++) {
	floors[i][0] = (CANVAS_WIDTH - HOLE_WIDTH) * Math.random();
	floors[i][1] = (CANVAS_WIDTH - HOLE_WIDTH) * Math.random();
	// Might have to create new ones repeatedly to avoid overlap
	while (Math.abs(floors[i][0] - floors[i][1]) < HOLE_WIDTH + MIN_GAP) {
		floors[i][1] = (CANVAS_WIDTH - HOLE_WIDTH) * Math.random();
	}
	// Make sure gap 0 is to the left of gap 1
	if (floors[i][0] > floors[i][1]) {
		var temp = floors[i][0];
		floors[i][0] = floors[i][1];
		floors[i][1] = temp;
	}
}

var floor_offset = 0;

var canvasElementOne = $("<canvas width='" + CANVAS_WIDTH + "' height='" + CANVAS_HEIGHT + "'></canvas>");
var canvasElementTwo = $("<canvas width='" + CANVAS_WIDTH + "' height='" + CANVAS_HEIGHT + "'></canvas>");
var canvasOne = canvasElementOne.get(0).getContext("2d");
var canvasTwo = canvasElementTwo.get(0).getContext("2d");
canvasElementOne.appendTo('#game1');
canvasElementTwo.appendTo('#game2');

var FPS = 60;
setInterval(function() {
    update();
    draw();
}, 1000/FPS);

function update() { 
    //comment
	update_blocks();
	move_player1();
	move_player2();

    // playerOne.x = player.x.clamp(0, CANVAS_WIDTH - player.width);
 
    floor_offset = floor_offset + 1;
 }
function draw() { 
    //comment
    canvasOne.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    canvasTwo.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    playerOne.draw();
    playerTwo.draw();
    draw_blocks();
 }

var playerOne = {
    color: "#33aacc",
    x: 220,
    y: 220,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    draw: function() {
        canvasOne.fillStyle = this.color;
        canvasOne.fillRect(this.x, this.y, this.width, this.height);
    }
};

var playerTwo = {
    color: "#eb4f34",
    x: 220,
    y: 220,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    draw: function() {
        canvasTwo.fillStyle = this.color;
        canvasTwo.fillRect(this.x, this.y, this.width, this.height);
    }
};

function move_player1() {
    if (keydown.a) {
		playerOne.x -= PLAYER_SPEED;
        if(playerOne.x < 0) playerOne.x = 0;
    }

    if (keydown.d) {
		playerOne.x += PLAYER_SPEED;
        if(playerOne.x > CANVAS_WIDTH - PLAYER_SIZE) playerOne.x = CANVAS_WIDTH - PLAYER_SIZE;
    }
}

function move_player2() {
    if (keydown.left) {
		playerTwo.x -= PLAYER_SPEED;
        if(playerTwo.x < 0) playerTwo.x = 0;
    }

    if (keydown.right) {
		playerTwo.x += PLAYER_SPEED;
        if(playerTwo.x > CANVAS_WIDTH - PLAYER_SIZE) playerTwo.x = CANVAS_WIDTH - PLAYER_SIZE;
    }
}

function update_blocks() {
	// Create a new block if we've scrolled an entire floor length
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
		canvasOne.fillRect(0, i * FLOOR_HEIGHT - floor_offset, floors[i][0], BLOCK_HEIGHT);
		canvasOne.fillRect(floors[i][0] + HOLE_WIDTH, i * FLOOR_HEIGHT - floor_offset, floors[i][1] - floors[i][0] - HOLE_WIDTH, BLOCK_HEIGHT);
		canvasOne.fillRect(floors[i][1] + HOLE_WIDTH, i * FLOOR_HEIGHT - floor_offset, CANVAS_WIDTH - floors[i][1] - HOLE_WIDTH, BLOCK_HEIGHT);
	}
}
