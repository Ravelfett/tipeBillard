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
  constructor(pool){
    this.objects = [];
    this.pool = pool;
    this.offset = new Vector(width, height).mult(1/2).add(this.pool.size.clone().mult(-1/2));
    this.quadtree = new Quadtree(new Vector(0, 0), pool.size.clone(), 0);
  }
  render(ctx){
    //this.quadtree.render(ctx);
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.fillStyle = "grey";
    ctx.fillRect(0, 0, this.pool.size.x, this.pool.size.y);
    for(let i in this.objects){
      this.objects[i].render(ctx);
      if(this.objects[i].id == holyid && false){
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 1;
        let r = this.objects[i].r + 10;
        let p = this.objects[i].pos.add(new Vector(-r, -r));
        let p2 = this.objects[i].pos.add(new Vector(r, r));
        ctx.strokeRect(p.x, p.y, p2.x - p.x, p2.y - p.y);
      }
    }
    ctx.restore();
  }
  update(){
    for(let i in this.objects){
      this.objects[i].update();
    }

    for(let i in this.objects){
      //let v = this.objects[i].pos.add(new Vector(-width/2, -height/2));
      //this.objects[i].acc = this.objects[i].acc.add(v).mult(-0.001);
      let r = this.objects[i].r + 10;
      let min = this.objects[i].pos.add(new Vector(-r, -r)); 
      let max = this.objects[i].pos.add(new Vector(r, r));
      let objs = wrld.quadtree.getObjsIn(
        min,
        max
      )
      for(let obj of objs){
        if(this.objects[i].id != obj.id){
          let x1 = this.objects[i].pos.x, x2 = obj.pos.x;
          let y1 = this.objects[i].pos.y, y2 = obj.pos.y;
          let dist = Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
          let r1 = this.objects[i].r, r2 = obj.r;
          if(dist < r1 + r2){

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
      /*for(let j in this.objects){
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
      }*/
    }
  }
}

class Pool{
  constructor(size){
    this.size = size;
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
  constructor(world, x, y, r){
    this.world = world;
    this.id = Math.random();
    this.pos = new Vector(x, y);
    this.vel = new Vector(0, 0);
    this.acc = new Vector(0, 0);
    this.c = "white";
    this.r = r;
    this.s = 0;
    this.m = 1;
  }
  render(ctx){
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2*Math.PI);
    ctx.fillStyle = (this.s==1 )?"blue": this.c;
    ctx.fill();
    ctx.closePath();
  }
  update(){
    this.s = 0;
    let f = new Vector(0, 0)
    this.vel = this.vel.mult(0.98);
    //this.acc = this.acc.add(f);
    this.vel = this.vel.add(this.acc);
    this.pos = this.pos.add(this.vel);
    this.acc = new Vector(0, 0);
    if(this.pos.x-this.r < 0) this.vel.x = Math.abs(this.vel.x);
    if(this.pos.x+this.r > this.world.pool.size.x) this.vel.x = -Math.abs(this.vel.x);
    if(this.pos.y-this.r < 0) this.vel.y = Math.abs(this.vel.y);
    if(this.pos.y+this.r > this.world.pool.size.y) this.vel.y = -Math.abs(this.vel.y);
  }
}
