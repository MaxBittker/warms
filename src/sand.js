

import { distance, pointsAlongLine, pixelArtLine, randInt, randomOffset } from "./utils.js"


import hershey from './tools/textUtils/hershey.js';


function getPixel(pixelData, x, y) {
  if (x < 0 || y < 0 || x >= pixelData.width || y >= pixelData.height) {
    return -1;  // impossible color
  } else {
    return pixelData.data[y * pixelData.width + x];
  }
}

function setPixel(pixelData, x, y, v) {
  if (x < 0 || y < 0 || x >= pixelData.width || y >= pixelData.height) {
    return -1;  // impossible color
  } else {
    return pixelData.data[y * pixelData.width + x] = v;
  }
}

export function updateSand(ctx) {
  // let [x,y] = loc;
  // let r = 10;
  // let w = r * 2;
  let imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

  // make a Uint32Array view on the pixels so we can manipulate pixels
  // one 32bit value at a time instead of as 4 bytes per pixel
  let pixelData = {
    width: imageData.width,
    height: imageData.height,
    data: new Uint32Array(imageData.data.buffer),
  };
  const intensity = 100;
  // let targetColor = hexToRGB(activeColor);
  for (let i = 0; i < intensity; i++) {
    let sX = randInt(0, imageData.width - 1);
    let sY = randInt(0, imageData.height - 1);

    let oX = Math.random() > .5 ? -1 : 1
    let [rX, rY] = randomOffset()

    let me = getPixel(pixelData, sX, sY);
    let down = getPixel(pixelData, sX, sY + 1);
    let lr = getPixel(pixelData, sX + oX, sY + 1);
    // let randn = getPixel(pixelData, sX + rX, sY + rY);

    let air = 4278190080;
    air = 0;
    let sand = 4291546108
    let snow = 4293059550;
    let blue = 4292260728;
    let red = 4285098456
    if (me !== air && me !== sand && me !== blue && me != snow && me != red) {
      // console.log(me)
      setPixel(pixelData, sX, sY, air);

    }
    // if (me === blue) {
    //   if (down === air) {
    //     setPixel(pixelData, sX, sY, down);
    //     setPixel(pixelData, sX, sY + 1, me);
    //   } else if (lr === air) {
    //     setPixel(pixelData, sX, sY, lr);
    //     setPixel(pixelData, sX + oX, sY + 1, me);

    //   }
    // }

    // if (me == sand && randn == air) {
    //   setPixel(pixelData, sX + rX, sY + rY, blue);
    // }
    // if (me == blue && randn == air) {
    //   setPixel(pixelData, sX + rX, sY + rY, snow);
    // }

    // if(sampleColor !== targetColor) { continue};
    // let [oX,oY] = randomOffset();

    // let s2X = sX + oX;
    // let  s2Y = sY + oY;
    // let s2X = randInt(0,imageData.width-1);
    // let s2Y = randInt(0,imageData.height-1);
    // setPixel(pixelData, s2X,s2Y, sampleColor);
  }
  ctx.putImageData(imageData, 0, 0);

}
4291546108
4278190080
