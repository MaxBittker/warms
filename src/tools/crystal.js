import { pointsAlongLine, rand, distance, randInt, randomOffset } from "../utils.js"

function getPixel(pixelData, x, y) {
  if (x < 0 || y < 0 || x >= pixelData.width || y >= pixelData.height) {
    return -1;  // impossible color
  } else {
    return pixelData.data[y * pixelData.width + x];
  }
}

function setPixel(pixelData, x, y,v) {
  if (x < 0 || y < 0 || x >= pixelData.width || y >= pixelData.height) {
    return -1;  // impossible color
  } else {
    return pixelData.data[y * pixelData.width + x] = v;
  }
}
function hexToRGB(h) {
  let r = 0, g = 0, b = 0;

  r = h[1] + h[2];
  g = h[3] + h[4];
  b = h[5] + h[6];
  let hex = "0xff" + b + g + r
  return parseInt(hex, 16);
}

class Crystal {
  constructor(ctx, ctx2) {
    this.name = 'crystal';
    this.ctx = ctx;
    this.ctx2 = ctx2;
    this.isDrawing = false;
    this.loc = null
  }
  select() {

  }
  drawStart({ x, y, lastX, lastY }) {
    this.loc = [x,y]
  }
  drawMove({ x, y, lastX, lastY }) {
    this.loc = [x,y]
    
  
  }
  drawEnd() {
    this.loc = null;
  }
  tick({activeColor}) {
    let {ctx, loc} = this;
    if(!loc) return
    let [x,y] = loc;
    let r = 10;
    let w = r * 2;
    let imageData = ctx.getImageData(x-r, y-r, w, w);

  // make a Uint32Array view on the pixels so we can manipulate pixels
  // one 32bit value at a time instead of as 4 bytes per pixel
  let pixelData = {
    width: imageData.width,
    height: imageData.height,
    data: new Uint32Array(imageData.data.buffer),
  };
    const intensity = 60;
    let targetColor = hexToRGB(activeColor);
    for(let i = 0; i < intensity; i++) {
      let sX = randInt(0,imageData.width-1);
      let sY = randInt(0,imageData.height-1);
      let sampleColor = getPixel(pixelData, sX,sY);
      
      if(sampleColor !== targetColor) { continue};
      let [oX,oY] = randomOffset();
      
     let s2X = sX + oX;
    let  s2Y = sY + oY;
      // let s2X = randInt(0,imageData.width-1);
      // let s2Y = randInt(0,imageData.height-1);
      setPixel(pixelData, s2X,s2Y, sampleColor);
    }
    ctx.putImageData(imageData, x-r, y-r);

  }

}

export default Crystal