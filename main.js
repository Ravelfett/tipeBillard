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
  mouse[0] = (p.pageX);
  mouse[1] = (p.pageY);
}, false);

document.onmousedown = function (e) {
  if (e.button == 0) {
    wrld.objects[0].vel.x = (wrld.objects[0].pos.x - mouse[0])/-10;
    wrld.objects[0].vel.y = (wrld.objects[0].pos.y - mouse[1])/-10;
    pressed = true;
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


const pool = new Pool(new Vector(400, 400));
const wrld = new World(pool);
const nobjs = 7;
const size = 14;
let obj = new Obj(wrld, pool.size.x*1/3, pool.size.y/2, size)
obj.c = "red";
const holyid = obj.id;
wrld.objects.push(obj);
for(let i = 0; i < nobjs ; i++){
  for(let j = 0; j <= i; j++){ 
  
    let obj = new Obj(wrld, pool.size.x*2/3+i*size*2, pool.size.y/2+(i/2-(i-j))*size*2*Math.sqrt(2), size)
    wrld.objects.push(obj)
    wrld.quadtree.add(obj);
  }
}


function render(){

  context.clearRect(0, 0, width, height);
  context.beginPath();
  context.fillStyle = "#330055";
  context.rect(0, 0, width, height);
  context.fill();
  context.closePath();

  wrld.update();
  wrld.quadtree = new Quadtree(new Vector(0, 0), pool.size.clone(), 0);
  for(let obj of wrld.objects){
    wrld.quadtree.add(obj);
  }
  /*context.beginPath();
  context.fillStyle = "#326";
  context.rect(mouse[0], mouse[1], 100, 100);
  context.fill();
  context.closePath();
  //console.log(wrld.quadtree.getObjsIn(new Vector(mouse[0], mouse[1]), new Vector(mouse[0]+100, mouse[1]+100)).length)
  for(let obj of wrld.quadtree.getObjsIn(new Vector(mouse[0], mouse[1]), new Vector(mouse[0]+100, mouse[1]+100))){
    obj.s = 1 
  }*/


  wrld.render(context);


  window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);
