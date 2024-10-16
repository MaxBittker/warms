import { pixelArtLine, distance } from "../utils.js";

const TAU = Math.PI * 2;
class Line {
  constructor(ctx, ctx2) {
    this.name = "line";
    this.ctx = ctx;
    this.ctx2 = ctx2;
    this.isDrawing = false;
    this.startTime = Date.now();
    this.d = null;
  }
  select() {
  }
  drawStart({ x, y, lastX, lastY }) {
    this.startTime = Date.now();
    this.d = 0.0;
  }
  drawMove({ x, y, lastX, lastY, startX, startY }) {
    this.d = distance(x, y, startX, startY);
  }
  drawEnd({ x, y, startX, startY }) {
    let { ctx, startTime, d } = this;
    if (!this.startTime) return;
    let elapsed = Date.now() - startTime;
    let angleFromStart = Math.atan2(startX - x, startY - y);

    this.drawSpiral({ ctx, startX, startY, elapsed, angleFromStart, lastX: x, lastY: y });
    this.startTime = null;
  }
  drawSpiral({ ctx, startX, startY, elapsed, angleFromStart, lastX, lastY }) {
    let { d } = this;
    let l = elapsed / 1000;
    let prevX = lastX;
    let prevY = lastY;
    // let travelled = 0;
    for (var i = 0; i < 10000; i++) {
      let a = (i * 0.05);
      // let r = a * (.1 + d/20);
      let r = d - a * 1.5
      a += (angleFromStart + Math.PI);
      let x = startX + Math.sin(a) * r;
      let y = startY + Math.cos(a) * r;
      let dt = distance(x, y, prevX, prevY);
      // travelled += dt;

      pixelArtLine(ctx, prevX, prevY, x, y);
      prevX = x;
      prevY = y;
      // let wrappedA = a % TAU;
      // let wrappedAStart= (angleFromStart +Math.PI) % TAU;
      // let dA = Math.abs(wrappedA - wrappedAStart);
      // let dHand =distance(x,y,lastX,lastY);
      if (r <= 0) {
        break;
      }
    }
  }
  tick({ startX, startY, lastX, lastY }) {

    let { ctx2, startTime, d } = this;
    if (!this.startTime) return;
    if (!startX) return
    let elapsed = Date.now() - startTime;
    ctx2.clearRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);
    // let middleX = Math.round((startX + lastX) / 2);
    // let middleY = Math.round((startY + lastY) / 2);
    // let angleFromStart = Math.atan2(middleX - lastX, middleY - lastY);
    // this.drawSpiral({ ctx: ctx2, startX: middleX, startY: middleY, elapsed, angleFromStart, lastX, lastY });
    let angleFromStart = Math.atan2(startX - lastX, startY - lastY);
    this.drawSpiral({ ctx: ctx2, startX, startY, elapsed, angleFromStart, lastX, lastY });
  }
}

export default Line;
