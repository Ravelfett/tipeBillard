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


class Quadtree {
  constructor(pos, size){
    this.pos = pos.clone();
    this.size = size.clone();
    this.objs = [];
    this.grid = [];
    this.opened = false;
  }
  add(obj) {
    if (this.objs.length <= 1){
      this.objs.push(obj);
      let s = this.size.mult(0.5);
      this.grid = [
        new Quadtree(this.pos, s),
        new Quadtree(this.pos.add(new Vector(s.x, 0)), s),
        new Quadtree(this.pos.add(new Vector(0, s.y)), s),
        new Quadtree(this.pos.add(new Vector(s.x, s.y)), s),
      ]
    } else {
      this.opened = true;
      let s = this.size.mult(0.5);
      if(obj.pos.x - this.pos.x < s.x){
        if(obj.pos.y - this.pos.y < s.y) this.grid[0].add(obj)
        else this.grid[2].add(obj)
      }else{
        if(obj.pos.y - this.pos.y < s.y) this.grid[1].add(obj)
        else this.grid[3].add(obj)
      }
    }
  }
  getObjsIn(min, max){
    if(!(min.x > this.pos.x + this.size.x ||
      max.x < this.pos.x ||
      min.y > this.pos.y + this.size.y ||
      max.y < this.pos.y)){
      
    }
  }
  render(ctx){
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    for(let i in this.grid){
      this.grid[i].render(ctx);
    }
  }
}

class World{
  constructor(){
    this.objects = [];
    this.quadtree = new Quadtree(new Vector(0, 0), new Vector(width, height));
  }
  render(ctx){
    for(let i in this.objects){
      this.objects[i].render(ctx);
    }
    this.quadtree.render(ctx);
  }
  update(){
    for(let i in this.objects){
      this.objects[i].update();
    }
    /*for(let obj of this.objects){
      let objs = this.quadtree.getObjsIn(obj.pos.add(-1, -1), obj.pos.add(1, 1));
      
    }*/

    /*for(let i in this.objects){
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
    }*/
  }
}

class Vector{
  constructor(x, y){
    this.x = x;
    this.y = y;
  }
  clone(){
    return new Vector(this.x, this.y);
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
for(let i = 0; i < 500; i++){
  //let obj = new Object(Math.random()*width, Math.random()*height, 5)
  let obj = new Object(60, 60, 2);
  let angl = Math.random();
  obj.vel.x = Math.cos(angl*2*Math.PI);
  obj.vel.y = Math.sin(angl*2*Math.PI);
  wrld.objects.push(obj)
  wrld.quadtree.add(obj);
}

function render(){

  context.clearRect(0, 0, width, height);
  context.beginPath();
  context.fillStyle = "#330055";
  context.rect(0, 0, width, height);
  context.fill();

  wrld.update();
  wrld.quadtree = new Quadtree(new Vector(0, 0), new Vector(width, height));
  for(let obj of wrld.objects){
    wrld.quadtree.add(obj);
  }


  wrld.render(context);


  window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);
