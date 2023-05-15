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


class World{
  constructor(){
    this.objects = [];
  }
  render(ctx){
    for(let i in this.objects){
      this.objects[i].render(ctx);
    }
  }
  update(){
    for(let i in this.objects){
      this.objects[i].update();
    }
    for(let i in this.objects){
      for(let j in this.objects){
        if(i != j){
          let x1 = this.objects[i].pos.x, x2 = this.objects[j].pos.x;
          let y1 = this.objects[i].pos.y, y2 = this.objects[j].pos.y;
          let dist = Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
          let r1 = this.objects[i].r, r2 = this.objects[j].r;
          if(dist < r1 + r2){
            let diffx = (x1-x2)/dist;
            let diffy = (y1-y2)/dist;
            let dot = dotProduct(diffx, diffy, this.objects[i].vel.x, this.objects[i].vel.y);
            this.objects[i].vel.x += -2 * diffx * dot;
            this.objects[i].vel.y += -2 * diffy * dot;
            this.objects[i].pos.x -= diffx * (dist-r1-r2)
            this.objects[i].pos.y -= diffy * (dist-r1-r2)
          }
        }
      }
    }
  }
}

class Vector{
  constructor(x, y){
    this.x = x;
    this.y = y;
  }
  add(v){
    return new Vector(this.x+v.x, this.y+v.y);
  }
  mult(s){
    return new Vector(this.x*s, this.y*s);
  }
}


class Object{
  constructor(x, y, r){
    this.pos = new Vector(x, y);
    this.vel = new Vector(0, 0);
    this.acc = new Vector(0, 0);
    this.r = r;
  }
  render(ctx){
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2*Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
  }
  update(){
    let f = new Vector(0, 0)//this.vel.mult(-0.01);
    this.acc = this.acc.add(f);
    this.vel = this.vel.add(this.acc);
    this.pos = this.pos.add(this.vel);
    this.acc = new Vector(0, 0);
    if(this.pos.x-this.r < 0) this.vel.x = Math.abs(this.vel.x);
    if(this.pos.x+this.r > width) this.vel.x = -Math.abs(this.vel.x);
    if(this.pos.y-this.r < 0) this.vel.y = Math.abs(this.vel.y);
    if(this.pos.y+this.r > height) this.vel.y = -Math.abs(this.vel.y);
  }
}

let wrld = new World();
for(let i = 0; i < 50; i++){
  let obj = new Object(Math.random()*width, Math.random()*height, 15)
  let angl = Math.random();
  obj.vel.x = Math.cos(angl*2*Math.PI);
  obj.vel.y = Math.sin(angl*2*Math.PI);
  wrld.objects.push(obj)
}

function render(){

  context.clearRect(0, 0, width, height);
  context.beginPath();
  context.fillStyle = "#330055";
  context.rect(0, 0, width, height);
  context.fill();

  wrld.update();
  wrld.render(context);


  window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);



