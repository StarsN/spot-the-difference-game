// Twin Town — Spot the Difference: canvas rendering.
//
// The canvas is a fixed 1280x720 stage. Two 520x520 scene panels sit side by
// side under a HUD bar, above a footer bar. This file draws everything the
// player sees: the panels, the rings on found differences, the HUD, and the
// title / level-complete / game-complete screens. Game logic lives in main.js.

import { SCENE_W, SCENE_H } from './scenes.js';

export const STAGE_W = 1280;
export const STAGE_H = 720;
export const PANEL = 520;
export const PANEL_Y = 92;
export const LEFT_X = 90;
export const RIGHT_X = 670;

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

// Draw one scene panel (left or right) at its stage position.
export function drawPanel(g, level, side, found, hintSpot, crosshair) {
  const px = side === 'L' ? LEFT_X : RIGHT_X;
  g.save();
  g.beginPath();
  g.rect(px, PANEL_Y, PANEL, PANEL);
  g.clip();
  g.translate(px, PANEL_Y);
  level.draw(g, side);
  // Rings on the differences already found.
  for (const d of level.diffs) {
    if (!found.has(d.id)) continue;
    g.strokeStyle = '#ffd23f';
    g.lineWidth = 5;
    g.beginPath();
    g.arc(d.x, d.y, d.r + 6, 0, Math.PI * 2);
    g.stroke();
    g.strokeStyle = 'rgba(255, 210, 63, 0.45)';
    g.lineWidth = 10;
    g.beginPath();
    g.arc(d.x, d.y, d.r + 10, 0, Math.PI * 2);
    g.stroke();
    // Little check mark at the ring's top.
    g.strokeStyle = '#ffd23f';
    g.lineWidth = 5;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(d.x - 8, d.y - d.r - 2);
    g.lineTo(d.x - 2, d.y - d.r + 6);
    g.lineTo(d.x + 10, d.y - d.r - 8);
    g.stroke();
  }
  // Hint glow: a soft pulsing ring around one unfound difference.
  if (hintSpot) {
    const pulse = 6 + Math.sin(Date.now() / 180) * 3;
    g.strokeStyle = 'rgba(120, 220, 255, 0.95)';
    g.lineWidth = 4;
    g.setLineDash([10, 8]);
    g.beginPath();
    g.arc(hintSpot.x, hintSpot.y, hintSpot.r + pulse, 0, Math.PI * 2);
    g.stroke();
    g.setLineDash([]);
  }
  // Keyboard crosshair.
  if (crosshair && crosshair.panel === side) {
    g.strokeStyle = '#ffffff';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(crosshair.x, crosshair.y, 14, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.moveTo(crosshair.x - 20, crosshair.y);
    g.lineTo(crosshair.x + 20, crosshair.y);
    g.moveTo(crosshair.x, crosshair.y - 20);
    g.lineTo(crosshair.x, crosshair.y + 20);
    g.stroke();
  }
  g.restore();
  // Panel frame and label.
  g.strokeStyle = '#3a3a44';
  g.lineWidth = 4;
  g.strokeRect(px, PANEL_Y, PANEL, PANEL);
  g.fillStyle = 'rgba(20, 20, 30, 0.85)';
  roundRect(g, px + 10, PANEL_Y + 10, 96, 30, 8);
  g.fill();
  g.fillStyle = '#ffffff';
  g.font = 'bold 16px sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(side === 'L' ? 'ORIGINAL' : 'COPY', px + 58, PANEL_Y + 26);
}

// A wrong click leaves a fading red X at the spot.
export function drawMiss(g, miss) {
  if (!miss) return;
  const age = (Date.now() - miss.at) / 600;
  if (age >= 1) return;
  g.save();
  g.globalAlpha = 1 - age;
  g.strokeStyle = '#ff5a5a';
  g.lineWidth = 5;
  g.lineCap = 'round';
  const s = 12;
  g.beginPath();
  g.moveTo(miss.x - s, miss.y - s);
  g.lineTo(miss.x + s, miss.y + s);
  g.moveTo(miss.x + s, miss.y - s);
  g.lineTo(miss.x - s, miss.y + s);
  g.stroke();
  g.restore();
}

export function drawHUD(g, state) {
  // Top bar.
  g.fillStyle = '#1d2130';
  g.fillRect(0, 0, STAGE_W, 72);
  g.fillStyle = '#ffd23f';
  g.font = 'bold 30px sans-serif';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.fillText('TWIN TOWN', 24, 38);
  g.fillStyle = '#9aa3b2';
  g.font = '16px sans-serif';
  g.fillText('Spot the Difference', 218, 40);
  // Level dots.
  for (let i = 0; i < 3; i++) {
    g.fillStyle = i < state.levelIndex ? '#4ecb71' : i === state.levelIndex ? '#ffd23f' : '#3a4152';
    g.beginPath();
    g.arc(430 + i * 26, 38, 8, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = '#9aa3b2';
  g.font = '15px sans-serif';
  g.textAlign = 'left';
  g.fillText(state.level.name, 500, 38);
  // Counter of differences left — the heart of the game.
  const left = state.level.diffs.length - state.found.size;
  g.fillStyle = '#ffffff';
  g.font = 'bold 26px sans-serif';
  g.textAlign = 'center';
  g.fillText(`${state.found.size} / ${state.level.diffs.length} found`, 700, 32);
  g.fillStyle = left === 0 ? '#4ecb71' : '#ffd23f';
  g.font = 'bold 18px sans-serif';
  g.fillText(left === 0 ? 'All found!' : `${left} still hidden`, 700, 58);
  // Timer and hearts.
  g.fillStyle = '#ffffff';
  g.font = 'bold 24px sans-serif';
  g.textAlign = 'right';
  g.fillText(state.timerText, 1050, 38);
  for (let i = 0; i < 3; i++) {
    const hx = 1080 + i * 34;
    const hy = 38;
    g.fillStyle = i < state.hearts ? '#ff5a6e' : '#3a4152';
    g.beginPath();
    g.moveTo(hx, hy + 8);
    g.bezierCurveTo(hx - 12, hy - 4, hx - 6, hy - 14, hx, hy - 6);
    g.bezierCurveTo(hx + 6, hy - 14, hx + 12, hy - 4, hx, hy + 8);
    g.fill();
  }
  // Footer bar.
  g.fillStyle = '#1d2130';
  g.fillRect(0, 636, STAGE_W, 84);
  g.fillStyle = '#9aa3b2';
  g.font = '15px sans-serif';
  g.textAlign = 'left';
  g.fillText(state.level.hint, 24, 664);
  g.fillStyle = '#ffffff';
  g.font = 'bold 16px sans-serif';
  g.textAlign = 'right';
  g.fillText(`Hints: ${state.hints}  (H)      Score: ${state.score}      M mute · R restart`, 1256, 664);
  g.fillStyle = '#9aa3b2';
  g.font = '14px sans-serif';
  g.textAlign = 'left';
  g.fillText('Click a difference on either picture — arrows move the crosshair, Enter clicks', 24, 694);
  g.textAlign = 'right';
  g.fillText('Best score: ' + state.best, 1256, 694);
}

// Big centered panel for the title / level-complete / game-complete screens.
function sheet(g, w, h) {
  g.fillStyle = 'rgba(10, 12, 22, 0.72)';
  g.fillRect(0, 0, STAGE_W, STAGE_H);
  g.fillStyle = '#232839';
  roundRect(g, (STAGE_W - w) / 2, (STAGE_H - h) / 2, w, h, 20);
  g.fill();
  g.strokeStyle = '#ffd23f';
  g.lineWidth = 3;
  roundRect(g, (STAGE_W - w) / 2, (STAGE_H - h) / 2, w, h, 20);
  g.stroke();
}

export function drawTitle(g, state) {
  sheet(g, 760, 480);
  const cx = STAGE_W / 2;
  g.textAlign = 'center';
  g.fillStyle = '#ffd23f';
  g.font = 'bold 64px sans-serif';
  g.fillText('TWIN TOWN', cx, 190);
  g.fillStyle = '#ffffff';
  g.font = 'bold 30px sans-serif';
  g.fillText('Spot the Difference', cx, 236);
  g.fillStyle = '#c8cede';
  g.font = '18px sans-serif';
  g.fillText('Two pictures look the same — but seven little things changed.', cx, 292);
  g.fillText('Find them all in three scenes: Harbor Dawn, Lantern Market,', cx, 320);
  g.fillText('Moon Garden. Click a difference on either picture.', cx, 348);
  g.fillStyle = '#ffd23f';
  g.font = 'bold 20px sans-serif';
  g.fillText('Wrong clicks cost a heart — you have three per scene.', cx, 392);
  // Play button.
  g.fillStyle = '#4ecb71';
  roundRect(g, cx - 130, 430, 260, 56, 12);
  g.fill();
  g.fillStyle = '#0d1a10';
  g.font = 'bold 24px sans-serif';
  g.fillText('▶  PLAY', cx, 460);
  g.fillStyle = '#9aa3b2';
  g.font = '15px sans-serif';
  g.fillText('Mouse or keyboard: arrows move the crosshair, Enter clicks, H hints', cx, 522);
  if (state.best > 0) {
    g.fillStyle = '#ffd23f';
    g.font = 'bold 16px sans-serif';
    g.fillText('Best score: ' + state.best, cx, 552);
  }
}

export function drawLevelComplete(g, state, bonus, levelIndex) {
  sheet(g, 680, 420);
  const cx = STAGE_W / 2;
  g.textAlign = 'center';
  g.fillStyle = '#4ecb71';
  g.font = 'bold 46px sans-serif';
  g.fillText('Scene complete!', cx, 220);
  g.fillStyle = '#ffffff';
  g.font = '22px sans-serif';
  g.fillText(`You found all 7 differences in ${state.level.name}.`, cx, 272);
  g.fillStyle = '#ffd23f';
  g.font = 'bold 24px sans-serif';
  g.fillText(`Time bonus +${bonus}   ·   Score ${state.score}`, cx, 318);
  g.fillStyle = '#4ecb71';
  roundRect(g, cx - 130, 360, 260, 56, 12);
  g.fill();
  g.fillStyle = '#0d1a10';
  g.font = 'bold 24px sans-serif';
  g.fillText(levelIndex + 1 < 3 ? 'NEXT SCENE  ▶' : 'SEE RESULTS  ▶', cx, 390);
  g.fillStyle = '#9aa3b2';
  g.font = '15px sans-serif';
  g.fillText('Click the button or press Enter', cx, 456);
}

export function drawGameComplete(g, state) {
  sheet(g, 720, 460);
  const cx = STAGE_W / 2;
  g.textAlign = 'center';
  g.fillStyle = '#ffd23f';
  g.font = 'bold 52px sans-serif';
  g.fillText('You found them all!', cx, 200);
  g.fillStyle = '#ffffff';
  g.font = '22px sans-serif';
  g.fillText('All 21 differences across three scenes.', cx, 252);
  g.fillStyle = '#ffd23f';
  g.font = 'bold 30px sans-serif';
  g.fillText(`Final score: ${state.score}`, cx, 306);
  g.fillStyle = state.score >= state.best && state.score > 0 ? '#4ecb71' : '#c8cede';
  g.font = 'bold 20px sans-serif';
  g.fillText(state.score >= state.best && state.score > 0 ? '★ New best score! ★' : `Best score: ${state.best}`, cx, 344);
  g.fillStyle = '#4ecb71';
  roundRect(g, cx - 130, 388, 260, 56, 12);
  g.fill();
  g.fillStyle = '#0d1a10';
  g.font = 'bold 24px sans-serif';
  g.fillText('↻  PLAY AGAIN', cx, 418);
  g.fillStyle = '#9aa3b2';
  g.font = '15px sans-serif';
  g.fillText('Click the button or press Enter', cx, 474);
}

export function drawGameOver(g, state) {
  sheet(g, 680, 420);
  const cx = STAGE_W / 2;
  g.textAlign = 'center';
  g.fillStyle = '#ff5a6e';
  g.font = 'bold 46px sans-serif';
  g.fillText('Out of hearts!', cx, 220);
  g.fillStyle = '#ffffff';
  g.font = '22px sans-serif';
  g.fillText(`Three wrong clicks in ${state.level.name}.`, cx, 272);
  g.fillText(`You found ${state.found.size} of 7 differences.`, cx, 302);
  g.fillStyle = '#ffd23f';
  g.font = 'bold 24px sans-serif';
  g.fillText(`Score ${state.score}`, cx, 346);
  g.fillStyle = '#4ecb71';
  roundRect(g, cx - 130, 386, 260, 56, 12);
  g.fill();
  g.fillStyle = '#0d1a10';
  g.font = 'bold 24px sans-serif';
  g.fillText('↻  TRY AGAIN', cx, 416);
  g.fillStyle = '#9aa3b2';
  g.font = '15px sans-serif';
  g.fillText('Click the button or press Enter', cx, 472);
}
