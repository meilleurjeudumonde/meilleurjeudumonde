(function(){

var BULLET_SPEED = 10;
var USER_SPEED = 8;
var SCREEN_WIDTH = 1200;
var SCREEN_HEIGHT = 600;
var SPRITES = {
    ship: "img/ship.png",
    bullet: "img/bullet.png",
    background: "img/background.png",
};

function create_image(src) {
    var img = new Image();
    img.src = src;
    return img;
}

var canvas = document.getElementById('SHMUP');
var ctx = canvas.getContext('2d');
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
        var min_shoot_delay = 400;// ms
        if(this.last_bullet_shot_at && current_time - this.last_bullet_shot_at < min_shoot_delay) {
            return;
        }
        this.last_bullet_shot_at = current_time;
		bullets.push({
			x: user.x,
			y: user.y,
			dx: BULLET_SPEED,
			dy: 0,
            img: create_image(SPRITES.bullet),
            update: function() {
                this.x += this.dx;
                this.y += this.dy;
            }
		});
    }
};
bullets = [];

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
