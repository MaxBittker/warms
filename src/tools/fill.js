import { pointsAlongLine, distance, d2 } from "../utils.js"

let isDrawing = false;
function getPixel(pixelData, x, y) {
  if (x < 0 || y < 0 || x >= pixelData.width || y >= pixelData.height) {
    return -1;  // impossible color
  } else {
    return pixelData.data[y * pixelData.width + x];
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

let pixelsToCheck = [];

let fillX = null;
let fillY = null;

function wait(delay = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}


class Fill {
  constructor(ctx, ctx2) {
    this.name = 'fill';
    this.ctx = ctx;
    this.ctx2 = ctx2;
    this.startTime = Date.now();
    
  }
  async  startFill(ctx, x, y, fillColor) {
  fillColor = hexToRGB(fillColor);
  x = Math.round(x)
  y = Math.round(y)
  fillX = x;
  fillY = y;
  // read the pixels in the canvas
  let imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

  // make a Uint32Array view on the pixels so we can manipulate pixels
  // one 32bit value at a time instead of as 4 bytes per pixel
  let pixelData = {
    width: imageData.width,
    height: imageData.height,
    data: new Uint32Array(imageData.data.buffer),
  };

  // get the color we're filling
  let targetColor = getPixel(pixelData, x, y);

  // check we are actually filling a different color
  if (targetColor === fillColor) {
    return
  }
  // if(targetColor === -1) {)
  pixelsToCheck.push([x, y, targetColor])

  if (pixelsToCheck.length > 1) {
    if (pixelsToCheck[0][2] !== targetColor) {
      pixelsToCheck.length = 0;
      pixelsToCheck.push([x, y, targetColor])
    }
    return
  }

  let tickCount = 0;
  while (pixelsToCheck.length > 0) {

    // let sampleArea = pixel
    pixelsToCheck.sort((a, b) => {
      let dA = d2(a[0], a[1], fillX, fillY);
      let dB = d2(b[0], b[1], fillX, fillY);
      return dA - dB
    });
    let rI = 0;
    const [x, y, targetColor] = pixelsToCheck.splice(rI, 1)[0];

    const currentColor = getPixel(pixelData, x, y);
    if (currentColor === targetColor) {
      pixelData.data[y * pixelData.width + x] = fillColor;

      // put the data back
      ++tickCount;
    let elapsed =( Date.now() - this.startTime)/1000;
      
      let dClosest = distance(x, y, fillX, fillY);
      const ticksPerUpdate = Math.floor(3+Math.min(elapsed*20, 100) + Math.min(dClosest, 300));
      // console.log(ticksPerUpdate)
      if (tickCount % ticksPerUpdate === 0) {
        ctx.putImageData(imageData, 0, 0);
        await wait(1);
      }

      if (!isDrawing) return;

      pixelsToCheck.push([x + 1, y, targetColor]);
      pixelsToCheck.push([x - 1, y, targetColor]);
      pixelsToCheck.push([x, y + 1, targetColor]);
      pixelsToCheck.push([x, y - 1, targetColor]);
    }
  }
  ctx.putImageData(imageData, 0, 0);

}

  select() {

  }
  drawStart({ x, y, lastX, lastY, activeColor }) {
    let { ctx } = this;
    isDrawing = true;
    this.startTime = Date.now();
    
    this.startFill(ctx, Math.round(x), Math.round(y), activeColor);


  }
  drawMove({ x, y, lastX, lastY, activeColor }) {
    let { ctx } = this;

    let points = pointsAlongLine(x, y, lastX, lastY, .5);


    points.forEach((point) => {
      this.startFill(ctx, Math.round(point.x), Math.round(point.y), activeColor);
    });

  }
  drawEnd() {
    isDrawing = false;

    pixelsToCheck.length = 0;
    this.startTime = null;

  }
  tick() {

  }

}

export default Fill