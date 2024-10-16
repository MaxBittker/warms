

import { distance, pointsAlongLine, pixelArtLine } from "./utils.js"


import hershey from './tools/textUtils/hershey.js';
// import FONT_HERSHEY from "./textUtils/hershey-data.js";
let {
  putText,
  fontOptions,
} = hershey;
export function renderHTML(ctx, pixelRatio) {
  let els = document.querySelectorAll("#content *");
  els.forEach(el => {
    let bounds = el.getBoundingClientRect();
    let { left, top, width, height } = bounds;
    let x = Math.round(left) * pixelRatio;
    let y = Math.round(top) * pixelRatio;
    let x2 = Math.floor(left + width) * pixelRatio;
    let y2 = Math.floor(top + height) * pixelRatio;

    console.log(el.tagName)
    console.log(bounds)
    if (el.classList.contains("border")) {
      pixelArtLine(ctx, x2, y2, x, y2);
      pixelArtLine(ctx, x, y2, x, y);

      pixelArtLine(ctx, x2, y2, x2, y);
      pixelArtLine(ctx, x2, y, x, y,);
    }

    if (el.tagName === "TEXT") {
      ctx.save();
      ctx.translate(Math.round(x), Math.round(y))
      console.log(el.innerText)
      let textSize = parseInt(window.getComputedStyle(el).fontSize, 10);
      // console.log(textSize)

      if (el.classList.contains("small")) {
        putText(ctx, el.innerText, { cmap: fontOptions[1], width: width * pixelRatio, size: textSize * pixelRatio * 1.5, lhRatio: 0.8 });
      } else {
        putText(ctx, el.innerText, { cmap: fontOptions[0], width: width * pixelRatio, size: textSize * pixelRatio, lhRatio: 1.0 });

      }
      // putText(ctx, el.innerText, { cmap: fontOptions[2], width: width * pixelRatio, size: textSize * .30, lhRatio: 1.8 });
      ctx.restore();
    }


  }
  );

}
