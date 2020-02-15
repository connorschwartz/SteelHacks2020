console.log("Code Running here");

var CANVAS_WIDTH = 480;
var CANVAS_HEIGHT = 400;
var FLOOR_HEIGHT = 70;		// Height of floor block plus gap
var BLOCK_HEIGHT = 20;		// Height of floor block
var HOLE_WIDTH = 40;		// Width of holes in the block
var MIN_GAP = 20;			// Minimum distance between holes
var PLAYER_SIZE = 32;
var PLAYER_SPEED = 3;
var FALL_SPEED = 2;
var INITIAL_SCROLL_SPEED = 1;
var SCROLL_SPEEDUP = 0.0005;
var SLOW_DURATION = 60;	// Length of slowdown powerup
var SLOW_SCROLL = 0.75;		// Speed during slowdowns
var CHANCE_SLOWDOWN = 0.1;	// Chance of a slowdown powerup appearing
var SLOWDOWN_SIZE = 10;		// Size of slowdown powerup
var NUM_FLOORS = Math.ceil(CANVAS_HEIGHT/FLOOR_HEIGHT) + 1;		// Need one extra floor to help phase in and out
var TEXT_SIZE = 250;
var SCROLL_SPEEDUP = 0.0005;
var totalFloorsOne = 0;
var totalFloorsTwo = 0;
var floor_offset_one = 0;
var floor_offset_two = 0;
var scroll_speed_one = INITIAL_SCROLL_SPEED;
var scroll_speed_two = INITIAL_SCROLL_SPEED;
var slowed_time_one = -SLOW_DURATION;
var slowed_time_two = -SLOW_DURATION;

var gameOver = false;
var d = new Date();
var startTime = d.getTime();
var currentTime = 1;
var scoreOne = 0;
var scoreTwo = 0;
var playerOneLost = false;
var playerTwoLost = false;
var playerMovement = 0;
var powerupDestroyed = -1;

var canvasElementOne = $("<canvas width='" + CANVAS_WIDTH + "' height='" + CANVAS_HEIGHT + "'></canvas>");
var canvasElementTwo = $("<canvas width='" + CANVAS_WIDTH + "' height='" + CANVAS_HEIGHT + "'></canvas>");
var canvasOne = canvasElementOne.get(0).getContext("2d");
var canvasTwo = canvasElementTwo.get(0).getContext("2d");
canvasElementOne.appendTo('#game1');
canvasElementTwo.appendTo('#game2');

var FPS = 60;
var laps = 0;

var socket; // for network
var floorsOne;
var floorsTwo;
var rng1;
var rng2;
var otherRand = -1;
var opponentScroll = 0;

var myRand = Math.floor(Math.random() * 1000000);

prepNetwork()
//need to wait until the other player is ready!

getColorStyle = function(count) {
    r = 256;
    g = 0;
    b = 0;
    count = count %  1024
    
    if (count < 256){
    g = count;
    }
    else if (count < 512) {
    g = 256;
    r = 256 - count % 256;
    b = count % 256;
    }
    else if (count < 768) {
    r= 0;
    g = 256 - count % 256;
    b = 256
    }
    else {
        r = count % 256;
      g = 0;
      b = 256 - count % 256;
    }
    
    return 'rgb('+r+',' + g + ',' + b + ')';
    }

function updateScore() {
    if (!playerOneLost) scoreOne += Math.floor((currentTime * Math.floor(INITIAL_SCROLL_SPEED)) / 1250);
    if (!playerTwoLost) scoreTwo += Math.floor((currentTime * Math.floor(INITIAL_SCROLL_SPEED)) / 1250);

    document.querySelector('#your_score').innerHTML="Score: " + scoreOne;
    
    document.querySelector('#their_score').innerHTML="Score: " + scoreTwo;
}

function speedUp() {
	scroll_speed_one += SCROLL_SPEEDUP;
    scroll_speed_two += SCROLL_SPEEDUP;
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
        playerOneLost = true;
		playerOneLoses();
    }

    //check if player two lost
    if(playerTwo.y < 0) {
        playerTwoLost = true;
		playerTwoLoses();
    }
	
	// Check if game ended (both players lost)
	if (playerOneLost && playerTwoLost) {
		gameOver = true;
		if (scoreOne > scoreTwo) playerOneWins();
		else playerTwoWins();
	}
}

function playerOneLoses() {
    canvasOne.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    canvasOne.font = "50px Arial";
    canvasOne.fillText("Score: " + scoreOne, (CANVAS_WIDTH / 2) - 50, CANVAS_HEIGHT / 2);
}

function playerOneWins() {
    canvasOne.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    canvasTwo.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    canvasOne.font = "50px Arial";
    canvasTwo.font = "50px Arial";
    canvasOne.fillText("YOU WIN!", (CANVAS_WIDTH / 2) - 50, CANVAS_HEIGHT / 2);
    canvasTwo.fillText("YOU LOSE!", (CANVAS_WIDTH / 2) - 50, CANVAS_HEIGHT / 2);
}

function playerTwoLoses() {
    canvasTwo.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    canvasTwo.font = "50px Arial";
    canvasTwo.fillText("Score: " + scoreTwo, (CANVAS_WIDTH / 2) - 50, CANVAS_HEIGHT / 2);
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
	if (!playerOneLost) update_blocks1();
	if (!playerTwoLost) update_blocks2();
	if (!playerOneLost) move_player1();
	//if (!playerTwoLost) move_player2();
	
	if (!playerOneLost) {
		if (laps - slowed_time_one < SLOW_DURATION) {
			playerMovement = SLOW_SCROLL;
		}
		else {
			playerMovement = scroll_speed_one;
		}
		floor_offset_one = floor_offset_one + playerMovement;
	}
	if (!playerTwoLost) {
		floor_offset_two = floor_offset_two + opponentScroll;
		opponentScroll = 0;
	}
}
function draw() { 
    //comment
    if (!playerOneLost) canvasOne.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if (!playerTwoLost) canvasTwo.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if (!playerOneLost) playerOne.draw();
    if (!playerTwoLost) playerTwo.draw();
    if (!playerOneLost) draw_blocks1();
    if (!playerTwoLost) draw_blocks2();
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
    if (playerOneLost) return;
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
			if (playerOne.y + playerOne.height - (i * FLOOR_HEIGHT - floor_offset_one) <= FALL_SPEED + scroll_speed_one) {
				playerOne.y = i * FLOOR_HEIGHT - floor_offset_one - playerOne.height;
			}
			else {
				playerOne.x = floorsOne[i][0];
			}
		}
		else if (collision(floorsOne[i][0] + HOLE_WIDTH, i * FLOOR_HEIGHT - floor_offset_one, floorsOne[i][1] - floorsOne[i][0] - HOLE_WIDTH, BLOCK_HEIGHT, playerOne.x, playerOne.y, playerOne.width, playerOne.height)) {
			if (playerOne.y + playerOne.height - (i * FLOOR_HEIGHT - floor_offset_one) <= FALL_SPEED + scroll_speed_one) {
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
			if (playerOne.y + playerOne.height - (i * FLOOR_HEIGHT - floor_offset_one) <= FALL_SPEED + scroll_speed_one) {
				playerOne.y = i * FLOOR_HEIGHT - floor_offset_one - playerOne.height;
			}
			else {
				playerOne.x = floorsOne[i][1] + HOLE_WIDTH - playerOne.width;
			}
		}
		
		if (floorsOne[i][2] > 0 && collision(floorsOne[i][2], i * FLOOR_HEIGHT - floor_offset_one - (FLOOR_HEIGHT - BLOCK_HEIGHT) / 2, SLOWDOWN_SIZE, SLOWDOWN_SIZE, playerOne.x, playerOne.y, playerOne.width, playerOne.height)) {
			floorsOne[i][2] = -1;
			powerupDestroyed = i;
            slowed_time_one = laps;
            if (!playerOneLost) scoreOne += 100;
		}
	}
	if (playerOne.y > CANVAS_HEIGHT - playerOne.height) playerOne.y = CANVAS_HEIGHT - playerOne.height;
}

function move_player2() {
    if (playerTwoLost) return;
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
			if (playerTwo.y + playerTwo.height - (i * FLOOR_HEIGHT - floor_offset_two) <= FALL_SPEED + scroll_speed_two) {
				playerTwo.y = i * FLOOR_HEIGHT - floor_offset_two - playerTwo.height;
			}
			else {
				playerTwo.x = floorsTwo[i][0];
			}
		}
		else if (collision(floorsTwo[i][0] + HOLE_WIDTH, i * FLOOR_HEIGHT - floor_offset_two, floorsTwo[i][1] - floorsTwo[i][0] - HOLE_WIDTH, BLOCK_HEIGHT, playerTwo.x, playerTwo.y, playerTwo.width, playerTwo.height)) {
			if (playerTwo.y + playerTwo.height - (i * FLOOR_HEIGHT - floor_offset_two) <= FALL_SPEED + scroll_speed_two) {
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
			if (playerTwo.y + playerTwo.height - (i * FLOOR_HEIGHT - floor_offset_two) <= FALL_SPEED + scroll_speed_two) {
				playerTwo.y = i * FLOOR_HEIGHT - floor_offset_two - playerTwo.height;
			}
			else {
				playerTwo.x = floorsTwo[i][1] + HOLE_WIDTH - playerTwo.width;
			}
		}
		
		if (floorsTwo[i][2] > 0 && collision(floorsTwo[i][2], i * FLOOR_HEIGHT - floor_offset_two - (FLOOR_HEIGHT - BLOCK_HEIGHT) / 2, SLOWDOWN_SIZE, SLOWDOWN_SIZE, playerTwo.x, playerTwo.y, playerTwo.width, playerTwo.height)) {
			floorsTwo[i][2] = -1;
            slowed_time_two = laps;
            if (!playerTwoLost) scoreTwo += 100;
		}
	}
	if (playerTwo.y > CANVAS_HEIGHT - playerTwo.height) playerTwo.y = CANVAS_HEIGHT - playerTwo.height;
}

function update_blocks1() {
	// Create a new block if we've scrolled an entire floor length
	if (floor_offset_one >= FLOOR_HEIGHT) {
        totalFloorsOne++;
		for (var i = 0; i < floorsOne.length - 1; i++) {
			floorsOne[i][0] = floorsOne[i+1][0];
			floorsOne[i][1] = floorsOne[i+1][1];
			floorsOne[i][2] = floorsOne[i+1][2];
		}
		floorsOne[floorsOne.length - 1][0] = (CANVAS_WIDTH - HOLE_WIDTH) * rng1();
		floorsOne[floorsOne.length - 1][1] = (CANVAS_WIDTH - HOLE_WIDTH) * rng1();
		while (Math.abs(floorsOne[floorsOne.length - 1][0] - floorsOne[floorsOne.length - 1][1]) < HOLE_WIDTH + MIN_GAP) {
			floorsOne[floorsOne.length - 1][1] = (CANVAS_WIDTH - HOLE_WIDTH) * rng1();
		}
		if (floorsOne[floorsOne.length - 1][0] > floorsOne[floorsOne.length - 1][1]) {
			var temp = floorsOne[floorsOne.length - 1][0];
			floorsOne[floorsOne.length - 1][0] = floorsOne[floorsOne.length - 1][1];
			floorsOne[floorsOne.length - 1][1] = temp;
		}
		floor_offset_one = floor_offset_one - FLOOR_HEIGHT;
		floorsOne[floorsOne.length - 1][2] = -1;
		if (rng1() < CHANCE_SLOWDOWN) {
			floorsOne[floorsOne.length - 1][2] = (CANVAS_WIDTH - SLOWDOWN_SIZE) * rng1();
		}
        totalFloorsOne++;
		floorsOne[floorsTwo.length - 1][3] = totalFloorsOne;
	}
}

function update_blocks2() {
	// Create a new block if we've scrolled an entire floor length
	if (floor_offset_two >= FLOOR_HEIGHT) {
		for (var i = 0; i < floorsTwo.length - 1; i++) {
			floorsTwo[i][0] = floorsTwo[i+1][0];
			floorsTwo[i][1] = floorsTwo[i+1][1];
			floorsTwo[i][2] = floorsTwo[i+1][2];
		}
		floorsTwo[floorsTwo.length - 1][0] = (CANVAS_WIDTH - HOLE_WIDTH) * rng2();
		floorsTwo[floorsTwo.length - 1][1] = (CANVAS_WIDTH - HOLE_WIDTH) * rng2();
		while (Math.abs(floorsTwo[i][0] - floorsTwo[i][1]) < HOLE_WIDTH + MIN_GAP) {
			floorsTwo[floorsTwo.length - 1][1] = (CANVAS_WIDTH - HOLE_WIDTH) * rng2();
		}
		if (floorsTwo[floorsTwo.length - 1][0] > floorsTwo[floorsTwo.length - 1][1]) {
			var temp = floorsTwo[floorsTwo.length - 1][0];
			floorsTwo[floorsTwo.length - 1][0] = floorsTwo[floorsTwo.length - 1][1];
			floorsTwo[floorsTwo.length - 1][1] = temp;
		}
		floor_offset_two = floor_offset_two - FLOOR_HEIGHT;
		floorsTwo[floorsTwo.length - 1][2] = -1;
		if (rng2() < CHANCE_SLOWDOWN) {
			floorsTwo[floorsTwo.length - 1][2] = (CANVAS_WIDTH - SLOWDOWN_SIZE) * rng2();
		}
        totalFloorsTwo++;
		floorsTwo[floorsTwo.length - 1][3] = totalFloorsTwo;
	}
}

function draw_blocks1() {
    for (var i = 0; i < floorsOne.length; i++) {
        canvasOne.fillStyle = getColorStyle(laps / 4);
		canvasOne.fillRect(0, i * FLOOR_HEIGHT - floor_offset_one, floorsOne[i][0], BLOCK_HEIGHT);
		canvasOne.fillRect(floorsOne[i][0] + HOLE_WIDTH, i * FLOOR_HEIGHT - floor_offset_one, floorsOne[i][1] - floorsOne[i][0] - HOLE_WIDTH, BLOCK_HEIGHT);
		canvasOne.fillRect(floorsOne[i][1] + HOLE_WIDTH, i * FLOOR_HEIGHT - floor_offset_one, CANVAS_WIDTH - floorsOne[i][1] - HOLE_WIDTH, BLOCK_HEIGHT);
		if (floorsOne[i][2] > 0) {
            canvasOne.fillStyle = "#00FF00";
			canvasOne.fillRect(floorsOne[i][2], i * FLOOR_HEIGHT - floor_offset_one - (FLOOR_HEIGHT - BLOCK_HEIGHT) / 2, SLOWDOWN_SIZE, SLOWDOWN_SIZE);
		}
    }
}

function draw_blocks2() {
    for (var i = 0; i < floorsTwo.length; i++) {
        canvasTwo.fillStyle = getColorStyle(laps / 4);
		canvasTwo.fillRect(0, i * FLOOR_HEIGHT - floor_offset_two, floorsTwo[i][0], BLOCK_HEIGHT);
		canvasTwo.fillRect(floorsTwo[i][0] + HOLE_WIDTH, i * FLOOR_HEIGHT - floor_offset_two, floorsTwo[i][1] - floorsTwo[i][0] - HOLE_WIDTH, BLOCK_HEIGHT);
		canvasTwo.fillRect(floorsTwo[i][1] + HOLE_WIDTH, i * FLOOR_HEIGHT - floor_offset_two, CANVAS_WIDTH - floorsTwo[i][1] - HOLE_WIDTH, BLOCK_HEIGHT);
		if (floorsTwo[i][2] > 0) {
            canvasTwo.fillStyle = "#00FF00";
			canvasTwo.fillRect(floorsTwo[i][2], i * FLOOR_HEIGHT - floor_offset_two - (FLOOR_HEIGHT - BLOCK_HEIGHT) / 2, SLOWDOWN_SIZE, SLOWDOWN_SIZE);
		}
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

function sendRand(randomNum) {
	// Send randomNum (an integer)
	socket.emit('rand', randomNum);
}

function gotRand(randomNum) {
	// recieve other person's random (an integer)
	otherRand = randomNum;
	prepRandoms();
	startGame();
}

function sendData(x, y, shift, powerup, died) {
	// Send x position (integer), y position (integer), vertical shift (integer), index of destroyed powerup (integer), whether the player died (bool)
	socket.emit('data', JSON.stringify([x,y,shift,powerup,died]));
}

function gotData(x,y,shift,powerup,died) {
	// Receive other person's x position (integer), y position (integer), vertical shift (integer), index of destroyed powerup (integer), whether the player died (bool)
	playerTwo.x = x;
	playerTwo.y = y;
	opponentScroll = shift;
	for (var i = 0; i < floorsTwo.length; i++) {
		if (floorsTwo[i][3] == powerup && floorsTwo[i][2] >= 0) {
			floorsTwo[i][2] = -1;
			scoreTwo += 100;
		}
	}
	if (died) playerTwoLost = true;
}

function prepRandoms() {
	rng1 = mulberry32(myRand);
	rng2 = mulberry32(otherRand);

	// Create a 2d array to hold locations where gaps start for each floor block
	floorsOne = new Array(NUM_FLOORS);
	for (var i = 0; i < floorsOne.length; i++) {
		floorsOne[i] = new Array(4);
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
		floorsOne[i][2] = -1;
		if (rng1() < CHANCE_SLOWDOWN) {
			floorsOne[i][2] = (CANVAS_WIDTH - SLOWDOWN_SIZE) * rng1();
		}
		totalFloorsOne++;
		floorsOne[i][3] = totalFloorsOne;
	}

	// Create a 2d array to hold locations where gaps start for each floor block
	floorsTwo = new Array(NUM_FLOORS);
	for (var i = 0; i < floorsTwo.length; i++) {
		floorsTwo[i] = new Array(3);
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
		floorsTwo[i][2] = -1;
		if (rng2() < CHANCE_SLOWDOWN) {
			floorsTwo[i][2] = (CANVAS_WIDTH - SLOWDOWN_SIZE) * rng2();
		}
		totalFloorsTwo++;
		floorsTwo[i][3] = totalFloorsTwo;
	}
}

function startGame() {
	setInterval(function() {
		sendData(playerOne.x, playerOne.y, playerMovement, powerupDestroyed, playerOneLost);
		powerupDestroyed = -1;
		check();
		if(!gameOver) {
			incrementTime();
			update();
			draw();
		}
		laps++;
	}, 1000/FPS);
}

//begin networking code
function prepNetwork(){
	socket = io();
	$('#submitRoom').on('click', function(e) {
		e.preventDefault();
		if($('#room').val())
			socket.emit('join room', $('#room').val());
	})
	socket.on('count', function(msg){
	  msg = +msg;
	  if(msg == 1)
	  {
		  alert('You are the first player, please wait');
		  $('#roomSelection').hide();
	  }
	  if(msg == 2)
	  {
		  alert('You are player 2, game starts now!');
		  sendRand(myRand);
		  $('#roomSelection').hide();
	  }
	  if(msg == 3)
	  {
		  alert('please try to select another room.  This one is full.')
	  }
	});
	socket.on('start game', function(msg){
		alert('both players ready!  Begin')
		sendRand(myRand);
	})
	socket.on('disconnected', function(msg) {
		alert('other player disconnected');
	})

	socket.on('rand', function(msg) {
		gotRand(+msg);
	})

	socket.on('data', function(msg) {
		let arr = JSON.parse(msg);
		let x = +arr[0];
		let y = +arr[1];
		let shift = +arr[2];
		let powerup = +arr[3];
		let died = arr[4] === "false" ? false : true;
		gotData(x,y,shift,powerup,died);
	})

}