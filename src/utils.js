export function hexToRGB(h) {
  let r = 0, g = 0, b = 0;

  r = h[1] + h[2];
  g = h[3] + h[4];
  b = h[5] + h[6];
  let hex = "0xff" + b + g + r
  return parseInt(hex, 16);
}
export function rand(a = 1) {
  return (Math.random() - 0.5) * a;
}
export function randInt(start, end) {
  return Math.floor(Math.random() * (end - start + 1) + start);
}
export function angleToOffset(a) {
  let x = Math.sin(a);
  let y = Math.cos(a);
  x = Math.round(x)
  y = Math.round(y)
  return [x, y]
}
export function randomOffset() {
  let options = [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1]
  ];
  let i = randInt(0, 7);
  return options[i]
}
export function d2(aX, aY, bX, bY) {
  return Math.pow(aX - bX, 2) + Math.pow(aY - bY, 2);
}
export function distance(aX, aY, bX, bY) {
  return Math.sqrt(Math.pow(aX - bX, 2) + Math.pow(aY - bY, 2));
}
export function pointsAlongLine(startx, starty, endx, endy, spacing = 1) {
  let dist = distance(startx, starty, endx, endy);
  let steps = dist / spacing;

  let points = [];
  for (var d = 0; d <= 1; d += 1 / steps) {
    let point = {
      x: startx * d + endx * (1 - d),
      y: starty * d + endy * (1 - d)
    };
    points.push(point);
  }
  return points;
}

export function pixelArtLinePrecise(ctx, x1, y1, x2, y2) {
  // x1 = Math.round(x1);
  // y1 = Math.round(y1);
  // x2 = Math.round(x2);
  // y2 = Math.round(y2);

  // x1 = x1 - .5;
  // y1 = y1 - .5;
  // x2 = x2 - .5;
  // y2 = y2 - .5;
  const dx = Math.abs(x2 - x1);
  const sx = x1 < x2 ? 1 : -1;
  const dy = -Math.abs(y2 - y1);
  const sy = y1 < y2 ? 1 : -1;
  var e2, er = dx + dy, end = false;
  ctx.beginPath();
  while (!end) {
    ctx.rect(Math.floor(x1), Math.floor(y1), 1, 1);
    let d = distance(x1, y1, x2, y2);
    if (d <= 1.01) {
      end = true;
    } else {
      e2 = 2 * er;
      if (e2 > dy) {
        er += dy;
        x1 += sx;
      }
      if (e2 < dx) {
        er += dx;
        y1 += sy;
      }
    }
  }
  // ctx.rect(Math.floor(x2), Math.floor(y2), 1, 1);

  ctx.fill();
};
export function pixelArtLineClear(ctx, x1, y1, x2, y2, dashedGap = 0, dashOffset = 0) {
  x1 = Math.floor(x1);
  y1 = Math.floor(y1);
  x2 = Math.floor(x2);
  y2 = Math.floor(y2);
  if (isNaN(x1)) throw "x1 is NaN";
  const dx = Math.abs(x2 - x1);
  const sx = x1 < x2 ? 1 : -1;
  const dy = -Math.abs(y2 - y1);
  const sy = y1 < y2 ? 1 : -1;
  var e2, er = dx + dy, end = false;
  let dI = 0 || dashOffset;
  while (!end) {
    if (dashedGap) {
      dI++;
      if (dI % dashedGap == 0) {
        ctx.clearRect(x1, y1, 1, 1);

      }
    } else {
      ctx.clearRect(x1, y1, 1, 1);

    }
    if (x1 === x2 && y1 === y2) {
      end = true;
    } else {
      e2 = 2 * er;
      if (e2 > dy) {
        er += dy;
        x1 += sx;
      }
      if (e2 < dx) {
        er += dx;
        y1 += sy;
      }
    }
  }

  return dI;
};


export function pixelArtLine(ctx, x1, y1, x2, y2, dashedGap = 0, dashOffset = 0) {
  x1 = Math.floor(x1);
  y1 = Math.floor(y1);
  x2 = Math.floor(x2);
  y2 = Math.floor(y2);
  if (isNaN(x1)) throw "x1 is NaN";
  const dx = Math.abs(x2 - x1);
  const sx = x1 < x2 ? 1 : -1;
  const dy = -Math.abs(y2 - y1);
  const sy = y1 < y2 ? 1 : -1;
  var e2, er = dx + dy, end = false;
  ctx.beginPath();
  let dI = 0 || dashOffset;
  while (!end) {
    if (dashedGap) {
      dI++;
      if (dI % dashedGap == 0) {
        ctx.rect(x1, y1, 1, 1);

      }
    } else {
      ctx.rect(x1, y1, 1, 1);

    }
    if (x1 === x2 && y1 === y2) {
      end = true;
    } else {
      e2 = 2 * er;
      if (e2 > dy) {
        er += dy;
        x1 += sx;
      }
      if (e2 < dx) {
        er += dx;
        y1 += sy;
      }
    }
  }
  ctx.fill();

  return dI;
};

function canvasWrap(ctx, x, y) {
  let w = ctx.canvas.width;
  let h = ctx.canvas.height;
  let rx = x % w;
  let ry = y % h;
  if (rx < 0) {
    rx += w
  }
  if (ry < 0) {
    ry += h
  }
  return [rx, ry];
}
export function pixelArtLineWrapping(ctx, x1, y1, x2, y2, r) {
  x1 = Math.floor(x1);
  y1 = Math.floor(y1);
  x2 = Math.floor(x2);
  y2 = Math.floor(y2);
  if (isNaN(x1)) throw "x1 is NaN";
  const dx = Math.abs(x2 - x1);
  const sx = x1 < x2 ? 1 : -1;
  const dy = -Math.abs(y2 - y1);
  const sy = y1 < y2 ? 1 : -1;
  var e2, er = dx + dy, end = false;
  ctx.beginPath();

  while (!end) {
    let [wx, wy] = canvasWrap(ctx, x1, y1);
    ctx.rect(wx - r, wy - r, r, r);


    if (x1 === x2 && y1 === y2) {
      end = true;
    } else {
      e2 = 2 * er;
      if (e2 > dy) {
        er += dy;
        x1 += sx;
      }
      if (e2 < dx) {
        er += dx;
        y1 += sy;
      }
    }
  }
  ctx.fill();

};
