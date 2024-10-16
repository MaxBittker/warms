import { pointsAlongLine } from "../utils.js"

class Rect {
  constructor(ctx, ctx2) {
    this.name = 'rect';
    this.ctx = ctx;
    this.ctx2 = ctx2;
    this.isDrawing = false;
  }
  select() {

  }
  drawStart({ x, y }) {

  }
  drawMove({ x, y, startX, startY }) {
    let { ctx, ctx2 } = this;

    ctx2.clearRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);
    ctx2.beginPath()
    ctx2.rect(
      Math.round(startX) - .5,
      Math.round(startY) - .5,
      Math.round(x - startX),
      Math.round(y - startY));
    ctx2.stroke()
  }
  drawEnd({ x, y, startX, startY }) {
    let { ctx, ctx2, } = this;

    ctx.beginPath()

    ctx.rect(Math.round(startX) - 0.5,
      Math.round(startY) - .5,
      Math.round(x - startX),
      Math.round(y - startY));
    ctx.stroke()
    ctx.stroke()
    ctx.stroke()
    ctx.stroke()
    ctx.stroke()
    ctx.stroke()


  }
  tick() {

  }

}

export default Rect