
import hershey from './textUtils/hershey.js';
import FONT_HERSHEY from "./textUtils/hershey-data.js";
let {
  putText,
} = hershey;
import { playSingleGrain } from "../granular.js"
import { distance, pixelArtLine } from "../utils.js"

let cmapnames = []
let cmaps = [];
let goodCmaps = [0, 17, 1, 14, 16, 18,
  2]

for (var k in FONT_HERSHEY) {
  if (k != "DATA") {
    cmapnames.push(k);
  }
}

for (var i = 0; i < cmapnames.length; i++) {
  cmaps.push(FONT_HERSHEY[cmapnames[i]]);
}

function iOS() {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
    // iPad on iOS 13 detection
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

// putChar,
// estimateTextWidth

class Text {
  constructor(ctx, ctx2) {
    this.name = 'text';
    this.ctx = ctx;
    this.ctx2 = ctx2;
    this.isDrawing = false;
    this.fontI = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.textCursor = null
    this.input = document.getElementById("input")
    // this.input.addEventListener("input", (e) => {
    // })
    this.soundI = 0;
    this.typing = false
    let positions = [1.25, 3.11, 5.06, 6.8, 8.38]
    this.input.addEventListener("keydown", ((event) => {
      this.typing = true;
      if (event.keyCode == 13) {
        playSingleGrain({
          url: 'assets/audio/carriage-return.wav',
          grainSize: 3, startPos: 0, gain: .4
        })
        if (iOS()) {
          this.input.value += "\n";
        }
      } else {
        playSingleGrain({
          url: 'assets/audio/keyclicks.wav',
          grainSize: .6, startPos: positions[this.soundI % positions.length]
        })
      }
      this.soundI += 1
      // this.soundI+= Math.round(Math.random()*2)

      if (event.keyCode == "38") {
        this.fontI = (this.fontI + 1) % goodCmaps.length;
      }
      if (event.keyCode == "40") {
        this.fontI = (this.fontI + goodCmaps.length - 1) % goodCmaps.length;
      }

      this.input.setSelectionRange(this.input.value.length, this.input.value.length);

    }).bind(this));


  }

  drawText(ctx, x, y, isFake = false) {

    ctx.save();
    ctx.translate(Math.round(x), Math.round(y) - 15)
    // console.log(this.fontI)
    // console.log(goodCmaps[this.fontI])
    // console.log( cmaps[goodCmaps[this.fontI]])
    let offset = putText(ctx, isFake ? "A" : input.value, {
      cmap: cmaps[goodCmaps[this.fontI]],
      lhRatio: this.fontI == 1 ? .8 : 1,
      size: 24

    })
    ctx.restore()

    return offset
  }

  deselect() {
    let { ctx, textCursor, input } = this;
    if (textCursor) {
      this.drawText(ctx, textCursor[0], textCursor[1])
      this.textCursor = null;
      input.value = ""
      window.pushState()
    }
  }
  select() {
    let { ctx, textCursor, input } = this;
    if (textCursor) {
      this.drawText(ctx, textCursor[0], textCursor[1])
      window.pushState()
      this.textCursor = null;
      input.value = ""
    }

  }
  drawStart({ x, y }) {
    let { ctx, textCursor, input } = this;

    if (textCursor) {
      this.drawText(ctx, textCursor[0], textCursor[1])
    }

    input.focus()
    window.setTimeout(() => input.focus(), 0);
    this.textCursor = [x, y];
    input.value = ""

  }
  drawMove() {

  }
  drawEnd() {

  }
  tick({ lastX, lastY }) {
    let { ctx, ctx2, textCursor, input, fontI } = this;
    let lhRatio = fontI == 1 ? .8 : 1;
    ctx2.clearRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);

    let hMin = Infinity
    let hMax = -Infinity;
    let fakeCtx = {
      save: () => { },
      restore: () => { },
      translate: () => { },
      beginPath: () => { },
      rect: (_x, y) => {
        hMin = Math.min(hMin, y);
        hMax = Math.max(hMax, y);
      },
      fill: () => { },

    }
    this.drawText(fakeCtx, lastX, lastY, true)
    hMin *= lhRatio;
    hMax *= lhRatio;
    let hTotal = hMax - hMin;
    // console.log(`${hMin} ${hMax} ${hTotal}`)

    if (textCursor) {
      let [w, h] = this.drawText(ctx2, textCursor[0], textCursor[1])
      ctx2.save();
      ctx2.translate(Math.round(textCursor[0]), Math.round(textCursor[1] + hMin * 1.6))
      ctx2.translate(Math.round(w) + .5, Math.round(h));
      let p = 800;
      if (Math.round(Date.now()) % p < p / 2) {
        ctx2.beginPath()
        ctx2.moveTo(0, 0);
        ctx2.lineTo(0, hTotal * 1.3);
        ctx2.strokeWidth = 1;
        ctx2.stroke()
      }
      ctx2.restore()
    }

    if (distance(lastX, lastY, this.lastX, this.lastY) > 3) {
      this.typing = false
    }
    this.lastX = lastX
    this.lastY = lastY
    if (!lastX || !lastY) return
    if (this.typing) return
    // let [w, h] = this.drawText(ctx2, lastX, lastY)
    ctx2.save();

    if (Math.abs(hTotal) > 1000) return;
    ctx2.translate(Math.round(lastX), Math.round(lastY + hMin * 1.6))
    // ctx2.translate(Math.round(w), Math.round(h));
    // let p = 800;
    // if (Math.round(Date.now()) % p < p / 2) {
    pixelArtLine(ctx2, 0, 0, 0, hTotal * 1.3, 3);

    ctx2.restore()

  }
}

export default Text