const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");


var width = window.innerWidth;
var height = window.innerHeight;

canvas.width = width;
canvas.height = height;


let mouse = [0, 0];
let pressed = false;
document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('mousemove', (p) => {
  mouse[0] = ((p.pageX) - width/2)/wrld.zoom;
  mouse[1] = ((p.pageY) - height/2)/wrld.zoom;
}, false);

document.onmousedown = function (e) {
  if (e.button == 0) {
    wrld.main.vel.x = (wrld.main.pos.x - mouse[0])/-10;
    wrld.main.vel.y = (wrld.main.pos.y - mouse[1])/-10;
    pressed = true;
  }
  if (e.button == 2) {
    wrld.mode = (wrld.mode + 1) % 2;
  }
};

document.onmouseup = function (e) {
  if (e.button == 0) {
    pressed = false;
  }
};

function dotProduct(x1, y1, x2, y2) {
  return x1 * x2 + y1 * y2;
}


const pool = new Pool(new Vector(2300, 2300/2));
const wrld = new World(pool);
const nobjs = 1;
const size = 16;
const G = 9.81;
const f = 0.01;


const frames = [];


//let time = -200;
//const data = [];

function render(){  
  //time ++;

  context.clearRect(0, 0, width, height);
  context.beginPath();
  context.fillStyle = "#330055";
  context.rect(0, 0, width, height);
  context.fill();
  context.closePath();


  frames.push(Date.now());
  while(frames.length > 0 && frames[0] <= Date.now() - 1000){
    frames.shift();
  }
  context.font = "30px Arial";
  context.fillStyle = "white";
  context.fillText("FPS: " + frames.length, 10, 50);
  context.fillText("Objects: " + (+wrld.objects.length) , 10, 100);
  context.fillText("Zoom: " + wrld.zoom, 10, 150);
  context.fillText("Mouse: " + mouse, 10, 200);
  context.fillText("Mode: " + wrld.mode, 10, 250);


  //context.fillText("Time: " + time, 10, 300);

  /*let stime = 4;
  if(time > stime && frames.length > 10){
    time = 0;
    data.push(frames.length);
    let x = Math.random()*pool.size.x - pool.size.x/2;
    let y = Math.random()*pool.size.y - pool.size.y/2;
    let obj = new Obj(wrld, x, y, size);
    wrld.objects.push(obj);
    wrld.objects[6].vel.x = (wrld.objects[6].pos.x - x)/-25;
    wrld.objects[6].vel.y = (wrld.objects[6].pos.y - y)/-25;
  }*/


  wrld.update();
  wrld.quadtree.reset();
  for(let obj of wrld.objects){
    wrld.quadtree.add(obj);
  }

  wrld.render(context);


  window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);
