console.log("Code Running here");

var CANVAS_WIDTH = 480;
var CANVAS_HEIGHT = 400;

var canvasElementOne = $("<canvas width='" + CANVAS_WIDTH + "' height='" + CANVAS_HEIGHT + "'></canvas>");
var canvasElementTwo = $("<canvas width='" + CANVAS_WIDTH + "' height='" + CANVAS_HEIGHT + "'></canvas>");
var canvasOne = canvasElementOne.get(0).getContext("2d");
var canvasTwo = canvasElementTwo.get(0).getContext("2d");
canvasElementOne.appendTo('#game1');
canvasElementTwo.appendTo('#game2');

var FPS = 30;
setInterval(function() {
    update();
    draw();
}, 1000/FPS);

function update() { 
    //comment
    if (keydown.left) {
        if(playerOne.x >= 37)
            playerOne.x -= 5;
    }

    if (keydown.right) {
        if(playerOne.x <= CANVAS_WIDTH - 37)
            playerOne.x += 5;
    }

    // playerOne.x = player.x.clamp(0, CANVAS_WIDTH - player.width);
 }
function draw() { 
    //comment
    canvasOne.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    canvasTwo.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    playerOne.draw();
    playerTwo.draw();
 }

var playerOne = {
    color: "#33aacc",
    x: 220,
    y: 220,
    width: 32,
    height: 32,
    draw: function() {
        canvasOne.fillStyle = this.color;
        canvasOne.fillRect(this.x, this.y, this.width, this.height);
    }
};

var playerTwo = {
    color: "#eb4f34",
    x: 220,
    y: 220,
    width: 32,
    height: 32,
    draw: function() {
        canvasTwo.fillStyle = this.color;
        canvasTwo.fillRect(this.x, this.y, this.width, this.height);
    }
};

