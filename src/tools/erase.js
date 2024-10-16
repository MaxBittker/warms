import { pointsAlongLine, pixelArtLine } from "../utils.js"

let eW = 17
let eH = 23

class Erase {
  constructor(ctx, ctx2) {
    this.name = 'erase';
    this.ctx = ctx;
    this.ctx2 = ctx2;
  }
  select() {

  }
  drawStart({ x, y, lastX, lastY }) {
  }
  deselect() {
    let { ctx, ctx2 } = this;

    ctx2.clearRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);
  }
  drawMove({ x, y, lastX, lastY }) {
    let points = pointsAlongLine(x, y, lastX, lastY, .5);

    points.forEach((point, i) => {

      // ctx.beginPath();
      // ctx.arc(
      //   Math.round(point.x),
      //   Math.round(point.y),
      //   6,
      //   0, Math.PI * 2
      // );
      // ctx.fill()
      this.ctx.clearRect(
        Math.round(point.x) - eW / 2,
        Math.round(point.y) - eH / 2,
        eW,
        eH)
    });
  }
  drawEnd() {
  }
  tick({ lastX, lastY }) {
    let { ctx, ctx2 } = this;
    ctx2.clearRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);
    if (lastX === null) return;

    // ctx2.beginPath()
    // ctx2.setLineDash([4, 4]);
    let dashLength = 2
    let x1 = Math.round(lastX) - eW / 2;
    let y1 = Math.round(lastY) - eH / 2;
    let x2 = Math.round(lastX) + eW / 2;
    let y2 = Math.round(lastY) + eH / 2
    let offset = pixelArtLine(ctx2, x1, y1, x2, y1, dashLength);
    offset = pixelArtLine(ctx2, x2, y1, x2, y2, dashLength, offset + 1);

    offset = pixelArtLine(ctx2, x1, y1, x1, y2, dashLength);
    pixelArtLine(ctx2, x1, y2, x2, y2, dashLength, offset + 1);

  }

}

export default Erase