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
    let x = mouse[0];
    let y = mouse[1];
    wrlds[0].main.vel.x = (wrlds[0].main.pos.x - x)*-6;
    wrlds[0].main.vel.y = (wrlds[0].main.pos.y - y)*-6;

    /*for(let i = 0; i < wrlds.length; i++){
      let x = Math.floor((Math.random()*wrlds[i].pool.size.x - wrlds[i].pool.size.x/2)*100)/100;
      let y = Math.floor((Math.random()*wrlds[i].pool.size.y - wrlds[i].pool.size.y/2)*100)/100;
      wrlds[i].main.vel.x = (wrlds[i].main.pos.x - x)/-10;
      wrlds[i].main.vel.y = (wrlds[i].main.pos.y - y)/10;
	  wrlds[i].lastHits.push([x, y]);
    }*/
    pressed = true;
  }
  if (e.button == 2) {
    /*
	let max = wrlds.reduce((acc, wrld, i) => {let c = wrld.objects.filter((obj) => obj.s==1).length;if(c > acc[1] && wrld.main.s == 0){return [i, c]}else{return acc}}, [0, 0])
    let parent = wrlds[max[0]];
    console.log(max)
	for(let i = 0; i < nb; i ++){
      if(i != max[0]) wrlds[i] = parent.clone();
	}*/
  }
};

document.onmouseup = function (e) {
  if (e.button == 0) {
    pressed = false;
  }
};

//add an event for when pressing the left and right keys
document.addEventListener('keydown', function(event) {
  if(event.keyCode == 37) {
    console.log("left")
    mode = (mode + wrlds.length) % (wrlds.length + 1);
  }
  if(event.keyCode == 39) {
    mode = (mode + 1) % (wrlds.length + 1);
  }
  if(event.keyCode == 32) {
    //rec = true;
  }
});



function dotProduct(x1, y1, x2, y2) {
  return x1 * x2 + y1 * y2;
}

function playRandomMove(){
  for(let i = 0; i < wrlds.length; i++){

    //shoot the main ball in a random direction with a random speed uniformely in a circle
    let angle = Math.random()*2*Math.PI;
    let speed = Math.random()*60+20;
    let x = Math.floor(Math.cos(angle)*speed*100)/100;
    let y = Math.floor(Math.sin(angle)*speed*100)/100;
    wrlds[i].main.vel.x = x;
    wrlds[i].main.vel.y = y;
    wrlds[i].lastHits.push([x, y]);

    /*let x = Math.floor((Math.random()*wrlds[i].pool.size.x - wrlds[i].pool.size.x/2)*100)/100;
    let y = Math.floor((Math.random()*wrlds[i].pool.size.y - wrlds[i].pool.size.y/2)*100)/100;
    wrlds[i].main.vel.x = (wrlds[i].main.pos.x - x)/-10;
    wrlds[i].main.vel.y = (wrlds[i].main.pos.y - y)/10;
    wrlds[i].lastHits.push([x, y]);*/
  }
}


function setupWorldCopies(){
	let max = wrlds.reduce((acc, wrld, i) => {let c = wrld.objects.filter((obj) => obj.s==1).length;if(c > acc[1] && wrld.main.s == 0){return [i, c]}else{return acc}}, [0, 0])
  let parent = wrlds[max[0]];
  //console.log(max)
	for(let i = 0; i < wrlds.length; i ++){
      if(i != max[0]) wrlds[i] = parent.clone();
	}
}

const wrlds = [];

const nb = 1;
let rec = 1;
const save = false;
let cshot = 0;
let dshot = shots.length;

if(true){
  const s = 1;
  const pool = new Pool(new Vector(50, 50/2, 0), 20);
  let wrld = new World(s, false, pool);
  wrld.main.pos.x = -23;
  wrld.main.vel.x = 43;
  wrlds.push(wrld);
  /*wrld.objects.push(new Obj(wrld, 10, 10, s));
  wrld.main.pos.x = -10;
  //wrld.main.vel.x = 40;
  wrlds.push(wrld);

  for(let i = 0; i < nb; i++){
    let newWorld = wrld.clone();
    //newWorld.main.vel.y = Math.random()*12 - 6;
    wrlds.push(newWorld);
  }*/
}else{
  for(let i = 0; i < nb; i++){
    let wrld = new World(1);
    wrlds.push(wrld);
  }
}

let mode = wrlds.length; 

let update= true;
const frames = [];


//let time = -200;
//const data = [];


function render(){  
  //time ++;
  if(rec == 0){
    let allStopped = wrlds.every((wrld) => wrld.objects.every((obj) => obj.vel.x == 0 && obj.vel.y == 0));
    let nbofnotdone = wrlds[0].objects.filter((obj)=>{return obj.type == 0 && obj.s == 0}).length;
    if(nbofnotdone==0){
      console.log(wrlds[0].lastHits);
      rec = 2;
      update = false;
    }
    if(allStopped){
      setupWorldCopies();
      playRandomMove();
    }
  }else if(rec == 1){
    let allStopped = wrlds.every((wrld) => wrld.objects.every((obj) => obj.vel.x == 0 && obj.vel.y == 0));
    if(allStopped && cshot < dshot){
      if(save){

        const dw = 200;
        const dh = 50;
        const w = width - 2*dw;
        const h = height - 2*dh;

        const imageData = context.getImageData(dw, dh, w, h);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext('2d');

        // Put the extracted image data onto the new canvas
        tempCtx.putImageData(imageData, 0, 0);

        // Convert the new canvas to a data URL
        const dataURL = tempCanvas.toDataURL('image/png');

        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = dataURL;
        downloadLink.download = 'canvas-region.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }

      let x = shots[0][cshot][0];
      let y = shots[0][cshot][1];
      /*for(let i = 1; i < wrlds.length; i++){
        let fe = (cshot == (dshot-1)) ? 4: 0;
        let xerror = Math.random()*fe - fe/2;
        let yerror = Math.random()*fe - fe/2;
        wrlds[i].main.vel.x = x + xerror;
        wrlds[i].main.vel.y = y + yerror;
      }*/
      wrlds[0].pool.reset();
      wrlds[0].main.vel.x = x;
      wrlds[0].main.vel.y = y;
      x = shots[1][cshot][0];
      y = shots[1][cshot][1];
      /*for(let i = 1; i < wrlds.length; i++){
        let fe = (cshot == (dshot-1)) ? 4: 0;
        let xerror = Math.random()*fe - fe/2;
        let yerror = Math.random()*fe - fe/2;
        wrlds[i].main.vel.x = x + xerror;
        wrlds[i].main.vel.y = y + yerror;
      }*/
      wrlds[1].main.vel.x = x;
      wrlds[1].main.vel.y = y;
      cshot++;
    }
  }

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
  context.font = "22px Arial";
  context.fillStyle = "white";
  context.fillText("FPS: " + frames.length, 10, 50);
  if(mode < wrlds.length){
    context.fillText("Objects: " + (+wrlds[mode].objects.length) + " | " + (+wrlds[mode].objects.filter((obj) => obj.s == 1).length), 10, 100);
  }else{
    context.fillText("Objects: " + wrlds.reduce((acc, wrld) => acc + wrld.objects.length, 0) + " | " + wrlds.reduce((acc, wrld) => acc + wrld.objects.filter((obj) => obj.s == 1).length, 0), 10, 100);
  }
  context.fillText("Zoom: " + wrlds[0].zoom, 10, 150);
  context.fillText("Mouse: " + mouse, 10, 200);
  context.fillText("Mode: " + mode, 10, 250);

  context.fillText("vel: " + wrlds[0].main.vel.toString(), 10, 300);
  context.fillText("rvel: " + wrlds[0].main.rvel.toString(), 10, 350);

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

  if(update){
    let t = 1;
    for(let k = 0; k < t; k++){
      for(let i = 0; i < wrlds.length; i++){
        wrlds[i].update(1/(60*t));
        wrlds[i].quadtree.reset();
        for(let obj of wrlds[i].objects){
          if(obj.s != 1){
            wrlds[i].quadtree.add(obj);
          }
        }
      }
    }
  }

  if(mode == wrlds.length){
    for(let i = 0; i < wrlds.length; i++){
      wrlds[i].render(context, i==0, false);
    }
  } else {
    wrlds[mode].render(context, true, true);
  }


  window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);
