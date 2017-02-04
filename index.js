(function(){

function create_image(src) {
    var img = new Image();
    img.src = src;
    return img;
}

canvas = document.getElementById('SHMUP');
ctx = canvas.getContext('2d');
user = {
    img: create_image('ship.png'),
    x: 400,
    y: 500,
    speed: 10,
    update: function() {
		this.x += this.dx;
		this.y += this.dy;
        // Stay inside screen
        user.x = Math.min(Math.max(user.x, user.img.width / 2), canvas.width - user.img.width / 2);
        user.y = Math.min(Math.max(user.y, user.img.height / 2), canvas.height - user.img.height / 2);
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
		bullets.push({
			x: user.x,
			y: user.y,
			dx: 10,
			dy: 0,
            img: create_image('bullet.png'),
            update: function() {
                this.x += this.dx;
                this.y += this.dy;
            }
		});
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
    user.update();
    for(var b = 0; b < bullets.length; b++) {
        bullets[b].update();
    }

	// draw aobjects
	draw_object(user);
    for(var b = 0; b < bullets.length; b++) {
		draw_object(bullets[b]);
	}
	
	requestAnimationFrame(game_loop);
}

game_loop();
})();
