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
    enemy: "img/enemy4.png",
};
var SOUNDS = {
    music: "sound/music.mp3",
};
var OUT_OF_GAME_MARGIN = 200;

var ENEMY_SPAWN_PROBABILITY_PER_SECOND = 0.2;
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
var user = {
    img: create_image(SPRITES.ship),
    x: 400,
    y: 500,
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

    return {
        x: x,
        y: y,
        dx: -ENEMY_SPEED,
        dy: 0,
        img: enemy_image,
        update: function() {
            this.x += this.dx;
            this.y += this.dy;
        }
    };
}

// Bullets
var bullets = [];
var bullet_image = create_image(SPRITES.bullet);

// Enemies
var enemies = [];
var enemy_image = create_image(SPRITES.enemy);

// Draw functions
function draw_objects(objects) {
    for(var i = 0; i < objects.length; i++) {
		draw_object(objects[i]);
	}
}
function draw_object(obj) {
	ctx.drawImage(obj.img, obj.x - obj.img.width / 2, obj.y - obj.img.height / 2);
}

// Update functions
function update_objects(objects) {
    for(var i = 0; i < objects.length; i++) {
        objects[i].update();
    }
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

    // update state
    background.update();
    update_objects(bullets);
    update_objects(enemies);
    user.update();

    if(should_spawn_enemy()) {
        enemies.push(create_enemy());
    }

    collide(bullets, enemies);

    // remove objects out of screen
    remove_objects_out_of_screen(bullets);
    remove_objects_out_of_screen(enemies);

	// draw objects
	draw_background();
    draw_objects(bullets);
    draw_objects(enemies);
	draw_object(user);

	requestAnimationFrame(game_loop);
}

game_loop();
})();
