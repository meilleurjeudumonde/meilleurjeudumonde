(function(){

var BACKGROUND_SCROLL_SPEED = 6;
var BULLET_SPEED = 10;
var USER_SPEED = 8;
var MIN_SHOOT_DELAY = 180;// ms
var SCREEN_WIDTH = 1200;
var SCREEN_HEIGHT = 600;
var SPRITES = {
    ship: "img/ship.png",
    bullet: "img/bullet.png",
    background: "img/background.png",
    enemy: "img/enemy4.png",
};
var SOUNDS = {
    music: "sound/music.mp3",
};
var OUT_OF_GAME_MARGIN = 200;

var ENEMY_SPAWN_PROBABILITY_PER_SECOND = 0.8;
var ENEMY_SPEED = 4;

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

// Create game
var canvas = document.getElementById('SHMUP');
var ctx = canvas.getContext('2d');
play_looping_sound(SOUNDS.music);

function draw_background() {
	ctx.drawImage(background.img, background.x, 0);
	ctx.drawImage(background.img, background.x + background.img.width - 1, 0);
}

// Create visible objects
var VisibleObject = function(x, y, dx, dy, img) {
    this.init = function(x, y, dx, dy, img) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;

        this.img = img;
    };

    this.move = function() {
        this.x += this.dx;
        this.y += this.dy;
    };

    this.update = function(){};

    this.draw = function() {
	    ctx.drawImage(this.img, this.x - this.img.width / 2, this.y - this.img.height / 2);
    };
};

// User
var User = function() {
    this.init(400, 500, 0, 0, create_image(SPRITES.ship));

    this.last_bullet_shot_at = null;
    this.shoot = function() {
        var current_time = new Date();
        if(this.last_bullet_shot_at && current_time - this.last_bullet_shot_at < MIN_SHOOT_DELAY) {
            return;
        }
        this.last_bullet_shot_at = current_time;
		bullets.push(new Bullet(user.x + user.img.width / 8 * 3, user.y));
    };

    this.update = function() {
        // Stay inside screen
        this.x = Math.min(Math.max(this.x, this.img.width / 4), canvas.width - this.img.width / 4);
        this.y = Math.min(Math.max(this.y, this.img.height / 4), canvas.height - this.img.height / 4);
    };
};
User.prototype = new VisibleObject();
var user = new User();

// Bullets
var Bullet = function(x, y) {
    this.init(x, y, BULLET_SPEED, 0, bullet_image);
};
Bullet.prototype = new VisibleObject();
var bullets = [];
var bullet_image = create_image(SPRITES.bullet);

// Background
var Background = function() {
    this.init(0, 0, -BACKGROUND_SCROLL_SPEED, 0, create_image(SPRITES.background));

    this.update = function() {
		this.x += this.dx;
		this.y += this.dy;
        if(this.x < -this.img.width) {
            this.x += this.img.width;
        }
    };

    this.draw = function() {
	    ctx.drawImage(this.img, this.x, 0);
        ctx.drawImage(this.img, this.x + this.img.width - 1, 0);
    };
};
Background.prototype = new VisibleObject();
var background = new Background();

// Enemies
var enemies = [];
var enemy_image = create_image(SPRITES.enemy);

var last_enemy_spawn_check = new Date();
function should_spawn_enemy() {
    current_time = new Date();

    var result = Math.random() < (current_time - last_enemy_spawn_check) / 1000 * ENEMY_SPAWN_PROBABILITY_PER_SECOND;
    last_enemy_spawn_check = current_time;

    return result;
}
function create_enemy() {
    var x = SCREEN_WIDTH + 20;
    var y = Math.random() * SCREEN_HEIGHT;
    return new Enemy(x, y);
}
var Enemy = function(x, y) {
    this.init(x, y, -ENEMY_SPEED, 0, enemy_image);
};
Enemy.prototype = new VisibleObject();


// Process series of objects functions
function move_objects(objects) {
    for(var i = 0; i < objects.length; i++) {
        objects[i].move();
    }
}
function update_objects(objects) {
    for(var i = 0; i < objects.length; i++) {
        objects[i].update();
    }
}
function draw_objects(objects) {
    for(var i = 0; i < objects.length; i++) {
		objects[i].draw();
	}
}

// Manage user input
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
	if (keys[37] || keys[81])
		user.dx = -USER_SPEED;
	if (keys[39] || keys[68])
		user.dx = USER_SPEED;
	if (keys[38] || keys[90])
		user.dy = -USER_SPEED;
	if (keys[40] || keys[83])
		user.dy = USER_SPEED;
}

function remove_objects_out_of_screen(objects) {
    for(b = objects.length - 1; b >= 0; b--) {
        var x = objects[b].x;
        var y = [b].y;

        if(x < -OUT_OF_GAME_MARGIN ||
            x > SCREEN_WIDTH + OUT_OF_GAME_MARGIN ||
            y < -OUT_OF_GAME_MARGIN ||
            y > SCREEN_HEIGHT + OUT_OF_GAME_MARGIN) {
            objects.splice(b, 1);
        }
    }

}

function collide(objects1, objects2) {
    for(var i1 = objects1.length - 1; i1 >= 0; i1--) {
        var i2 = find_colliding(objects1[i1], objects2);
        if(i2 >= 0) {
            objects1.splice(i1, 1);
            objects2.splice(i2, 1);
            // TODO call destroy
        }
    }
}

function find_colliding(object, objects) {
    for(var i = 0; i < objects.length; i++) {
        var distx = Math.abs(object.x - objects[i].x);
        var disty = Math.abs(object.y - objects[i].y);
        if(distx <= Math.max(object.img.width / 2, objects[i].img.width / 2) &&
            disty <= Math.max(object.img.height / 2, objects[i].img.height / 2)) {
            return i;
        }
    }
    return -1;
}

function game_loop()
{
	// input
    get_player_input();

	// background
	ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move
    user.move();
    background.move();
    move_objects(bullets);
    move_objects(enemies);

    // update state
    user.update();
    background.update();
    update_objects(bullets);
    update_objects(enemies);

    if(should_spawn_enemy()) {
        enemies.push(create_enemy());
    }

    collide(bullets, enemies);

    // remove objects out of screen
    remove_objects_out_of_screen(bullets);
    remove_objects_out_of_screen(enemies);

	// draw objects
	background.draw();
    draw_objects(bullets);
    draw_objects(enemies);
	user.draw();

	requestAnimationFrame(game_loop);
}

window.onblur = function(){
    // prevent key bug when we lose
    keys = [];
};

game_loop();
})();
