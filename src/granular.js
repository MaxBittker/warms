const pane = new Tweakpane.Pane({
  container: document.getElementById('tweaks'),

});

const btn = pane.addButton({
  title: 'Clear',
});

btn.on('click', () => {
  window.ctx3.clearRect(0, 0, 3000, 3000);
});

const btn2 = pane.addButton({
  title: 'savePreset',
});
btn2.on('click', () => {
  console.log(pane.exportPreset())
});

const PARAMS = {
  file: "assets/audio/pencil.wav",
  startPos: .55,
  grainSize: .4,
  ramp: .2,
  density: 30,
  spread: .4,
  theme: 'dark',
  lfoSpeed: 1,
  lfoAmplitude: 0.8,
  bandPass: 600,
};

const soundOptions = {
  // pen: 'assets/audio/pen.mp3',
  pencil: 'assets/audio/pencil.wav',
  // chime: 'assets/audio/chime.mp3',
  // guitar: 'assets/audio/guitar.mp3',
  // claves: 'assets/audio/claves.wav',
  shutter: 'assets/audio/shutter.wav',
  kalimba: 'assets/audio/kalimba.wav',
  carriage: 'assets/audio/carriage-return.wav',
  // robin: 'assets/audio/robin.wav',
  // opera: 'assets/audio/opera.wav',
  boing: 'assets/audio/boingS.wav',
  shaker: 'assets/audio/shaker.wav',
  // harp: 'assets/audio/harp.wav',
  // keyboard: 'assets/audio/keyboard.wav',
  keyclicks: 'assets/audio/keyclicks.wav',
  maraca: 'assets/audio/maraca.wav',
  swoosh: 'assets/audio/swoosh.wav',
}

let fileInput = pane.addInput(
  PARAMS, 'file',
  {
    options: soundOptions
  }
);
const f1 = pane.addFolder({
  title: 'Granular',
});
f1.expanded = false;

let startInput = f1.addInput(
  PARAMS, 'startPos',
  { min: 0, max: 10, }
);
f1.addInput(
  PARAMS, 'grainSize',
  { min: .01, max: 1, }
);
f1.addInput(
  PARAMS, 'ramp',

  { min: 0, max: .5, hidden: true, }
);

f1.addInput(
  PARAMS, 'spread',
  { min: 0, max: 3, }
);
f1.addInput(
  PARAMS, 'density',
  { min: 1, max: 60, }
);
f1.addInput(
  PARAMS, 'lfoSpeed',
  { min: 0, max: 3, }
);
f1.addInput(
  PARAMS, 'lfoAmplitude',
  { min: 0, max: 3, }
);
let freqInput = f1.addInput(
  PARAMS, 'bandPass',
  { min: 50, max: 5000, }
);


// const pane = new Pane();
f1.addMonitor(PARAMS, 'lfoSpeed', {
  view: 'graph',
  min: 0,
  max: +2,
});
f1.addMonitor(PARAMS, 'bandPass', {
  view: 'graph',
  min: 200,
  max: 1000,
});



fileInput.on('change', function(ev) {
  // console.log(`change: ${ev.value}`);
  selectFile(PARAMS.file)
});

window.params = PARAMS;
window.pane = pane;
let canvas = document.getElementById("waveform")
let canvas2 = document.getElementById("playback")

let ctx = canvas.getContext("2d")
let ctx2 = canvas2.getContext("2d")
let pixelRatio = 2;
canvas.width = window.innerWidth * pixelRatio;
canvas2.width = window.innerWidth * pixelRatio;
canvas.height = 50 * pixelRatio;
canvas2.height = 50 * pixelRatio;


window.AudioContext = window.AudioContext || window.webkitAudioContext;
let started = false
let context = new AudioContext();

//final gain node
let final = context.createGain();
final.connect(context.destination);


//envelope gain node
let envelope = context.createGain();
envelope.connect(final);


let bandPass = context.createBiquadFilter();
bandPass.type = "bandpass";
bandPass.frequency.value = 800;
bandPass.Q.value = .4;
bandPass.connect(envelope);

freqInput.on('change', function(ev) {
  bandPass.frequency.value = ev.value;

})


function map(v, in_min, in_max, out_min, out_max) {
  return ((v - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}
function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function clampMap(v, in_min, in_max, out_min, out_max) {
  let vmapped = map(v, in_min, in_max, out_min, out_max);
  return clamp(vmapped, out_min, out_max);
}

let voices = []


let data;
let isLoaded = false
let buffer;
let kbBuffer
window.selectFile = selectFile;



let buffers = {}
// console.log(soundOptions)
// console.log(Object.values(soundOptions))
// Object.values(soundOptions).forEach(async (url) => {
Object.values(soundOptions).forEach(async (url) => {
  console.log(url)
  let bufferPromise = await getData(url);
  buffers[url] = bufferPromise;
  if (url === 'assets/audio/pencil.wav') {
    selectFile(url)
  }
})

async function selectFile(url) {
  let b = await buffers[url]
  buffer = b;
  isLoaded = true;
  console.log(url)
  data = buffer.getChannelData(0)
  drawWaveForm(data);
}
// kbBuffer = 

function getData(url) {

  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`fetch error, status = ${response.status}`);
      }
      return response.arrayBuffer();
    })
    .then((buffer) => context.decodeAudioData(buffer))
    .then((decodedData) => {
      buffer = decodedData;


      return buffer;

    });
};
getData(PARAMS.file)


async function playSingleGrain({ url, grainSize, startPos, gain }) {
  // let { grainSize,  startPos } = PARAMS;

  let source = context.createBufferSource();

  source.buffer = await buffers[url];

  //create the gain for enveloping
  let gainNode = context.createGain();
  source.connect(gainNode);
  gainNode.connect(context.destination);

  const now = context.currentTime;
  let ramp = .05;
  let offset = startPos;
  source.start(
    now,
    Math.max(0, offset),
    grainSize
  ); //parameters (when,offset,duration)
  let kbVolume = gain || .5
  gainNode.gain.setValueAtTime(kbVolume, now);
  gainNode.gain.linearRampToValueAtTime(kbVolume, now + grainSize * (1 - ramp));
  gainNode.gain.linearRampToValueAtTime(
    0,
    now + (grainSize)
  );
  let tms = (grainSize) * 1000; //calculate the time in miliseconds
  voices.push({ offset, duration: tms / 1000, startTime: now });
  setTimeout(() => {
    voices.shift();
  }, tms + 100);
  source.stop(now + grainSize + 0.1);
}


function playGrain(lfoOffset) {
  let { grainSize, ramp, spread, startPos } = PARAMS;

  let source = context.createBufferSource();

  let offset = (startPos % buffer.duration) + lfoOffset + (Math.random() - 0.5) * spread * grainSize;
  source.buffer = buffer;
  //create the gain for enveloping
  let gain = context.createGain();
  source.connect(gain);
  gain.connect(bandPass);

  const now = context.currentTime;
  source.start(
    now,
    Math.max(0, offset),
    grainSize
  ); //parameters (when,offset,duration)
  gain.gain.setValueAtTime(0.0, now);
  gain.gain.linearRampToValueAtTime(1, now + grainSize * ramp);
  gain.gain.linearRampToValueAtTime(1, now + grainSize * (1 - ramp));
  gain.gain.linearRampToValueAtTime(
    0,
    now + (grainSize)
  );
  let tms = (grainSize) * 1000; //calculate the time in miliseconds
  voices.push({ offset, duration: tms / 1000, startTime: now });
  setTimeout(() => {
    voices.shift();
  }, tms + 100);
  source.stop(now + grainSize + 0.1);
}

// let x = null;
let lastFrame = Date.now();
let lastHit = Date.now()
let lfoClock = 0;
let isDown = false;
canvas.addEventListener("pointerdown", e => {
  if (!isLoaded) { return }
  let offset = ((e.clientX * pixelRatio) / canvas.height) * buffer.duration;
  PARAMS.startPos = offset;
  console.log(offset)
  // playGrain(0);
  isDown = true;
});
canvas.addEventListener("pointermove", e => {
  if (!isLoaded) { return }
  if (isDown) {
    PARAMS.startPos = ((e.clientX * pixelRatio) / canvas.width) * buffer.duration;
  }
});
window.addEventListener("pointerup", () => {
  isDown = false;
});




// set up request animation loop
async function tick() {
  drawVoices()
  let timeSinceLastHit = Date.now() - lastHit;
  let timeSinceLastFrame = Date.now() - lastFrame;
  lfoClock += (timeSinceLastFrame / 1000) * PARAMS.lfoSpeed;
  // let lfo = Math.sin(lfoClock) * PARAMS.lfoAmplitude / 2 ;
  let lfo = (Math.abs((lfoClock % 1) - .5) - .25) * PARAMS.lfoAmplitude
  // console.log(timeSinceLastHit)
  let timeBetweenHits = 1000 / PARAMS.density;
  if (isLoaded && timeSinceLastHit > timeBetweenHits) {
    if (buffer !== await buffers['assets/audio/keyclicks.wav']) {
      playGrain(lfo);
      lastHit = Date.now()
    }

  }
  lastFrame = Date.now();


  requestAnimationFrame(tick);

}
tick()


function drawWaveForm(data) {
  let step = Math.ceil(data.length / canvas.width);
  let amp = canvas.height / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < canvas.width; i++) {
    let min = 1.0;
    let max = -1.0;

    for (let j = 0; j < step; j++) {
      let datum = data[i * step + j];
      let d2 = Math.pow(Math.abs(datum), .5) * Math.sign(datum);
      if (d2 < min) {
        min = d2;
      } else if (d2 > max) {
        max = d2;
      }
    }
    ctx.fillStyle = "#fff";
    ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
  }
}

function drawVoices() {
  if (!buffer?.duration) return
  const now = context.currentTime;
  ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

  for (let i = 0; i < voices.length; i++) {
    let { offset, duration, startTime } = voices[i];
    const elapsed = now - startTime;

    let ratio = canvas.width / buffer.duration;

    let start = offset * ratio;
    let current = (offset + elapsed) * ratio;
    let end = (offset + duration) * ratio;
    if (current < end) {
      ctx2.strokeStyle = "rgba(255,0,255,1.00)";
      ctx2.strokeRect(current, 0, 1, canvas2.height);
      // ctx2.fillStyle = "rgba(255,0,255,0.10)";
      // ctx2.strokeRect(start, 0, duration * ratio, canvas2.height);
    }
  }
}
envelope.gain.setValueAtTime(0.0, context.currentTime);

function triggerAttack() {
  rollingV = 0;
  if (!started) {
    playGrain(0.5);
    started = true;
  }
  let now = context.currentTime;
  envelope.gain.cancelScheduledValues(now);
  envelope.gain.linearRampToValueAtTime(1, now + 0.1);
  // envelope.gain.linearRampToValueAtTime(1, now + PARAMS.grainSize + .2);
}
let rollingV = 0;
let epsilon = 0.2;
function move({ v, a }) {
  rollingV = (rollingV * (1 - epsilon)) + v * epsilon;
  let now = context.currentTime;

  let scaledV = Math.pow(rollingV, .65);
  let vM = clampMap(scaledV, 0, 16, .00, 1.0);
  // let aM = clampMap(a, -Math.PI, Math.PI, 400, 700);
  let aM = clampMap(Math.sin(a), -1, 1, 200, 700);
  PARAMS.bandPass = aM;
  // PARAMS.startPos = clampMap(Math.sin(a), -1, 1, .6, .8);
  PARAMS.lfoSpeed = clampMap(scaledV, 0, 16, .2, 2);;
  // PARAMS.startPos = clampMap(Math.sin(a), -1, 1, .4, .5);
  pane.refresh()
  // console.log(a, aM)

  final.gain.linearRampToValueAtTime(vM, now + 0.05);
  bandPass.frequency.linearRampToValueAtTime(aM, now + 0.05);

}

function triggerRelease() {
  let now = context.currentTime;
  envelope.gain.cancelScheduledValues(now);
  envelope.gain.linearRampToValueAtTime(
    0,
    now + PARAMS.grainSize * 1.2
  );
}
export { triggerAttack, move, triggerRelease, playSingleGrain }


window.preset = (name) => {
  console.log("A")
  console.log(name)

  if (name === "pen") {
    pane.importPreset({
      "file": "assets/audio/pencil.wav",
      "startPos": 5.652173913043478,
      "grainSize": 0.4,
      "ramp": 0.2,
      "spread": 1.597826086956522,
      "density": 30,
      // "lfoSpeed": 0.42072111978030047,
      "lfoAmplitude": 3,
      // "bandPass": 246.44813522506627
    })
  } if (name === "dots") {
    pane.importPreset({
      "file": "assets/audio/shutter.wav",
      "startPos": 1.652173913043478,
      "grainSize": 0.4,
      "ramp": 0.2,
      "spread": 0.597826086956522,
      "density": 30,
      // "lfoSpeed": 0.42072111978030047,
      "lfoAmplitude": 3,
      // "bandPass": 246.44813522506627
    })
  } else if (name === "brush") {
    pane.importPreset({
      "file": "assets/audio/harp.wav",
      "startPos": 2.0652173913043477,
      "grainSize": 0.3866304347826087,
      "ramp": 0.2,
      "spread": 1.2065217391304348,
      "density": 10.619565217391305,
      // "lfoSpeed": 0.42825697175656097,
      "lfoAmplitude": 1.3043478260869565,
      // "bandPass": 450.00000000000006
    })
  } else if (name === "line") {
    pane.importPreset({
      "file": "assets/audio/shaker.wav",
      "startPos": 1.5217391304347827,
      "grainSize": 0.2252173913043478,
      "ramp": 0.2,
      "spread": 0,
      "density": 30,
      "lfoAmplitude": 0,
    })
  } else if (name === "spiral") {
    pane.importPreset({
      "file": "assets/audio/maraca.wav",
      "startPos": 0.0,
      "grainSize": 0.2252173913043478,
      "ramp": 0.2,
      "spread": 0.1,
      "density": 30,
      "lfoAmplitude": 0,
    })
  } else if (name === "erase") {
    pane.importPreset({
      "file": "assets/audio/shutter.wav",
      "startPos": 0,
      "grainSize": 0.21445652173913043,
      "ramp": 0.2,
      "spread": 0.1,
      "density": 30,
      "lfoSpeed": 0.3143918132586053,
      "lfoAmplitude": 0,
      "bandPass": 636.852329670915
    })
  }


}
window.preset("pen")