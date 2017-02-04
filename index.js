user = new Object();
user.img = new Image();
user.img.src = 'ship.png';
user.x = 400;
user.y = 500;
user.speed = 10;
canvas = document.getElementById('SHMUP');
ctx = canvas.getContext('2d');



var keys = new Array();
function keydown(event) { keys[event.keyCode] = true; }
function keyup(event) { keys[event.keyCode] = false; }
document.onkeydown = keydown;
document.onkeyup = keyup;



function game_loop()
{
	if (keys[37])
		user.x -= user.speed;
	if (keys[39])
		user.x += user.speed;
	if (keys[38])
		user.y -= user.speed;
	if (keys[40])
		user.y += user.speed;
	user.x = Math.min(Math.max(user.x, user.img.width / 2), canvas.width - user.img.width / 2);
	user.y = Math.min(Math.max(user.y, user.img.height / 2), canvas.height - user.img.height / 2);
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(user.img, user.x - user.img.width / 2, user.y - user.img.height / 2);
	requestAnimationFrame(game_loop);
};
game_loop();