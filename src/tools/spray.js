import { pointsAlongLine, rand, distance } from "../utils.js"

class Spray {
  constructor(ctx, ctx2) {
    this.name = 'spray';
    this.ctx = ctx;
    this.ctx2 = ctx2;
    this.isDrawing = false;
  }
  select() {

  }
  drawStart({ x, y, lastX, lastY }) {
  }
  drawMove({ x, y, lastX, lastY }) {
    let { ctx } = this
    let points = pointsAlongLine(x, y, lastX, lastY, .5);

    points.forEach((point, i) => {
      ctx.beginPath();
      let spread = 10
      for (let i = 0; i < 1; i++) {
        let x = rand() * spread;
        let y = rand() * spread;
        if (distance(x, y, 0, 0) > spread) continue;
        ctx.fillRect(
          Math.round(point.x + x),
          Math.round(point.y + y),
          1, 1
        );
      }
    });
  }
  drawEnd() {
  }
  tick() {

  }

}

export default Spray