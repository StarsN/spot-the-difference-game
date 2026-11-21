// Twin Town — Spot the Difference: level data and scene painters.
//
// Every scene is drawn twice, side by side, from the same painter: the left
// panel is the original, the right panel is the copy with seven small changes.
// A painter gets (g, side) where g is a 2D context in a 520x520 scene space
// and side is 'L' or 'R'. Differences are plain conditionals on side, so the
// two panels can never drift apart by accident. No randomness anywhere: every
// decorative element sits at a fixed coordinate, so a scene renders identically
// every time it is drawn.

export const SCENE_W = 520;
export const SCENE_H = 520;

// ---------------------------------------------------------------------------
// Small shape helpers shared by the painters.
// ---------------------------------------------------------------------------
function circle(g, x, y, r, fill) {
  g.fillStyle = fill;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
}
function rect(g, x, y, w, h, fill) {
  g.fillStyle = fill;
  g.fillRect(x, y, w, h);
}
function poly(g, pts, fill) {
  g.fillStyle = fill;
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath();
  g.fill();
}
function line(g, x1, y1, x2, y2, color, width) {
  g.strokeStyle = color;
  g.lineWidth = width;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke();
}
function bird(g, x, y, color) {
  g.strokeStyle = color;
  g.lineWidth = 3;
  g.lineCap = 'round';
  g.beginPath();
  g.arc(x - 9, y, 9, Math.PI * 1.15, Math.PI * 1.85);
  g.stroke();
  g.beginPath();
  g.arc(x + 9, y, 9, Math.PI * 1.15, Math.PI * 1.85);
  g.stroke();
}
function star(g, x, y, r, color) {
  g.fillStyle = color;
  g.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
  g.fill();
}
function lantern(g, x, y, r, color, lit) {
  // Paper lantern: ribbed oval with a tassel.
  g.fillStyle = color;
  g.beginPath();
  g.ellipse(x, y, r, r * 1.15, 0, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = 'rgba(0,0,0,0.25)';
  g.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    g.beginPath();
    g.ellipse(x, y, r * (1 - Math.abs(i) * 0.18), r * 1.15, 0, 0, Math.PI * 2);
    g.stroke();
  }
  rect(g, x - 6, y - r * 1.15 - 6, 12, 7, '#8a6d3b');
  line(g, x, y + r * 1.15, x, y + r * 1.15 + 16, '#d94f30', 3);
  if (lit) {
    g.fillStyle = 'rgba(255, 236, 160, 0.85)';
    g.beginPath();
    g.ellipse(x, y, r * 0.45, r * 0.55, 0, 0, Math.PI * 2);
    g.fill();
  }
}

// ---------------------------------------------------------------------------
// Level 1 — Harbor Dawn
// ---------------------------------------------------------------------------
function drawHarbor(g, side) {
  // Sky and sea.
  const sky = g.createLinearGradient(0, 0, 0, 310);
  sky.addColorStop(0, '#ffd9a0');
  sky.addColorStop(0.55, '#ffeecf');
  sky.addColorStop(1, '#cfeef7');
  rect(g, 0, 0, 520, 310, '#ffeecf');
  g.fillStyle = sky;
  g.fillRect(0, 0, 520, 310);
  rect(g, 0, 310, 520, 210, '#3d8fb5');
  rect(g, 0, 310, 520, 8, '#6fb7d4');
  // Sun. Difference 1: the right sun has no rays.
  circle(g, 420, 80, 34, '#ffcf3f');
  if (side === 'L') {
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      line(g, 420 + Math.cos(a) * 44, 80 + Math.sin(a) * 44, 420 + Math.cos(a) * 58, 80 + Math.sin(a) * 58, '#ffcf3f', 5);
    }
  }
  // Clouds.
  circle(g, 90, 70, 26, '#ffffff');
  circle(g, 115, 62, 30, '#ffffff');
  circle(g, 140, 72, 24, '#ffffff');
  circle(g, 300, 50, 20, '#ffffff');
  circle(g, 320, 44, 24, '#ffffff');
  // Gulls. Difference 2: the gull at (150, 130) is missing on the right.
  bird(g, 210, 100, '#4a4a55');
  bird(g, 260, 70, '#4a4a55');
  if (side === 'L') bird(g, 150, 130, '#4a4a55');
  bird(g, 330, 120, '#4a4a55');
  // Lighthouse on the rocks, left.
  poly(g, [[52, 300], [108, 300], [100, 170], [60, 170]], '#f5f0e6');
  rect(g, 56, 158, 48, 14, '#c94f43');
  rect(g, 66, 138, 28, 20, '#33415c');
  circle(g, 80, 148, 8, '#ffe9a0');
  // Difference 4: the middle red stripe is missing on the right.
  if (side === 'L') rect(g, 58, 224, 44, 18, '#c94f43');
  poly(g, [[36, 302], [124, 302], [132, 330], [28, 330]], '#7d7468');
  // Pier.
  rect(g, 300, 292, 170, 10, '#8a6d4b');
  for (const px of [312, 352, 392, 432, 458]) rect(g, px, 302, 8, 26, '#6e5638');
  // Difference 7: the little flag on the pier post is missing on the right.
  line(g, 350, 292, 350, 258, '#5c4630', 4);
  if (side === 'L') poly(g, [[350, 258], [374, 264], [350, 272]], '#e4572e');
  // Boats. Difference 3: the sail is red on the left, blue on the right.
  poly(g, [[270, 360], [300, 300], [300, 360]], side === 'L' ? '#e4572e' : '#2e6fb7');
  poly(g, [[304, 360], [330, 322], [330, 360]], '#f5f0e6');
  line(g, 300, 296, 300, 362, '#5c4630', 4);
  poly(g, [[262, 360], [338, 360], [326, 378], [274, 378]], '#7a4a2b');
  poly(g, [[400, 392], [424, 344], [424, 392]], '#f5f0e6');
  line(g, 424, 340, 424, 394, '#5c4630', 4);
  poly(g, [[392, 392], [452, 392], [442, 408], [402, 408]], '#4a7a5c');
  // Buoy. Difference 5: orange on the left, green on the right.
  circle(g, 430, 440, 16, side === 'L' ? '#ff7b2e' : '#37b06a');
  rect(g, 424, 418, 12, 8, '#33415c');
  circle(g, 90, 450, 13, '#ff7b2e');
  // Waves.
  g.strokeStyle = 'rgba(255,255,255,0.55)';
  g.lineWidth = 3;
  for (const [wx, wy] of [[60, 360], [180, 400], [330, 430], [430, 370], [150, 470], [380, 480]]) {
    g.beginPath();
    g.arc(wx, wy, 14, Math.PI, Math.PI * 2);
    g.stroke();
  }
  // Jumping fish. Difference 6: the fish is missing on the right.
  if (side === 'L') {
    g.fillStyle = '#2e6fb7';
    g.beginPath();
    g.ellipse(200, 386, 16, 7, -0.5, 0, Math.PI * 2);
    g.fill();
    poly(g, [[214, 380], [224, 372], [222, 388]], '#2e6fb7');
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(196, 384, 2.5, 0, Math.PI * 2);
    g.fill();
  }
  // Distant hills.
  poly(g, [[0, 310], [120, 250], [230, 310]], '#8fb8a8');
  poly(g, [[330, 310], [430, 262], [520, 310]], '#8fb8a8');
}

// ---------------------------------------------------------------------------
// Level 2 — Lantern Market
// ---------------------------------------------------------------------------
function drawMarket(g, side) {
  // Night sky, moon and stars.
  rect(g, 0, 0, 520, 520, '#1d2a4a');
  for (const [sx, sy, sr] of [[40, 180, 3], [500, 90, 3], [470, 200, 2], [20, 300, 2], [250, 30, 2], [350, 210, 2], [150, 250, 2]]) {
    star(g, sx, sy, sr, '#ffe9a0');
  }
  // Difference 1: full moon on the left, crescent on the right.
  circle(g, 70, 70, 30, '#fff3c4');
  if (side === 'R') circle(g, 82, 64, 26, '#1d2a4a');
  // String lights across the top.
  line(g, 0, 40, 520, 40, '#0f1830', 3);
  for (let i = 0; i < 9; i++) {
    const x = 30 + i * 55;
    const y = 40 + Math.sin((i / 8) * Math.PI) * 14;
    line(g, x, 40, x, y, '#0f1830', 2);
    circle(g, x, y + 8, 6, ['#ff5a5a', '#ffd23f', '#4ecb71', '#5aa9ff'][i % 4]);
  }
  // Bunting. Difference 6: the middle flag is missing on the right.
  line(g, 120, 100, 400, 100, '#0f1830', 3);
  for (let i = 0; i < 7; i++) {
    if (side === 'R' && i === 3) continue;
    const x = 140 + i * 40;
    poly(g, [[x, 100], [x + 30, 100], [x + 15, 122]], ['#ff5a5a', '#ffd23f', '#4ecb71', '#5aa9ff'][i % 4]);
  }
  // Left stall with striped awning. Difference 4: awning stripes teal vs purple.
  poly(g, [[70, 200], [190, 200], [200, 150], [60, 150]], side === 'L' ? '#2ea8a0' : '#9a5fd0');
  for (let i = 0; i < 6; i++) rect(g, 60 + i * 23, 150, 12, 50, i % 2 === 0 ? '#f5f0e6' : side === 'L' ? '#2ea8a0' : '#9a5fd0');
  rect(g, 66, 200, 128, 90, '#7a4a2b');
  rect(g, 66, 200, 128, 10, '#5c3820');
  // Difference 7: the stall sign reads TEA on the left, TOYS on the right.
  rect(g, 96, 216, 68, 26, '#f5f0e6');
  g.fillStyle = '#33415c';
  g.font = 'bold 17px sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(side === 'L' ? 'TEA' : 'TOYS', 130, 230);
  // Tea cups on the stall.
  for (const cx of [84, 112, 140, 168]) {
    circle(g, cx, 272, 9, '#ffd23f');
    rect(g, cx - 9, 268, 18, 5, '#e8b93c');
  }
  // Right stall.
  poly(g, [[330, 200], [450, 200], [460, 150], [320, 150]], '#e4572e');
  for (let i = 0; i < 6; i++) rect(g, 320 + i * 23, 150, 12, 50, i % 2 === 0 ? '#f5f0e6' : '#e4572e');
  rect(g, 326, 200, 128, 90, '#7a4a2b');
  rect(g, 326, 200, 128, 10, '#5c3820');
  for (const cx of [344, 372, 400, 428]) {
    circle(g, cx, 272, 9, '#ff8fb2');
    rect(g, cx - 9, 268, 18, 5, '#e06a90');
  }
  // Hanging lanterns. Difference 2: the big lantern is red vs gold.
  line(g, 260, 40, 260, 84, '#0f1830', 3);
  lantern(g, 260, 120, 26, side === 'L' ? '#e4572e' : '#f2b705', true);
  line(g, 470, 40, 470, 100, '#0f1830', 3);
  lantern(g, 470, 130, 18, '#e4572e', true);
  line(g, 30, 40, 30, 96, '#0f1830', 3);
  lantern(g, 30, 122, 16, '#ffd23f', true);
  // Fruit cart. Difference 5: five oranges on the left, three on the right.
  rect(g, 300, 400, 120, 60, '#8a6d4b');
  rect(g, 300, 400, 120, 12, '#6e5638');
  circle(g, 314, 470, 14, '#5c4630');
  circle(g, 406, 470, 14, '#5c4630');
  const oranges = side === 'L' ? [318, 342, 366, 390, 408] : [330, 360, 390];
  for (const ox of oranges) circle(g, ox, 388, 11, '#ff8c1a');
  circle(g, 350, 368, 11, '#ff8c1a');
  // Crate with a cat. Difference 3: the cat is missing on the right.
  rect(g, 430, 420, 64, 52, '#a8875e');
  line(g, 430, 446, 494, 446, '#8a6d4b', 3);
  line(g, 462, 420, 462, 472, '#8a6d4b', 3);
  if (side === 'L') {
    g.fillStyle = '#3a3a44';
    g.beginPath();
    g.ellipse(462, 408, 20, 13, 0, 0, Math.PI * 2);
    g.fill();
    circle(g, 478, 392, 11, '#3a3a44');
    poly(g, [[472, 384], [476, 372], [480, 384]], '#3a3a44');
    poly(g, [[482, 384], [488, 373], [490, 385]], '#3a3a44');
    line(g, 480, 404, 496, 394, '#3a3a44', 4);
    g.fillStyle = '#ffd23f';
    g.beginPath();
    g.arc(482, 391, 2, 0, Math.PI * 2);
    g.fill();
  }
  // Cobblestones.
  rect(g, 0, 472, 520, 48, '#2a3350');
  g.strokeStyle = 'rgba(255,255,255,0.12)';
  g.lineWidth = 2;
  for (let i = 0; i < 10; i++) {
    g.beginPath();
    g.arc(30 + i * 52, 496, 12, 0, Math.PI * 2);
    g.stroke();
  }
}

// ---------------------------------------------------------------------------
// Level 3 — Moon Garden
// ---------------------------------------------------------------------------
function drawGarden(g, side) {
  // Dusk sky and ground.
  const sky = g.createLinearGradient(0, 0, 0, 340);
  sky.addColorStop(0, '#2c2a55');
  sky.addColorStop(1, '#7a5a8c');
  g.fillStyle = sky;
  g.fillRect(0, 0, 520, 340);
  rect(g, 0, 340, 520, 180, '#4a7a52');
  circle(g, 440, 70, 28, '#fff3c4');
  for (const [sx, sy, sr] of [[40, 60, 3], [120, 40, 2], [300, 90, 3], [200, 130, 2], [480, 180, 2]]) {
    star(g, sx, sy, sr, '#ffe9a0');
  }
  // Cherry tree, left. Difference 2: pink blossoms vs white.
  line(g, 110, 340, 110, 170, '#5c3a2e', 16);
  line(g, 110, 230, 60, 170, '#5c3a2e', 10);
  line(g, 110, 210, 170, 150, '#5c3a2e', 10);
  const blossom = side === 'L' ? '#ff9ec6' : '#f5f0e6';
  for (const [bx, by, br] of [[70, 150, 30], [120, 120, 34], [165, 155, 28], [100, 180, 26], [150, 195, 24]]) {
    circle(g, bx, by, br, blossom);
  }
  // Pagoda, right. Difference 6: red roof vs green roof.
  const roof = side === 'L' ? '#c94f43' : '#2e8b57';
  rect(g, 400, 240, 80, 100, '#f5f0e6');
  poly(g, [[388, 244], [492, 244], [440, 200]], roof);
  rect(g, 408, 254, 64, 8, '#33415c');
  poly(g, [[396, 200], [484, 200], [440, 164]], roof);
  rect(g, 416, 168, 48, 10, '#33415c');
  poly(g, [[408, 168], [472, 168], [440, 140]], roof);
  circle(g, 440, 136, 5, '#ffd23f');
  rect(g, 432, 290, 16, 50, '#33415c');
  for (const wx of [410, 462]) {
    rect(g, wx, 262, 14, 18, '#ffd23f');
  }
  // Pond.
  g.fillStyle = '#2e6fb7';
  g.beginPath();
  g.ellipse(260, 440, 210, 62, 0, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.5)';
  g.lineWidth = 3;
  for (const [wx, wy] of [[150, 420], [330, 460], [230, 470]]) {
    g.beginPath();
    g.ellipse(wx, wy, 22, 6, 0, 0, Math.PI * 2);
    g.stroke();
  }
  // Koi. Difference 1: three koi on the left, two on the right.
  const koi = side === 'L'
    ? [[200, 430, '#ff8c1a'], [280, 450, '#f5f0e6'], [340, 425, '#ff8c1a']]
    : [[200, 430, '#ff8c1a'], [340, 425, '#ff8c1a']];
  for (const [kx, ky, kc] of koi) {
    g.fillStyle = kc;
    g.beginPath();
    g.ellipse(kx, ky, 16, 7, 0.3, 0, Math.PI * 2);
    g.fill();
    poly(g, [[kx + 14, ky - 2], [kx + 24, ky - 8], [kx + 24, ky + 4]], kc);
  }
  // Lily pads. Difference 7: three pads on the left, two on the right.
  const pads = side === 'L' ? [[150, 460], [220, 478], [300, 470]] : [[150, 460], [300, 470]];
  for (const [px, py] of pads) {
    g.fillStyle = '#37b06a';
    g.beginPath();
    g.ellipse(px, py, 24, 9, 0, 0, Math.PI * 2);
    g.fill();
  }
  // Frog on a pad. Difference 3: the frog is missing on the right.
  if (side === 'L') {
    circle(g, 378, 428, 14, '#4ecb71');
    circle(g, 368, 414, 7, '#4ecb71');
    circle(g, 388, 414, 7, '#4ecb71');
    g.fillStyle = '#1d2a4a';
    g.beginPath();
    g.arc(368, 413, 2.5, 0, Math.PI * 2);
    g.arc(388, 413, 2.5, 0, Math.PI * 2);
    g.fill();
  }
  // Stone lantern. Difference 4: lit on the left, dark on the right.
  rect(g, 78, 300, 24, 44, '#8d8d96');
  rect(g, 70, 288, 40, 14, '#8d8d96');
  rect(g, 72, 344, 36, 10, '#8d8d96');
  if (side === 'L') {
    circle(g, 90, 282, 9, '#ffe9a0');
    g.fillStyle = 'rgba(255, 233, 160, 0.25)';
    g.beginPath();
    g.arc(90, 282, 22, 0, Math.PI * 2);
    g.fill();
  } else {
    circle(g, 90, 282, 9, '#5c5c66');
  }
  // Bridge.
  line(g, 180, 380, 340, 380, '#8a6d4b', 8);
  for (let i = 0; i < 7; i++) {
    const bx = 190 + i * 22;
    line(g, bx, 372, bx, 396, '#6e5638', 5);
  }
  line(g, 180, 366, 340, 366, '#a8875e', 4);
  // Fireflies. Difference 5: one extra firefly on the right.
  const flies = [[300, 150], [350, 110], [250, 190], [420, 240]];
  if (side === 'R') flies.push([180, 110]);
  for (const [fx, fy] of flies) {
    g.fillStyle = 'rgba(255, 240, 140, 0.9)';
    g.beginPath();
    g.arc(fx, fy, 4, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = 'rgba(255, 240, 140, 0.25)';
    g.beginPath();
    g.arc(fx, fy, 10, 0, Math.PI * 2);
    g.fill();
  }
}

// ---------------------------------------------------------------------------
// Level table: painter + the seven differences of each scene.
// Coordinates are in the 520x520 scene space; r is the click radius.
// ---------------------------------------------------------------------------
export const LEVELS = [
  {
    id: 'harbor',
    name: 'Harbor Dawn',
    hint: 'A sleepy fishing harbor at sunrise. Seven small things changed.',
    draw: drawHarbor,
    diffs: [
      { id: 'sun-rays', x: 420, y: 80, r: 46 },
      { id: 'gull', x: 150, y: 130, r: 22 },
      { id: 'sail', x: 300, y: 330, r: 40 },
      { id: 'stripe', x: 80, y: 233, r: 26 },
      { id: 'buoy', x: 430, y: 440, r: 22 },
      { id: 'fish', x: 200, y: 386, r: 24 },
      { id: 'flag', x: 356, y: 266, r: 22 },
    ],
  },
  {
    id: 'market',
    name: 'Lantern Market',
    hint: 'A night market under paper lanterns. Seven small things changed.',
    draw: drawMarket,
    diffs: [
      { id: 'moon', x: 70, y: 70, r: 34 },
      { id: 'lantern', x: 260, y: 120, r: 30 },
      { id: 'cat', x: 462, y: 402, r: 34 },
      { id: 'awning', x: 130, y: 175, r: 34 },
      { id: 'fruit', x: 360, y: 388, r: 32 },
      { id: 'bunting', x: 260, y: 108, r: 20 },
      { id: 'sign', x: 130, y: 230, r: 28 },
    ],
  },
  {
    id: 'garden',
    name: 'Moon Garden',
    hint: 'A quiet garden pond under the moon. Seven small things changed.',
    draw: drawGarden,
    diffs: [
      { id: 'koi', x: 280, y: 445, r: 32 },
      { id: 'blossom', x: 120, y: 150, r: 38 },
      { id: 'frog', x: 378, y: 424, r: 26 },
      { id: 'stone-lantern', x: 90, y: 290, r: 26 },
      { id: 'firefly', x: 180, y: 110, r: 18 },
      { id: 'roof', x: 440, y: 200, r: 36 },
      { id: 'lily', x: 220, y: 478, r: 26 },
    ],
  },
];
