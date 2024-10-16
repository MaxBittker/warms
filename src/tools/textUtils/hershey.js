// (c) Lingdong Huang 2018
import FONT_HERSHEY from "./hershey-data.js";
import { pixelArtLine } from "../../utils.js"
// console.log(FONT_HERSHEY);


let cmapnames = []
let cmaps = [];
let goodCmaps = [0, 17, 1, 15, 14, 16, 18,
  2, 10, 11];

for (var k in FONT_HERSHEY) {
  if (k != "DATA") {
    cmapnames.push(k);
  }
}

for (var i = 0; i < cmapnames.length; i++) {
  cmaps.push(FONT_HERSHEY[cmapnames[i]]);
}

let fontOptions = goodCmaps.map((k) => {
  return cmaps[k];
})




function parseBound(entry) {
  var ordR = "R".charCodeAt(0);
  var bound = entry.slice(3, 5);
  var xmin = 1 * bound[0].charCodeAt(0) - ordR;
  var xmax = 1 * bound[1].charCodeAt(0) - ordR;
  return [xmin, xmax]
};
const referenceSize = 28;
function estimateTextWidth(s, args) {
  if (args == undefined) { args = {} }
  if (args.font == undefined) { args.font = FONT_HERSHEY.DATA }
  if (args.cmap == undefined) { args.cmap = FONT_HERSHEY.SIMPLEX };
  if (args.size == undefined) { args.size = referenceSize }
  let ratio = args.size / referenceSize;
  var sum = 0;
  for (var i = 0; i < s.length; i++) {
    var entry = args.font[args.cmap(s[i].charCodeAt(0))];
    if (entry == undefined) {
      return 0;
    }
    var [xmin, xmax] = parseBound(entry);
    sum += (xmax - xmin)
  }
  return sum * ratio;
}

function putChar(ctx, c, args) {
  if (args == undefined) { args = {} }
  if (args.font == undefined) { args.font = FONT_HERSHEY.DATA }
  if (args.cmap == undefined) { args.cmap = FONT_HERSHEY.SIMPLEX };
  if (args.size == undefined) { args.size = referenceSize }
  if (args.lhRatio == undefined) { args.lhRatio = 1.0 }

  let lineSize = Math.round(args.size * args.lhRatio);

  let ratio = args.size / referenceSize;
  var ordR = "R".charCodeAt(0);
  // console.log(args.cmap(c.charCodeAt(0)))
  var entry = args.font[args.cmap(c.charCodeAt(0))];
  if (entry == undefined) {
    return 0;
  }
  var cksum = 1 * entry.slice(0, 3);
  var [xmin, xmax] = parseBound(entry);
  xmin = Math.round(xmin * ratio);
  xmax = Math.round(xmax * ratio);
  var content = entry.slice(5);
  ctx.save();
  ctx.translate(-xmin, Math.round(lineSize / 2));

  let lastX = null;
  let lastY = null;
  for (var i = 0; i < content.length; i += 2) {
    var digit = content.slice(i, i + 2);
    if (digit == " R") {
      lastX = null;
      lastY = null;
    } else {
      var x = digit[0].charCodeAt(0) - ordR;
      var y = digit[1].charCodeAt(0) - ordR;
      x = Math.round(x * ratio);
      y = Math.round(y * ratio);
      if (lastX !== null && lastY !== null) {
        pixelArtLine(ctx, lastX, lastY, x, y);
      }
      lastX = x;
      lastY = y;
    }
  }
  ctx.restore();
  return xmax - xmin;
};
export default {
  parseFontString: function(txt) {
    //MODIFIED
    var lines = txt.split("\n")
    var result = {}
    for (var i = 0; i < lines.length; i++) {
      if (!lines[i].length) {
        continue;
      }
      let words = lines[i].split(",");
      var code = 1 * words[0]
      var entry = words[1]

      result[code] = entry
    }
    return result
  },
  validateFont: function(font) {
    var invalid_indices = []
    for (var k in font) {
      var entry = font[k]
      var cksum = 1 * entry.slice(0, 3);
      var coords = entry.slice(3);
      if (cksum * 2 != coords.length) {
        invalid_indices.push(k)
      }
    }
    return invalid_indices;
  },

  putText: function(ctx, s, args) {
    if (args == undefined) { args = {} }
    if (args.align == undefined) { args.align = "left" };
    if (args.cmap == undefined) { args.cmap = cmaps[0] }
    if (args.width == undefined) { args.width = Infinity }
    if (args.size == undefined) { args.size = referenceSize }
    if (args.lhRatio == undefined) { args.lhRatio = 1.0 }

    let lineSize = Math.round(args.size * args.lhRatio);

    ctx.save();
    let wAcc = 0;
    let hAcc = 0;
    if (args.align == "left") {
    } else if (args.align == "center") {
      // P5.translate(-P5.hershey.estimateTextWidth(s, args) / 2, 0);
    } else if (args.align == "right") {
      // P5.translate(-P5.hershey.estimateTextWidth(s, args), 0);
    }

    let words = []

    s.split(" ").forEach((word) => {
      words.push(word)
      words.push(" ")
    })
    words.pop()


    for (var w = 0; w < words.length; w++) {
      let s = words[w];
      let estW = estimateTextWidth(s, args);
      if (wAcc + estW > args.width && s !== " " && wAcc > 0) {
        ctx.translate(-wAcc, lineSize);
        wAcc = 0;
        hAcc += lineSize;
      }
      for (var i = 0; i < s.length; i++) {
        let c = s[i];
        let estW = estimateTextWidth(c, args);
        if (c === "\n" || (wAcc + estW > args.width && c !== " ")) {
          ctx.translate(-wAcc, lineSize);
          wAcc = 0;
          hAcc += lineSize;
        }
        var x = putChar(ctx, c, args);
        wAcc += x;
        ctx.translate(x, 0);
      }
    }
    ctx.restore();
    return [wAcc, hAcc];
  },
  estimateTextWidth,
  fontOptions
}
