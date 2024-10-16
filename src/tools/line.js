import { pixelArtLine } from "../utils.js"

class Spiral {
  constructor(ctx, ctx2) {
    this.name = 'spiral';
    this.ctx = ctx;
    this.ctx2 = ctx2;
    this.isDrawing = false;

  }
  select() {

  }
  drawStart({ x, y, lastX, lastY }) {

  }
  drawMove({ x, y, lastX, lastY, startX, startY }) {
    let { ctx2 } = this;
    ctx2.clearRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);
    pixelArtLine(ctx2, startX, startY, x, y);
  }
  drawEnd({ x, y, startX, startY }) {
    let { ctx } = this;
    if (startX) {
      pixelArtLine(ctx, startX, startY, x, y);

    }

  }
  tick() {

  }

}

export default Spiral