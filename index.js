(function(){

var BULLET_SPEED = 10;
var USER_SPEED = 8;
var MIN_SHOOT_DELAY = 180;// ms
var SCREEN_WIDTH = 1200;
var SCREEN_HEIGHT = 600;
var SPRITES = {
    ship: "img/ship.png",
    bullet: "img/bullet.png",
    background: "img/background.png",
};
var SOUNDS = {
    music: "sound/music.mp3",
};

function create_image(src) {
    var img = new Image();
    img.src = src;
    return img;
}
function play_sound(src) {
    var sound = new Audio(src);
    sound.play();
    return sound;
}
function play_looping_sound(src) {
    var sound = play_sound(src);
    sound.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);
    return sound;
}

var canvas = document.getElementById('SHMUP');
var ctx = canvas.getContext('2d');
play_looping_sound(SOUNDS.music);

var background = {
    x: 0,
    y: 0,
    dx: -5,
    dy: 0,
    width: canvas.width,
    height: canvas.height,
    img: create_image(SPRITES.background),
    update: function() {
		this.x += this.dx;
		this.y += this.dy;
        if(this.x < -this.img.width) {
            this.x += this.img.width;
        }
    },
};
function draw_background() {
	ctx.drawImage(background.img, background.x, 0);
	ctx.drawImage(background.img, background.x + background.img.width, 0);
}

var user = {
    img: create_image(SPRITES.ship),
    x: 400,
    y: 500,
    speed: USER_SPEED,
    update: function() {
		this.x += this.dx;
		this.y += this.dy;
        // Stay inside screen
        user.x = Math.min(Math.max(user.x, user.img.width / 2), canvas.width - user.img.width / 2);
        user.y = Math.min(Math.max(user.y, user.img.height / 2), canvas.height - user.img.height / 2);
    },
    last_bullet_shot_at: null,
    shoot: function() {
        var current_time = new Date();
        if(this.last_bullet_shot_at && current_time - this.last_bullet_shot_at < MIN_SHOOT_DELAY) {
            return;
        }
        this.last_bullet_shot_at = current_time;
		bullets.push({
			x: user.x + user.img.width / 8 * 3,
			y: user.y,
			dx: BULLET_SPEED,
			dy: 0,
            img: bullet_image,
            update: function() {
                this.x += this.dx;
                this.y += this.dy;
            }
		});
    }
};

// Bullets
var bullets = [];
var bullet_image = create_image(SPRITES.bullet);

function draw_object(obj) {
	ctx.drawImage(obj.img, obj.x - obj.img.width / 2, obj.y - obj.img.height / 2);
}

var keys = [];
function keydown(event) { keys[event.keyCode] = true; }
function keyup(event) { keys[event.keyCode] = false; }
document.onkeydown = keydown;
document.onkeyup = keyup;
function get_player_input() {
	if (keys[32]) {
        user.shoot();
	}
    user.dx = 0;
    user.dy = 0;
	if (keys[37])
		user.dx = -user.speed;
	if (keys[39])
		user.dx = user.speed;
	if (keys[38])
		user.dy = -user.speed;
	if (keys[40])
		user.dy = user.speed;
}

function game_loop()
{
	// input
    get_player_input();

	// background
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
    // update state
    background.update();
    for(var b = 0; b < bullets.length; b++) {
        bullets[b].update();
    }
    user.update();

	// draw objects
	draw_background();
    for(b = 0; b < bullets.length; b++) {
		draw_object(bullets[b]);
	}
	draw_object(user);
	
	requestAnimationFrame(game_loop);
}

game_loop();
})();
