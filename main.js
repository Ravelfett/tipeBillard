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
  mouse[0] = ((p.pageX) - width/2)/wrlds[0].zoom;
  mouse[1] = ((p.pageY) - height/2)/wrlds[0].zoom;
}, false);

document.onmousedown = function (e) {
  if (e.button == 0) {
    for(let i = 0; i < wrlds.length; i++){
      let x = Math.floor((Math.random()*wrlds[i].pool.size.x - wrlds[i].pool.size.x/2)*100)/100;
      let y = Math.floor((Math.random()*wrlds[i].pool.size.y - wrlds[i].pool.size.y/2)*100)/100;
      wrlds[i].main.vel.x = (wrlds[i].main.pos.x - x)/-10;
      wrlds[i].main.vel.y = (wrlds[i].main.pos.y - y)/10;
	  wrlds[i].lastHits.push([x, y]);
    }
    pressed = true;
  }
  if (e.button == 2) {
	let max = wrlds.reduce((acc, wrld, i) => {let c = wrld.objects.filter((obj) => obj.s==1).length;if(c > acc[1] && wrld.main.s == 0){return [i, c]}else{return acc}}, [0, 0])
    let parent = wrlds[max[0]];
    console.log(max)
	for(let i = 0; i < 100; i ++){
      if(i != max[0]) wrlds[i] = parent.clone();
	}
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


const wrlds = [];
for(let i = 0; i < 100; i++){
  wrlds.push(new World());
}
const G = 9.81;
const f = 0.01;

let mode = wrlds.length;

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
  context.fillText("Objects: " + (+wrlds[0].objects.length) , 10, 100);
  context.fillText("Zoom: " + wrlds[0].zoom, 10, 150);
  context.fillText("Mouse: " + mouse, 10, 200);
  context.fillText("Mode: " + mode, 10, 250);


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

  for(let k = 0; k < 1; k++){
	  for(let i = 0; i < wrlds.length; i++){
		wrlds[i].update();
		wrlds[i].quadtree.reset();
		for(let obj of wrlds[i].objects){
		  wrlds[i].quadtree.add(obj);
		}
	  }
  }

  if(mode == wrlds.length){
    for(let i = 0; i < wrlds.length; i++){
      wrlds[i].render(context, i==0);
    }
  } else {
    wrlds[mode].render(context, true);
  }


  window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);
