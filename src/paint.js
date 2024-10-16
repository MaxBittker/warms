import { triggerAttack, move, triggerRelease, playSingleGrain } from "./granular.js";
import Pen from "./tools/pen.js";
import Brush from "./tools/brush.js";
import Erase from "./tools/erase.js";
import Dots from "./tools/dots.js";
import Text from "./tools/text.js";
import Fill from "./tools/fill.js";
import Spray from "./tools/spray.js";
import Line from "./tools/line.js";
import Rect from "./tools/rect.js";
import Select from "./tools/select.js";
import Spiral from "./tools/spiral.js";
import Nudge from "./tools/nudge.js";
import Crystal from "./tools/crystal.js";
import { updateSand } from "./sand.js"
import { renderHTML } from "./renderHTML.js"

import { distance, pointsAlongLine, pixelArtLine } from "./utils.js"

let canvas = document.getElementById("drawing")
let ctx = canvas.getContext("2d", { willReadFrequently: true })
let canvas2 = document.getElementById("hud")
let ctx2 = canvas2.getContext("2d", { willReadFrequently: true })
ctx.imageSmoothingEnabled = false
ctx2.imageSmoothingEnabled = false
window.ctx3 = ctx;
let select = new Select(ctx, ctx2)
let tools = {
  "pen": new Pen(ctx, ctx2),
  "brush": new Brush(ctx, ctx2),
  "erase": new Erase(ctx, ctx2),
  "dots": new Dots(ctx, ctx2),
  "text": new Text(ctx, ctx2),
  "fill": new Fill(ctx, ctx2),
  "line": new Line(ctx, ctx2),
  "spray": new Spray(ctx, ctx2),
  "rect": new Rect(ctx, ctx2),
  "spiral": new Spiral(ctx, ctx2),
  "crystal": new Crystal(ctx, ctx2),
  "select": select,
  "copy": select,
  "nudge": new Nudge(ctx, ctx2),
}


let pixelRatio = .333;
canvas.width = window.innerWidth * pixelRatio;
canvas.height = window.innerHeight * pixelRatio;
canvas2.width = window.innerWidth * pixelRatio;
canvas2.height = window.innerHeight * pixelRatio;

ctx.clearRect(0, 0, canvas.width, canvas.height);

let isDrawing = false;
let sent = false;

let trail = []
let lastX = null;
let lastY = null;
let lastA = null;
let startX = null;
let startY = null;


let undoStack = [];
// let undoIndex = 0;

function pushState() {
  console.log("push")
  // undoIndex += 1;
  // undoStack = undoStack.slice(0, undoIndex);
  undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

  if (undoStack.length > 80) {
    undoStack.shift();
  }
}

window.pushState = pushState;
function undo() {
  // undoStack.pop();
  // console.log(undoStack.length, undoIndex)
  let positions = [.1, 1.5, 4.6, 7.93, 12]

  playSingleGrain({
    url: "assets/audio/boingS.wav",
    grainSize: 1.5, startPos: positions[undoStack.length % positions.length]
  })


  // undoIndex -= 1;
  let trashItem = undoStack.pop();
  let lastItem = undoStack[undoStack.length - 1];
  if (lastItem) {
    ctx.putImageData(lastItem, 0, 0);
  }
  if (undoStack.length === 1) {
    undoStack.push(trashItem)
  }
}



function drawStart(x, y) {
  ctx.fillStyle = activeColor;
  ctx.strokeStyle = activeColor;
  ctx.lineWidth = 1;
  ctx2.fillStyle = activeColor;
  ctx2.strokeStyle = activeColor;
  ctx2.lineWidth = 1;
  // if (y > 100) {
  isDrawing = true;
  // }

  lastX = x;
  lastY = y;
  trail = [[x, y]]
  startX = x;
  startY = y;
  activeTool.drawStart({ x, y, activeColor })


  triggerAttack();
}


let distanceTraveled = 0;

function drawMove(x, y, coalesced = false) {
  // ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
  if (isDrawing === false) {
    lastX = x;
    lastY = y;
    return;
  }

  let thickness = 1;

  ctx.lineWidth = thickness;
  let d = distance(x, y, lastX, lastY);
  let speed = d / ((60 * 16) / 1000);
  distanceTraveled += speed;
  let spread = 3 + 0.1 * speed;
  spread = Math.min(30, spread);

  let trailAcc = 0;
  // iterate through trail backwards:
  let [tx, ty] = [x, y]
  for (let i = trail.length - 1; i >= 0; i--) {
    let dt = distance(tx, ty, trail[i][0], trail[i][1]);
    trailAcc += dt;
    tx = trail[i][0];
    ty = trail[i][1];
    if (trailAcc > 3) {
      // console.log(trailAcc)

      break;
    }

  }


  // let a = Math.atan2(x - lastX, y - lastY);
  let a = Math.atan2(x - tx, y - ty);
  // if (speed === 0) return
  ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
  // ctx2.fillStyle = "rgba(255,0,255,1.0)";
  // ctx2.fillRect(Math.round(tx), Math.round(ty), 1, 1)

  if (activeTool.name !== "fill") {
    move({ v: speed, a });
  }
  ctx.fillStyle = activeColor;
  // ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 80%)`;
  ctx.strokeStyle = activeColor;
  ctx.lineWidth = 1;
  ctx2.fillStyle = activeColor;
  ctx2.strokeStyle = activeColor;
  ctx2.lineWidth = 1;
  // console.log(activeTool)
  activeTool.drawMove({ x, y, lastX, lastY, startX, startY, speed, a, lastA, activeColor })

  if (speed === 0) return

  lastX = x;
  lastY = y;
  trail.push([x, y])
  if (trail.length > 30) trail.shift();
  lastA = a
  // lastA = a*.2 + lastA*.8;
}
function drawEnd(x, y) {
  ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

  triggerRelease();
  activeTool.drawEnd({ x, y, startX, startY })

  if (isDrawing) {
    pushState()
  }
  startX = null;
  startY = null;
  isDrawing = false;
}
window.addEventListener("mousedown", (event) => {
  if (event.target === canvas) {
    let x = event.pageX * pixelRatio;
    let y = event.pageY * pixelRatio;
    drawStart(x, y)
  }
}
);
window.addEventListener("mouseup", e => {

  if (event.target === canvas) {
    drawEnd(e.pageX * pixelRatio, e.pageY * pixelRatio)
  }

});
// window.addEventListener("pointerout", drawEnd);
window.addEventListener("mousemove", (event) => {
  event.preventDefault();
  if (event.getCoalescedEvents) {
    for (let coalesced_event of event.getCoalescedEvents()) {
      // paint(coalesced_event); // Paint all raw/non-coalesced points
      if (coalesced_event.target === canvas) {
        drawMove(
          coalesced_event.pageX * pixelRatio,
          coalesced_event.pageY * pixelRatio,
          true
        );
      }
    }
  } else {
    // Paint the final coalesced point
    if (event.target === canvas) {
      drawMove(event.pageX * pixelRatio, event.pageY * pixelRatio)
    }
  }
});
function tick() {
  activeTool.tick({ startX, startY, lastX, lastY, lastA, activeColor })
  // if (sent) {
  // updateSand(ctx)
  // }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
let startDistance = null
let currentDistance = null
let touchStart = null
window.addEventListener("touchstart", (event) => {
  let touches = Array.prototype.slice.call(event.touches, 0);
  if (touches.length == 1) {
    let t = touches[0]
    if (t.target === canvas) {
      drawStart(t.pageX * pixelRatio, t.pageY * pixelRatio)
    }
  }
  if (touches.length === 2) {
    startDistance = distance(touches[0].pageX, touches[0].pageY, touches[1].pageX, touches[1].pageY);
    currentDistance = startDistance
    // console.log(startDistance)
    touchStart = Date.now()
  }
  // event.preventDefault();
}, false);

window.addEventListener("touchmove", (event) => {
  let touches = Array.prototype.slice.call(event.touches, 0);
  if (touches.length == 1) {
    let t = touches[0]
    if (t.target === canvas) {
      drawMove((t.pageX * pixelRatio), (t.pageY * pixelRatio))
    }
  }
  if (touches.length === 2) {
    currentDistance = distance(touches[0].pageX, touches[0].pageY, touches[1].pageX, touches[1].pageY);
    // console.log(currentDistance)
  }
  event.preventDefault();
}, false);

window.addEventListener("touchend", (event) => {
  let touches = Array.prototype.slice.call(event.touches, 0);
  triggerRelease()
  if (isDrawing) {
    let t = event.changedTouches[0]
    if (t.target === canvas) {
      activeTool.drawEnd({ x: (t.pageX * pixelRatio), y: (t.pageY * pixelRatio), startX, startY, })
      pushState()

    }
  }
  if (touches.length === 0) {
    let dd = Math.abs(startDistance - currentDistance)
    let dt = Date.now() - touchStart;

    if (dd < 10 &&
      dt < 300
    ) {
      console.log("undo")
      undo()
    }
  }
}, false);
document.addEventListener("keydown", function(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === "z") {
    undo();
  }
});
window.addEventListener("touchmove", (event) => {
  event.preventDefault();
}, false);

// document.body.addEventListener("touchmove", (event) => {
//   event.preventDefault();
// }, false);

document.getElementById("waveform").addEventListener("touchmove", (event) => {
  event.preventDefault();
}, false)

document.getElementById("playback").addEventListener("touchmove", (event) => {
  event.preventDefault();
}, false)
window.addEventListener("penmove", (event) => {
  event.preventDefault();
}, false);

let panelButtons = document.querySelectorAll("#buttonPanel button");

let activeTool = tools["pen"];
window.size = 1;
panelButtons.forEach((btn) => {
  btn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation()
    lastX = null
    lastY = null;
    console.log(btn.id)
    if (btn.id == "undo") {
      undo();
      return
    }
    panelButtons.forEach((btn) => {
      btn.classList.remove("active");
    });
    btn.classList.add("active");

    if (activeTool.deselect && activeTool != tools[btn.id]) {
      activeTool.deselect()
    }
    if (btn.id == "s") {
      size = 1
    }
    if (btn.id == "m") {
      size = 3;
    }
    if (btn.id == "l") {
      size = 5
    }

    activeTool = tools[btn.id]
    // console.log(btn.id);

    activeTool?.select(btn.id)

    switch (btn.id) {
      case "pen":
        window.preset("pen")
        break;
      case "erase":
        // window.preset("spiral")
        // window.params.file = "assets/audio/shutter.wav";
        window.preset("erase")

        break;
      case "dots":
        window.preset("dots")
        break;
      case "brush":
        window.preset("brush")
        break;
      case "spiral":
        window.preset("spiral")
        break;
      case "fill":
        window.params.file = "assets/audio/harp.wav";
        break;
      case "rect":
        window.params.file = "assets/audio/boing.wav";
        break;
      case "spray":
        window.params.file = "assets/audio/shutter.wav";
        break;
      case "line":
        window.preset("line")
        break;
      case "text":
        window.params.file = "assets/audio/keyclicks.wav";
        break;
    }
    console.log(window.params.file)
    window.pane.refresh()
    window.selectFile(window.params.file);

    if (btn.id === "text") {
      playSingleGrain({
        url: "assets/audio/keyclicks.wav",
        grainSize: .4, startPos: 1.25
      })

    } else {
      triggerAttack();
      setTimeout(() => {
        triggerRelease()
      }, 100)
    }

  })
})

// 



let activeColor = "#ffffffff";
let colorPanel = document.getElementById("colorPanel");
// let colors = ["#000000ff",
//   // "#ff0000ff", "#00ff00ff", "#0000ffff", 
//   "#ffff55ff", "#ff55ffff", "#55ffffff", "#ffffffff"]


let colors = [
  // "#000000",

  "#df6969",
  "#FFA588",
  '#FFDF88',
  "#8feb6e",
  "#78b3d6",
  "#E87CBB",

]
// activeColor = colors[0]
// ctx.fillStyle = activeColor;
// ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
activeColor = colors[Math.random()*colors.length | 0]
ctx.fillStyle = activeColor;
colorPanel.style.borderColor = activeColor;

colors.forEach(color => {
  let colorButton = document.createElement("button");
  colorButton.classList.add("colorButton");
  colorButton.style.backgroundColor = color;

  colorButton.addEventListener("click", () => {

    let btns = document.querySelectorAll(".colorButton");
    btns.forEach(btn => {
      btn.classList.remove("active");
    });

    activeColor = color;
    colorPanel.style.borderColor = activeColor;
    colorPanel.classList.add("active")
  });


  colorPanel.appendChild(colorButton);
});



// renderHTML(ctx, pixelRatio);
// pushState()





// let card = document.getElementById("card")
// let { x, y } = card.getBoundingClientRect();
// activeTool?.select()

ctx.fillStyle = activeColor;
ctx.strokeStyle = activeColor;
ctx.lineWidth = 1;
ctx2.fillStyle = activeColor;
ctx2.strokeStyle = activeColor;
ctx2.lineWidth = 1;

// activeTool.drawStart({ x: (x * pixelRatio) + 10, y: (y * pixelRatio) + 30, activeColor })
