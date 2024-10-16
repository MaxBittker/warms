import { pixelArtLine, distance, pointsAlongLine, pixelArtLineClear } from "../utils.js"

class Dots {
  constructor(ctx, ctx2) {
    this.name = 'dots';
    this.ctx = ctx;
    this.ctx2 = ctx2;
    this.isDrawing = false;
  }
  select() {

  }
  drawStart(x, y) {

  }
  drawMove({ x, y, a, speed, lastX, lastY, lastA }) {
    let { ctx, ctx2 } = this;
    if (speed === 0) return;
    let r = 5;
    let dx = Math.sin(a + Math.PI / 2) * r;
    let dy = Math.cos(a + Math.PI / 2) * r;

    let dxL = Math.sin(lastA + Math.PI / 2) * r;
    let dyL = Math.cos(lastA + Math.PI / 2) * r;

    // rotate canvas by a:
    // ctx.save()
    // ctx.translate(x, y);
    // ctx.rotate(-a)
    // ctx.beginPath();
    // ctx.arc(0, 0, r - 0.8, 0, Math.PI, true)
    //    // ctx.fill()
    // ctx.clip()
    // ctx.clearRect(-r * 1.5, -r * 1.5, r * 3, r * 3)
    // ctx.restore()
    for (let cx = -r; cx <= r; cx++) {
      for (let cy = -r; cy <= r; cy++) {
        let ccx = Math.floor(x + cx);
        let ccy = Math.floor(y + cy);

        if (distance(ccx, ccy, x, y) < (r - 1)) {
          ctx.clearRect(ccx, ccy, 1, 1);

          // ctx.fillRect(Math.floor(ccx), Math.floor(ccy), 1, 1);

          // ctx.clearRect(Math.floor(ccx), Math.floor(ccy), 1, 1);
        }
      }
    }

    let pl = pointsAlongLine(x + dx, y + dy, lastX + dxL, lastY + dyL, .25);
    let pl2 = pointsAlongLine(x - dx, y - dy, lastX - dxL, lastY - dyL, .25);
    // console.log(pl.length, pl2.length)
    pl.forEach(({ x, y }, i) => {
      let p2 = pl2[i];
      if (!p2) return
      pixelArtLineClear(ctx, x, y, p2.x, p2.y);
    });

    // let s = ctx.fillStyle;
    // ctx.fillStyle = '#000';
    // pixelArtLine(ctx, x - dx, y - dy, x + dx, y + dy);
    // ctx.fillStyle = s;
    // ctx.drawImage(ctx2.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
    pixelArtLine(ctx, x + dx, y + dy, lastX + dxL, lastY + dyL);
    pixelArtLine(ctx, x - dx, y - dy, lastX - dxL, lastY - dyL);

    // pixelArtLine(ctx2, x + dx, y + dy, lastX + dxL, lastY + dyL);
    // pixelArtLine(ctx2, x - dx, y - dy, lastX - dxL, lastY - dyL);

    // pixelArtLine(ctx, x , y , lastX , lastY );

  }
  drawEnd() {

  }
  tick() {

  }

}

export default Dots