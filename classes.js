class Quadtree {
  constructor(pos, size, d){
    this.pos = pos.clone();
    this.size = size.clone();
    this.objs = [];
    this.grid = [];
    this.opened = false;
    this.d = d;
  }
  reset(){
    this.objs = [];
    this.grid = [];
    this.opened = false;
    this.d = 0;
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
          new Quadtree(this.pos.add(new Vector(s.x, 0, 0)), s, this.d+1),
          new Quadtree(this.pos.add(new Vector(0, s.y, 0)), s, this.d+1),
          new Quadtree(this.pos.add(new Vector(s.x, s.y, 0)), s, this.d+1),
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
  constructor(size, startingPos = true, pool){
    this.objects = [];
    this.main = null;
    this.mode = 0;
    this.zoom = 20;
    //const pool = new Pool(new Vector(50, 50/2, 0), this.zoom);
    this.pool = pool;
    this.size = size;
    this.offset = new Vector(width, height, 0).mult(1/2).add(this.pool.size.clone().mult(-1/2));
    this.quadtree = new Quadtree(new Vector(-pool.size.x/2, -pool.size.y/2, 0), pool.size.clone(), 0);

    const nobjs = 5;

      let obj = new Obj(this, -pool.size.x/4, 0, size)
      obj.c = "white";
      this.main = obj;
      this.objects.push(obj);

    if(startingPos){
      for(let i = 0; i < nobjs ; i++){
        for(let j = 0; j <= i; j++){ 
          let obj = new Obj(this, pool.size.x*1/6+i*size*1.75,(i/2-(i-j))*size*2, size)
          this.objects.push(obj)
          //this.quadtree.add(obj);
        }
      }
    }
    for(let i = 0; i < 3; i++){
      for(let j = 0; j < 2; j++){
        this.objects.push(new Hole(this, (i-1)*this.pool.size.x/2, (j-1/2)*this.pool.size.y , size*1.9))
      }
    }
	  this.lastHits = [];
  }
  render(ctx, pool, full){
    ctx.save();
    ctx.translate(width/2, height/2);
    ctx.scale(this.zoom, this.zoom);
    ctx.fillStyle = "rgba(92, 255, 51)";
    if(pool){
      this.pool.render(ctx);
    }
    //this.quadtree.render(ctx);
    if(!full){
      ctx.globalAlpha = 0.5;
    }
    for(let i in this.objects){
      this.objects[i].render(ctx);
      this.pool.trace(this.objects[i]);
    }
    ctx.restore();
  }
  update(dt){
    for(let i in this.objects){
      this.objects[i].update(dt);
    }

    for(let i in this.objects){
      let r = this.objects[i].r + 10;
      let min = this.objects[i].pos.add(new Vector(-r, -r, 0)); 
      let max = this.objects[i].pos.add(new Vector(r, r, 0));
      let objs = this.quadtree.getObjsIn(
        min,
        max
      )
      if(this.mode == 0){
        for(let obj of objs){
          if(this.objects[i].id != obj.id && obj.s != 1 && this.objects[i].s != 1){
            let x1 = this.objects[i].pos.x, x2 = obj.pos.x;
            let y1 = this.objects[i].pos.y, y2 = obj.pos.y;
            let dist = Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
            let r1 = this.objects[i].r, r2 = obj.r;
            if(dist < r1 + r2){
              if(obj.type == 1) {
                this.objects[i].s = 1;
                continue
              }
              if(this.objects[i].type == 1) {
                obj.s = 1;
                continue
              }
              let o1 = this.objects[i];
              let o2 = obj;

              let m21 = o2.m/o1.m;
              let x21 = o2.pos.x - o1.pos.x;
              let y21 = o2.pos.y - o1.pos.y;
              let vx21 = o2.vel.x - o1.vel.x;
              let vy21 = o2.vel.y - o1.vel.y;

              let vx_cm = (o1.m*o1.vel.x + o2.m*o2.vel.x)/(o1.m+o2.m);
              let vy_cm = (o1.m*o1.vel.y + o2.m*o2.vel.y)/(o1.m+o2.m);

              if ( (vx21*x21 + vy21*y21) >= 0) continue;

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
      else {
        for(let j in this.objects){
          if(i != j){
            let x1 = this.objects[i].pos.x, x2 = this.objects[j].pos.x;
            let y1 = this.objects[i].pos.y, y2 = this.objects[j].pos.y;
            let dist = Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
            let r1 = this.objects[i].r, r2 = this.objects[j].r;
            if(dist < r1 + r2){
              // equations from https://www.plasmaphysics.org.uk/collision2d.htm
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
  clone(){
    let cp = new World(this.size, false, this.pool);
    cp.objects = [];
    for(let i in this.objects){
      cp.objects.push(this.objects[i].clone());
    }
    cp.main = cp.objects[0];
    cp.lastHits =  [...this.lastHits];
    return cp;
  }
}

class Pool{
  constructor(size, zoom){
    this.size = size;
    this.holes = [];
    this.objects = {};
    this.res = 1/2;
    this.zoom = zoom;
    this.canvas = new OffscreenCanvas(this.zoom*size.x*this.res, this.zoom*size.y*this.res);
    let ctx = this.canvas.getContext('2d');
    this.reset();
  }
  render(ctx){
    ctx.drawImage(this.canvas, -this.size.x/2, -this.size.y/2, this.size.x, this.size.y);
    //ctx.fillRect(-this.size.x/2, -this.size.y/2, this.size.x, this.size.y);
  }
  reset(){
    let ctx = this.canvas.getContext('2d');
    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, this.size.x*this.zoom*this.res, this.size.y*this.zoom*this.res);
  }
  trace(object){
    if(object.s == 1) return;
    if(object.id in this.objects){
      let ctx = this.canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo((this.objects[object.id].x+this.size.x/2)*this.res*this.zoom, (this.objects[object.id].y+this.size.y/2)*this.res*this.zoom);
      ctx.lineTo((object.pos.x+this.size.x/2)*this.zoom*this.res, (object.pos.y+this.size.y/2)*this.zoom*this.res);
      ctx.strokeStyle = object.c;
      ctx.lineWidth = 2*this.res;
      ctx.stroke();
      ctx.closePath();
    }
    this.objects[object.id] = object.pos.clone();

  }
}

class Vector{
  constructor(x, y, z){
    this.x = x;
    this.y = y;
    this.z = z;
  }
  toString(){
    return `(${this.x}, ${this.y}, ${this.z})`; 
  }
  clone(){
    return new Vector(this.x, this.y, this.z);
  }
  add(v){
    return new Vector(this.x+v.x, this.y+v.y, this.z+v.z);
  }
  mult(s){
    return new Vector(this.x*s, this.y*s, this.z*s);
  }
  cross(v){
    return new Vector(this.y*v.z - this.z*v.y, this.z*v.x - this.x*v.z, this.x*v.y - this.y*v.x);
  }
  norm(){
	  return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
  }
  normalize(){
    return this.mult(1/this.norm());
  }
}

function refresh() {
  //I = (2 / 5) * m * R * R
}

class Obj{
  constructor(world, x, y, r){
    this.world = world;
    this.id = Math.random();
    this.pos = new Vector(x, y, 0);
    this.vel = new Vector(0, 0, 0);
    this.acc = new Vector(0, 0, 0);

    this.rvel = new Vector(0, 1, 1);

    //set this.c to a random hsl color
    //this.c = "hsl(" + 360 * Math.random() + ', 100%, 50%)';
    this.c = "red"
    this.r = r;
    this.s = 0;
    this.m = 0.17;
    this.type = 0;
  }
  render(ctx){
    if(this.s == 0){
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2*Math.PI);
      ctx.fillStyle = (this.s==1 )?"blue": this.c;
      ctx.fill();
      ctx.closePath();
    }
  }
  update(dt){

    const mu = 2.5;
    const G = 9.81;
    /* 
    const Mz = ((mu * this.m * G * 2) / 3) * 0.024;
    const Mxy = (7 / (5 * Math.sqrt(2))) * this.r * mu * this.m * G

    // help from https://github.com/tailuge/billiards/blob/master/src/model/physics/physics.ts
    const z = this.rvel.z;
    this.rvel = (new Vector(0, 0, 1)).cross(this.vel).mult(1/this.r);
    this.rvel.z = z;
   

    const mag = new Vector(this.rvel.x, this.rvel.y, 0).norm();
    if(mag > 0.001){
      const k = ((5 / 7) * Mxy) / ((this.m * this.r) * mag);
      const kw = ((5 / 7) * Mxy) / ((this.m * this.r * this.r) * mag );
      //console.log(kw, Mxy, this.m, R, mag, (5/7)*Mxy, this.m*R*R, mag)
      this.vel = this.vel.add(new Vector(-k * this.rvel.y, k * this.rvel.x, 0).mult(1/60));
      this.rvel = this.rvel.add(new Vector(
        -kw * this.rvel.x,
        -kw * this.rvel.y,
        -(5 / 2) * (Mz / (this.m * this.r * this.r)) * Math.sign(this.rvel.z)
      ).mult(1/60))
    }*/


    //this.vel = this.vel.mult(0.99);
    if(this.vel.norm() < 0.01) {
      this.vel = new Vector(0,0,0)
    }else{
      if(5/7*mu*G*dt > this.vel.norm()){
        this.vel = new Vector(0,0,0);
      }else {
        this.vel = this.vel.add(this.vel.normalize().mult((-5/7)*mu*G).mult(dt));
      }
    }
    this.pos = this.pos.add(this.vel.mult(dt));

    const e = 0.2;
    if(this.pos.x-this.r < -this.world.pool.size.x/2){
      this.pos.x = -this.world.pool.size.x/2 + this.r;
      this.vel.x = Math.abs(this.vel.x) * e;
    }
    if(this.pos.x+this.r > this.world.pool.size.x/2){
      this.pos.x = this.world.pool.size.x/2 - this.r;
      this.vel.x = -Math.abs(this.vel.x) * e;
    }
    if(this.pos.y-this.r < -this.world.pool.size.y/2){
      this.pos.y = -this.world.pool.size.y/2 + this.r;
      this.vel.y = Math.abs(this.vel.y) * e;
    }
    if(this.pos.y+this.r > this.world.pool.size.y/2){
      this.pos.y = this.world.pool.size.y/2 - this.r;
      this.vel.y = -Math.abs(this.vel.y) * e;
    }
  }
  
  clone(){
    let cp = new this.constructor(this.world, this.pos.x, this.pos.y, this.r);
    cp.c = this.c;
    cp.s = this.s;
    cp.type = this.type;
    cp.vel = this.vel.clone();
    return cp;
  }
}
class Hole extends Obj{
  constructor(world, x, y, r){
    super(world, x, y, r);
    this.type = 1;
    this.c= "black";
  }
  update(){

  }
  render(ctx){
    super.render(ctx);
  }
}
