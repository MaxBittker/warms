import { pointsAlongLine, pixelArtLine } from "../utils.js"

function toBounds(x, y, x2, y2) {
  return {
    x: Math.min(x, x2),
    y: Math.min(y, y2),
    width: Math.abs(x - x2),
    height: Math.abs(y - y2)
  }
}
function pointInsideRect(uB, iX, iY) {
  let { x, y, startX, startY } = uB;
  let bounds = toBounds(x, y, startX, startY)

  return iX >= bounds.x && iX <= bounds.x + bounds.width && iY >= bounds.y && iY <= bounds.y + bounds.height;
}
class Select {
  constructor(ctx, ctx2) {
    this.name = 'select';
    this.ctx = ctx;
    this.ctx2 = ctx2;
    this.isDrawing = false;
    this.currentBounds = null
    this.buffer = null;
    this.isMoving = false;
    this.dragOffset = null;
    this.bounceCanvas = document.createElement('canvas');
    this.bounceCtx = this.bounceCanvas.getContext('2d');
    this.isCopy = false;

  }

  select(id) {
    this.isCopy = id == "copy"
    this.isMoving = false;
    // this.currentBounds = null
  }
  deselect() {
    let { ctx2 } = this;

    this.isMoving = false;
    this.currentBounds = null
    ctx2.clearRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);
  }
  drawStart({ x, y }) {
    let { currentBounds, ctx, isCopy } = this;
    if (!currentBounds) { return }
    let bounds = toBounds(currentBounds.x, currentBounds.y, currentBounds.startX, currentBounds.startY);

    if (pointInsideRect(currentBounds, x, y)) {
      this.isMoving = true;
      if (!isCopy) {
        ctx.clearRect(bounds.x, bounds.y, bounds.width, bounds.height);

      }
      this.dragOffset = {
        x: Math.round(x - bounds.x), y: Math.round(y - bounds.y)
      };
    } else {
      this.currentBounds = null
    }

  }
  drawMove({ x, y, startX, startY }) {
    let { ctx, ctx2, isMoving, buffer, isCopy, currentBounds, dragOffset } = this;

    ctx2.clearRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);

    // console.log(isMoving, buffer)
    if (isMoving) {
      ctx2.putImageData(buffer, x - dragOffset.x, y - dragOffset.y);
    } else {
      let dashLength = 2
      let offset = pixelArtLine(ctx2, startX, startY, x, startY, dashLength);
      offset = pixelArtLine(ctx2, x, startY, x, y, dashLength, offset + 1);

      offset = pixelArtLine(ctx2, startX, startY, startX, y, dashLength);
      pixelArtLine(ctx2, startX, y, x, y, dashLength, offset + 1);
    }


  }
  drawEnd({ x, y, startX, startY }) {
    let { ctx, ctx2, bounceCanvas, bounceCtx, isMoving, dragOffset, currentBounds, buffer } = this;
    if (isMoving) {

      let w = Math.abs(currentBounds.x - currentBounds.startX);
      let h = Math.abs(currentBounds.y - currentBounds.startY);
      bounceCanvas.width = w;
      bounceCanvas.height = h;
      bounceCtx.putImageData(buffer, 0, 0);

      ctx.drawImage(bounceCanvas, Math.round(x - dragOffset.x), Math.round(y - dragOffset.y));

      this.isMoving = false;
      this.currentBounds = {
        x: x - dragOffset.x,
        y: y - dragOffset.y,
        startX: x - dragOffset.x + w,
        startY: y - dragOffset.y + h,
      }
    } else {
      this.currentBounds = {
        x: x,
        y: y,
        startX: startX,
        startY: startY,
      }
      let bounds = toBounds(x, y, startX, startY);
      this.buffer = ctx.getImageData(bounds.x, bounds.y, bounds.width, bounds.height);

    }

  }
  tick({ lastX, lastY }) {
    let { ctx, ctx2, currentBounds, isMoving, buffer, dragOffset } = this;
    if (!currentBounds) { return }
    let { x, y, startX, startY } = currentBounds;
    ctx2.clearRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);

    // console.log(isMoving, buffer)
    if (isMoving) {
      ctx2.putImageData(buffer, lastX - dragOffset.x, lastY - dragOffset.y);
    } else {

      let dashLength = 2
      let offset = pixelArtLine(ctx2, startX, startY, x, startY, dashLength);
      offset = pixelArtLine(ctx2, x, startY, x, y, dashLength, offset + 1);

      offset = pixelArtLine(ctx2, startX, startY, startX, y, dashLength);
      pixelArtLine(ctx2, startX, y, x, y, dashLength, offset + 1);

    }
  }

}

export default Select