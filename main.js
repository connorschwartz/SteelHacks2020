console.log("Code Running here");

var CANVAS_WIDTH = 480;
var CANVAS_HEIGHT = 400;
var FLOOR_HEIGHT = 70;		// Height of floor block plus gap
var BLOCK_HEIGHT = 20;		// Height of floor block
var HOLE_WIDTH = 40;		// Width of holes in the block
var MIN_GAP = 20;			// Minimum distance between holes
var PLAYER_SIZE = 32;
var PLAYER_SPEED = 3;
var SCROLL_SPEED = 1;
var FALL_SPEED = 2;
var NUM_FLOORS = Math.ceil(CANVAS_HEIGHT/FLOOR_HEIGHT) + 1;		// Need one extra floor to help phase in and out
var TEXT_SIZE = 250;

var rng1 = mulberry32(1);
var rng2 = mulberry32(1);

// Create a 2d array to hold locations where gaps start for each floor block
var floorsOne = new Array(NUM_FLOORS);
for (var i = 0; i < floorsOne.length; i++) {
	floorsOne[i] = new Array(2);
}
// Create 2 random holes in each floor block
for (var i = 0; i < floorsOne.length; i++) {
	floorsOne[i][0] = (CANVAS_WIDTH - HOLE_WIDTH) * rng1();
	floorsOne[i][1] = (CANVAS_WIDTH - HOLE_WIDTH) * rng1();
	// Might have to create new ones repeatedly to avoid overlap
	while (Math.abs(floorsOne[i][0] - floorsOne[i][1]) < HOLE_WIDTH + MIN_GAP) {
		floorsOne[i][1] = (CANVAS_WIDTH - HOLE_WIDTH) * rng1();
	}
	// Make sure gap 0 is to the left of gap 1
	if (floorsOne[i][0] > floorsOne[i][1]) {
		var temp = floorsOne[i][0];
		floorsOne[i][0] = floorsOne[i][1];
		floorsOne[i][1] = temp;
	}
}

// Create a 2d array to hold locations where gaps start for each floor block
var floorsTwo = new Array(NUM_FLOORS);
for (var i = 0; i < floorsTwo.length; i++) {
	floorsTwo[i] = new Array(2);
}
// Create 2 random holes in each floor block
for (var i = 0; i < floorsTwo.length; i++) {
	floorsTwo[i][0] = (CANVAS_WIDTH - HOLE_WIDTH) * rng2();
	floorsTwo[i][1] = (CANVAS_WIDTH - HOLE_WIDTH) * rng2();
	// Might have to create new ones repeatedly to avoid overlap
	while (Math.abs(floorsTwo[i][0] - floorsTwo[i][1]) < HOLE_WIDTH + MIN_GAP) {
		floorsTwo[i][1] = (CANVAS_WIDTH - HOLE_WIDTH) * rng2();
	}
	// Make sure gap 0 is to the left of gap 1
	if (floorsTwo[i][0] > floorsTwo[i][1]) {
		var temp = floorsTwo[i][0];
		floorsTwo[i][0] = floorsTwo[i][1];
		floorsTwo[i][1] = temp;
	}
}

var floor_offset_one = 0;
var floor_offset_two = 0;

var gameOver = false;
var d = new Date();
var startTime = d.getTime();
var currentTime = 1;
var scoreOne = 0;
var scoreTwo = 0;

var canvasElementOne = $("<canvas width='" + CANVAS_WIDTH + "' height='" + CANVAS_HEIGHT + "'></canvas>");
var canvasElementTwo = $("<canvas width='" + CANVAS_WIDTH + "' height='" + CANVAS_HEIGHT + "'></canvas>");
var canvasOne = canvasElementOne.get(0).getContext("2d");
var canvasTwo = canvasElementTwo.get(0).getContext("2d");
canvasElementOne.appendTo('#game1');
canvasElementTwo.appendTo('#game2');

var FPS = 60;

setInterval(function() {
    check();
    if(!gameOver) {
        incrementTime();
        update();
        draw();
    }
}, 1000/FPS);

function updateScore() {
    scoreOne = Math.floor((currentTime * Math.floor(SCROLL_SPEED)) / 100);
    scoreTwo = Math.floor((currentTime * Math.floor(SCROLL_SPEED)) / 100);

    document.querySelector('#your_score').innerHTML="Score: " + scoreOne;
    
    document.querySelector('#their_score').innerHTML="Score: " + scoreTwo;
}

function speedUp() {
    SCROLL_SPEED += 0.0005;
}

function incrementTime() {
    var d2 = new Date();
    currentTime = Math.floor(d2.getTime() - startTime);
    if(currentTime % 5 == 0)
        updateScore();
}

function check() {
    //check if player one lost
    if(playerOne.y < 0) {
        playerTwoWins();
        gameOver = true;
    }


    //check if player two lost
    if(playerTwo.y < 0) {
        playerOneWins();
        gameOver = true;
    }
}

function playerOneWins() {
    canvasOne.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    canvasTwo.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    canvasOne.font = "50px Arial";
    canvasTwo.font = "50px Arial";
    canvasOne.fillText("YOU WIN!", (CANVAS_WIDTH / 2) - 50, CANVAS_HEIGHT / 2);
    canvasTwo.fillText("YOU LOSE!", (CANVAS_WIDTH / 2) - 50, CANVAS_HEIGHT / 2);
}

function playerTwoWins() {
    canvasOne.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    canvasTwo.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    canvasOne.font = "50px Arial";
    canvasTwo.font = "50px Arial";
    canvasOne.fillText("YOU LOSE!", (CANVAS_WIDTH / 2) - 50, CANVAS_HEIGHT / 2);
    canvasTwo.fillText("YOU WIN!", (CANVAS_WIDTH / 2) - 50, CANVAS_HEIGHT / 2);
}

function update() { 
    //comment
    speedUp();
	update_blocks();
	move_player1();
	move_player2();

    // playerOne.x = player.x.clamp(0, CANVAS_WIDTH - player.width);
 
    floor_offset_one = floor_offset_one + SCROLL_SPEED;
    floor_offset_two = floor_offset_two + SCROLL_SPEED;
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
		playerOne.x = playerOne.x - PLAYER_SPEED;
        if(playerOne.x < 0) playerOne.x = 0;
    }
	
    if (keydown.d) {
		playerOne.x = playerOne.x + PLAYER_SPEED;
        if(playerOne.x > CANVAS_WIDTH - PLAYER_SIZE) playerOne.x = CANVAS_WIDTH - PLAYER_SIZE;
    }
	
	playerOne.y = playerOne.y + FALL_SPEED;
	for (var i = 0; i < floorsOne.length; i++) {
		if (collision(0, i * FLOOR_HEIGHT - floor_offset_one, floorsOne[i][0], BLOCK_HEIGHT, playerOne.x, playerOne.y, playerOne.width, playerOne.height)) {
			if (playerOne.y + playerOne.height - (i * FLOOR_HEIGHT - floor_offset_one) <= FALL_SPEED + SCROLL_SPEED) {
				playerOne.y = i * FLOOR_HEIGHT - floor_offset_one - playerOne.height;
			}
			else {
				playerOne.x = floorsOne[i][0];
			}
		}
		else if (collision(floorsOne[i][0] + HOLE_WIDTH, i * FLOOR_HEIGHT - floor_offset_one, floorsOne[i][1] - floorsOne[i][0] - HOLE_WIDTH, BLOCK_HEIGHT, playerOne.x, playerOne.y, playerOne.width, playerOne.height)) {
			if (playerOne.y + playerOne.height - (i * FLOOR_HEIGHT - floor_offset_one) <= FALL_SPEED + SCROLL_SPEED) {
				playerOne.y = i * FLOOR_HEIGHT - floor_offset_one - playerOne.height;
			}
			else if (playerOne.x < floorsOne[i][0] + HOLE_WIDTH) {
				playerOne.x = floorsOne[i][0] + HOLE_WIDTH - playerOne.width;
			}
			else {
				playerOne.x = floorsOne[i][1];
			}
		}
		else if (collision(floorsOne[i][1] + HOLE_WIDTH, i * FLOOR_HEIGHT - floor_offset_one, CANVAS_WIDTH - floorsOne[i][1] - HOLE_WIDTH, BLOCK_HEIGHT, playerOne.x, playerOne.y, playerOne.width, playerOne.height)) {
			if (playerOne.y + playerOne.height - (i * FLOOR_HEIGHT - floor_offset_one) <= FALL_SPEED + SCROLL_SPEED) {
				playerOne.y = i * FLOOR_HEIGHT - floor_offset_one - playerOne.height;
			}
			else {
				playerOne.x = floorsOne[i][1] + HOLE_WIDTH - playerOne.width;
			}
		}
	}
	if (playerOne.y > CANVAS_HEIGHT - playerOne.height) playerOne.y = CANVAS_HEIGHT - playerOne.height;
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
	
	playerTwo.y = playerTwo.y + FALL_SPEED;
	for (var i = 0; i < floorsTwo.length; i++) {
		if (collision(0, i * FLOOR_HEIGHT - floor_offset_two, floorsTwo[i][0], BLOCK_HEIGHT, playerTwo.x, playerTwo.y, playerTwo.width, playerTwo.height)) {
			if (playerTwo.y + playerTwo.height - (i * FLOOR_HEIGHT - floor_offset_two) <= FALL_SPEED + SCROLL_SPEED) {
				playerTwo.y = i * FLOOR_HEIGHT - floor_offset_two - playerTwo.height;
			}
			else {
				playerTwo.x = floorsTwo[i][0];
			}
		}
		else if (collision(floorsTwo[i][0] + HOLE_WIDTH, i * FLOOR_HEIGHT - floor_offset_two, floorsTwo[i][1] - floorsTwo[i][0] - HOLE_WIDTH, BLOCK_HEIGHT, playerTwo.x, playerTwo.y, playerTwo.width, playerTwo.height)) {
			if (playerTwo.y + playerTwo.height - (i * FLOOR_HEIGHT - floor_offset_two) <= FALL_SPEED + SCROLL_SPEED) {
				playerTwo.y = i * FLOOR_HEIGHT - floor_offset_two - playerTwo.height;
			}
			else if (playerTwo.x < floorsTwo[i][0] + HOLE_WIDTH) {
				playerTwo.x = floorsTwo[i][0] + HOLE_WIDTH - playerTwo.width;
			}
			else {
				playerTwo.x = floorsTwo[i][1];
			}
		}
		else if (collision(floorsTwo[i][1] + HOLE_WIDTH, i * FLOOR_HEIGHT - floor_offset_two, CANVAS_WIDTH - floorsTwo[i][1] - HOLE_WIDTH, BLOCK_HEIGHT, playerTwo.x, playerTwo.y, playerTwo.width, playerTwo.height)) {
			if (playerTwo.y + playerTwo.height - (i * FLOOR_HEIGHT - floor_offset_two) <= FALL_SPEED + SCROLL_SPEED) {
				playerTwo.y = i * FLOOR_HEIGHT - floor_offset_two - playerTwo.height;
			}
			else {
				playerTwo.x = floorsTwo[i][1] + HOLE_WIDTH - playerTwo.width;
			}
		}
	}
	if (playerTwo.y > CANVAS_HEIGHT - playerTwo.height) playerTwo.y = CANVAS_HEIGHT - playerTwo.height;
}

function update_blocks() {
	// Create a new block if we've scrolled an entire floor length
	if (floor_offset_one >= FLOOR_HEIGHT) {
		for (var i = 0; i < floorsOne.length - 1; i++) {
			floorsOne[i][0] = floorsOne[i+1][0];
			floorsOne[i][1] = floorsOne[i+1][1];
		}
		floorsOne[floorsOne.length - 1][0] = (CANVAS_WIDTH - HOLE_WIDTH) * rng1();
		floorsOne[floorsOne.length - 1][1] = (CANVAS_WIDTH - HOLE_WIDTH) * rng1();
		while (Math.abs(floorsOne[i][0] - floorsOne[i][1]) < HOLE_WIDTH + MIN_GAP) {
			floorsOne[floorsOne.length - 1][1] = (CANVAS_WIDTH - HOLE_WIDTH) * rng1();
		}
		if (floorsOne[i][0] > floorsOne[i][1]) {
			var temp = floorsOne[i][0];
			floorsOne[i][0] = floorsOne[i][1];
			floorsOne[i][1] = temp;
		}
		floor_offset_one = floor_offset_one - FLOOR_HEIGHT;
	}
	
	// Create a new block if we've scrolled an entire floor length
	if (floor_offset_two >= FLOOR_HEIGHT) {
		for (var i = 0; i < floorsTwo.length - 1; i++) {
			floorsTwo[i][0] = floorsTwo[i+1][0];
			floorsTwo[i][1] = floorsTwo[i+1][1];
		}
		floorsTwo[floorsTwo.length - 1][0] = (CANVAS_WIDTH - HOLE_WIDTH) * rng2();
		floorsTwo[floorsTwo.length - 1][1] = (CANVAS_WIDTH - HOLE_WIDTH) * rng2();
		while (Math.abs(floorsTwo[i][0] - floorsTwo[i][1]) < HOLE_WIDTH + MIN_GAP) {
			floorsTwo[floorsTwo.length - 1][1] = (CANVAS_WIDTH - HOLE_WIDTH) * rng2();
		}
		if (floorsTwo[i][0] > floorsTwo[i][1]) {
			var temp = floorsTwo[i][0];
			floorsTwo[i][0] = floorsTwo[i][1];
			floorsTwo[i][1] = temp;
		}
		floor_offset_two = floor_offset_two - FLOOR_HEIGHT;
	}
}
function draw_blocks() {
    for (var i = 0; i < floorsOne.length; i++) {
		canvasOne.fillRect(0, i * FLOOR_HEIGHT - floor_offset_one, floorsOne[i][0], BLOCK_HEIGHT);
		canvasOne.fillRect(floorsOne[i][0] + HOLE_WIDTH, i * FLOOR_HEIGHT - floor_offset_one, floorsOne[i][1] - floorsOne[i][0] - HOLE_WIDTH, BLOCK_HEIGHT);
		canvasOne.fillRect(floorsOne[i][1] + HOLE_WIDTH, i * FLOOR_HEIGHT - floor_offset_one, CANVAS_WIDTH - floorsOne[i][1] - HOLE_WIDTH, BLOCK_HEIGHT);
	}
    for (var i = 0; i < floorsTwo.length; i++) {
		canvasTwo.fillRect(0, i * FLOOR_HEIGHT - floor_offset_two, floorsTwo[i][0], BLOCK_HEIGHT);
		canvasTwo.fillRect(floorsTwo[i][0] + HOLE_WIDTH, i * FLOOR_HEIGHT - floor_offset_two, floorsTwo[i][1] - floorsTwo[i][0] - HOLE_WIDTH, BLOCK_HEIGHT);
		canvasTwo.fillRect(floorsTwo[i][1] + HOLE_WIDTH, i * FLOOR_HEIGHT - floor_offset_two, CANVAS_WIDTH - floorsTwo[i][1] - HOLE_WIDTH, BLOCK_HEIGHT);
	}
}

function collision(x1, y1, w1, h1, x2, y2, w2, h2) {
	if (x1 + w1 <= x2 || x2 + w2 <= x1) return false;
	if (y1 + h1 <= y2 || y2 + h2 <= y1) return false;
	return true;
}

function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}
