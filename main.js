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


class Quadtree {
  constructor(pos, size, d){
    this.pos = pos.clone();
    this.size = size.clone();
    this.objs = [];
    this.grid = [];
    this.opened = false;
    this.d = d;
  }
  add(obj) {
    if (this.opened == true){
      let s = this.size.mult(0.5);
      if(obj.pos.x - this.pos.x < s.x){
        if(obj.pos.y - this.pos.y < s.y) this.grid[0].add(obj)
        else this.grid[2].add(obj)
      }else{
        if(obj.pos.y - this.pos.y < s.y) this.grid[1].add(obj)
        else this.grid[3].add(obj)
      } 
    } else {
      this.objs.push(obj);
      if (this.objs.length == 2 && this.d < 8){
        this.opened = true;
        let s = this.size.mult(0.5);
        this.grid = [
          new Quadtree(this.pos, s, this.d+1),
          new Quadtree(this.pos.add(new Vector(s.x, 0)), s, this.d+1),
          new Quadtree(this.pos.add(new Vector(0, s.y)), s, this.d+1),
          new Quadtree(this.pos.add(new Vector(s.x, s.y)), s, this.d+1),
        ]
        for(let o of this.objs){
          this.add(o);
        }
        this.objs = [];
      }
    }
  }
  getObjsIn(min, max){
    if(!(min.x > this.pos.x + this.size.x ||
      max.x < this.pos.x ||
      min.y > this.pos.y + this.size.y ||
      max.y < this.pos.y)){
      if (this.opened){
        return Array.prototype.concat(...(this.grid.map((x) => x.getObjsIn(min, max))));
      }else{
        return this.objs;
      }
    }else {
      return [];
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
    this.quadtree = new Quadtree(new Vector(0, 0), new Vector(width, height), 0);
  }
  render(ctx){
    //this.quadtree.render(ctx);
    for(let i in this.objects){
      this.objects[i].render(ctx);
    }
  }
  update(){
    for(let i in this.objects){
      this.objects[i].update();
    }

    for(let i in this.objects){
      let v = this.objects[i].pos.add(new Vector(-width/2, -height/2));
      //this.objects[i].acc = this.objects[i].acc.add(v).mult(-0.001);
      for(let j in this.objects){
        if(i != j){
          let x1 = this.objects[i].pos.x, x2 = this.objects[j].pos.x;
          let y1 = this.objects[i].pos.y, y2 = this.objects[j].pos.y;
          let dist = Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
          let r1 = this.objects[i].r, r2 = this.objects[j].r;
          if(dist < r1 + r2){
            let o1 = this.objects[i];
            let o2 = this.objects[j];

            let m21 = o2.m/o1.m;
            let x21 = o2.pos.x - o1.pos.x;
            let y21 = o2.pos.y - o1.pos.y;
            let vx21 = o2.vel.x - o1.vel.x;
            let vy21 = o2.vel.y - o1.vel.y;

            let vx_cm = (o1.m*o1.vel.x + o2.m*o2.vel.x)/(o1.m+o2.m);
            let vy_cm = (o1.m*o1.vel.y + o2.m*o2.vel.y)/(o1.m+o2.m);

            if ( (vx21*x21 + vy21*y21) >= 0) break;

            let a=y21/x21;
            let dvx2= -2*(vx21 +a*vy21)/((1+a*a)*(1+m21)) ;
            o2.vel.x += dvx2;
            o2.vel.y += a*dvx2;
            o1.vel.x -= m21*dvx2;
            o1.vel.y -= a*m21*dvx2;
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


class Obj{
  constructor(x, y, r){
    this.pos = new Vector(x, y);
    this.vel = new Vector(0, 0);
    this.acc = new Vector(0, 0);
    this.r = r;
    this.s = 0;
    this.m = 1;
  }
  render(ctx){
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2*Math.PI);
    ctx.fillStyle = (this.s==0 )?"white":"red";
    ctx.fill();
    ctx.closePath();
  }
  update(){
    let f = new Vector(0, 0)
    this.vel = this.vel.mult(0.98);
    //this.acc = this.acc.add(f);
    this.vel = this.vel.add(this.acc);
    this.pos = this.pos.add(this.vel);
    this.acc = new Vector(0, 0);
    if(this.pos.x-this.r < 0) this.vel.x = Math.abs(this.vel.x);
    if(this.pos.x+this.r > width) this.vel.x = -Math.abs(this.vel.x);
    if(this.pos.y-this.r < 0) this.vel.y = Math.abs(this.vel.y);
    if(this.pos.y+this.r > height) this.vel.y = -Math.abs(this.vel.y);
  }
}

const wrld = new World();
const nobjs = 18;
const size = 10;
let obj = new Obj(width*1/3, height/2, 5*size)
obj.s = 1;
obj.m = 5*5;
wrld.objects.push(obj);
for(let i = 0; i < nobjs ; i++){
  for(let j = 0; j <= i; j++){ 
  
    let obj = new Obj(width*2/3+i*size*2, height/2+(i/2-(i-j))*size*2*Math.sqrt(2), size)
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
  wrld.quadtree = new Quadtree(new Vector(0, 0), new Vector(width, height), 0);
  for(let obj of wrld.objects){
    wrld.quadtree.add(obj);
  }
    context.beginPath();
    context.fillStyle = "#326";
    context.rect(mouse[0], mouse[1], 20, 20);
    context.fill();
    context.closePath();
  for(let obj of wrld.quadtree.getObjsIn(new Vector(mouse[0], mouse[1]), new Vector(mouse[0]+20, mouse[1]+20))){
    
    console.log(obj)
  }


  wrld.render(context);


  window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);
