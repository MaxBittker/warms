import { playSingleGrain } from "../granular.js";
import { pixelArtLine, pixelArtLineWrapping } from "../utils.js"


class Pen {
  constructor(ctx, ctx2) {
    this.name = 'pen';
    this.ctx = ctx;
    this.ctx2 = ctx2;
    this.history = [{}]


    document.addEventListener("keydown", (event) => {
      if (event.key === "s") {
        let last = this.history[this.history?.length - 1]
        if (!last) return;
        last.active = true

        this.history.push({
          start: last.start,
          color: this.ctx.fillStyle,
          samples: last.samples.slice(0),
          active: false,
          size: window.size,
          cycles: 0
        })
      }

    })
  }
  select() {

  }
  drawStart({ x, y, lastX, lastY }) {
    this.history.push({
      start: Date.now(),
      color: this.ctx.fillStyle,
      samples: [[x, y, 0]],
      active: false,
      size: window.size,
      cycles: 0,
    })

  }
  drawMove({ x, y, lastX, lastY }) {
    pixelArtLineWrapping(this.ctx, x, y, lastX, lastY, window.size);

    let last = this.history[this.history.length - 1]
    if (!last) return;
    let diff = Date.now() - last.start
    last.samples.push(
      [x, y, diff]
    )
  }
  drawEnd() {
    let { ctx } = this
    let last = this.history[this.history.length - 1]
    if (!last) return;
    last.active = true
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  }
  tick({ }) {

    let { ctx2, history } = this;
    ctx2.clearRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);

    history.forEach(({ start, color, samples, active, size, cycles }, iW) => {
      ctx2.fillStyle = color;
      if (!active) return
      if (!samples?.length || samples?.length < 2) return
      let elapsed = (Date.now() - start)  ;
      let [sx, sy] = samples[0];
      let [ex, ey, period] = samples[samples.length - 1];
      let [dx, dy] = [ex - sx, ey - sy];

      // let loops = Math.floor((elapsed) / period)
      // if (loops > cycles) {
      //   playSingleGrain(
      //     {
      //       url: 'assets/audio/kalimba.wav',
      //       grainSize: .1, startPos: iW + Math.random() * .5, gain: 0.2
      //     }
      //   )
      //   history[iW].cycles = loops;
      // }

      samples.forEach(([x, y, t], i) => {
        let next = samples[i + 1];
        if (!next) return;
        let [nX, nY, nT] = next;

        let loops = Math.floor((elapsed - t) / period)

        let oX = dx * loops;
        let oY = dy * loops;

        pixelArtLineWrapping(ctx2, x + oX, y + oY, nX + oX, nY + oY, size);


      });
      // let angleFromStart = Math.atan2(startX - lastX, startY - lastY);
    })
  }
}

export default Pen