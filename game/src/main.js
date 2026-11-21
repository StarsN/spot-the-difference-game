// Twin Town — Spot the Difference: game state, rules and the render loop.
//
// Rules: three scenes, seven differences each. Click a difference on either
// picture to ring it on both. A wrong click costs one of three hearts. Three
// hints per scene highlight one unfound difference for a few seconds. Found
// differences are worth 100 points; finishing a scene adds a time bonus
// (up to 300, one point per second under five minutes). Best score is kept in
// localStorage. Screens: title -> playing -> level-complete -> ... ->
// game-complete, or game-over when the hearts run out.

import { LEVELS } from './scenes.js';
import {
  STAGE_W, STAGE_H, PANEL, PANEL_Y, LEFT_X, RIGHT_X,
  drawPanel, drawMiss, drawHUD, drawTitle, drawLevelComplete,
  drawGameComplete, drawGameOver,
} from './render.js';
import { makeInput } from './input.js';
import { ensureAudio, toggleMute, isMuted, sfx } from './audio.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

const BEST_KEY = 'twin-town-best-score';

function loadBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY) || 0) || 0;
  } catch {
    return 0;
  }
}
function saveBest(v) {
  try {
    localStorage.setItem(BEST_KEY, String(v));
  } catch {
    // Private mode: best score just does not persist.
  }
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const game = {
  screen: 'title', // title | playing | level-complete | game-complete | game-over
  levelIndex: 0,
  state: null,
  bonus: 0,
  best: loadBest(),
  input: null,
  shotMode: false,
  miss: null,
  hintSpot: null,
  hintUntil: 0,
  lastTick: 0,

  get level() {
    return LEVELS[this.levelIndex];
  },

  newLevelState() {
    return {
      level: this.level,
      found: new Set(),
      hearts: 3,
      hints: 3,
      score: this.state ? this.state.score : 0,
      elapsed: 0,
      best: this.best,
      timerText: '00:00',
    };
  },

  toTitle() {
    this.screen = 'title';
    this.state = this.newLevelState();
    this.state.score = 0;
    this.levelIndex = 0;
    this.state.level = this.level;
    this.miss = null;
    this.hintSpot = null;
    this.announce('Twin Town, spot the difference. Press Play to start.');
  },

  startLevel(i) {
    this.levelIndex = i;
    this.state = this.newLevelState();
    this.state.level = this.level;
    this.screen = 'playing';
    this.miss = null;
    this.hintSpot = null;
    this.lastTick = performance.now();
    this.announce(`${this.level.name}. Find 7 differences.`);
  },

  startGame() {
    ensureAudio();
    sfx.click();
    this.startLevel(0);
  },

  // A click on a scene panel (scene coords x, y; stage coords sx, sy).
  clickScene(panel, x, y, sx, sy) {
    if (this.screen !== 'playing') return;
    ensureAudio();
    const level = this.level;
    // A click counts if it lands inside any difference's radius.
    let hit = null;
    for (const d of level.diffs) {
      const dx = x - d.x;
      const dy = y - d.y;
      if (dx * dx + dy * dy <= d.r * d.r) { hit = d; break; }
    }
    if (hit && !this.state.found.has(hit.id)) {
      this.state.found.add(hit.id);
      this.state.score += 100;
      sfx.found();
      const left = level.diffs.length - this.state.found.size;
      this.announce(left === 0 ? 'All differences found!' : `Found one! ${left} still hidden.`);
      if (left === 0) this.completeLevel();
      return;
    }
    if (hit) return; // clicking an already-found ring does nothing.
    // Wrong click: red X, a heart, a buzz.
    this.state.hearts -= 1;
    this.miss = { x: sx, y: sy, at: Date.now() };
    sfx.wrong();
    if (this.state.hearts <= 0) {
      this.screen = 'game-over';
      this.announce(`Out of hearts in ${level.name}. Try again.`);
    } else {
      this.announce(`Not a difference. ${this.state.hearts} hearts left.`);
    }
  },

  completeLevel() {
    const bonus = Math.max(0, 300 - Math.floor(this.state.elapsed));
    this.bonus = bonus;
    this.state.score += bonus;
    this.screen = 'level-complete';
    sfx.win();
    this.announce(`Scene complete! Time bonus ${bonus}. Score ${this.state.score}.`);
  },

  nextAfterLevel() {
    ensureAudio();
    sfx.click();
    if (this.levelIndex + 1 < LEVELS.length) this.startLevel(this.levelIndex + 1);
    else {
      this.screen = 'game-complete';
      if (this.state.score > this.best) {
        this.best = this.state.score;
        saveBest(this.best);
      }
      this.announce(`All scenes complete! Final score ${this.state.score}.`);
    }
  },

  useHint() {
    if (this.screen !== 'playing') return;
    if (this.state.hints <= 0) {
      this.announce('No hints left in this scene.');
      return;
    }
    const remaining = this.level.diffs.filter((d) => !this.state.found.has(d.id));
    if (remaining.length === 0) return;
    this.state.hints -= 1;
    this.hintSpot = remaining[0];
    this.hintUntil = Date.now() + 4000;
    ensureAudio();
    sfx.hint();
    this.announce('Hint: look at the glowing ring.');
  },

  // The big on-screen button, per screen (title / level-complete / etc.).
  pressButton() {
    if (this.screen === 'title') this.startGame();
    else if (this.screen === 'level-complete') this.nextAfterLevel();
    else if (this.screen === 'game-complete' || this.screen === 'game-over') this.startGame();
  },

  // Clicks outside the two panels: check the big button's area.
  clickChrome(x, y) {
    if (this.screen === 'title' && x > 510 && x < 770 && y > 430 && y < 486) this.pressButton();
    else if (this.screen === 'level-complete' && x > 510 && x < 770 && y > 360 && y < 416) this.pressButton();
    else if ((this.screen === 'game-complete' || this.screen === 'game-over') && x > 510 && x < 770 && y > 386 && y < 442) this.pressButton();
  },

  announce(text) {
    statusEl.textContent = text;
  },

  tick(now) {
    if (this.screen === 'playing' && !this.shotMode) {
      this.state.elapsed += (now - this.lastTick) / 1000;
    }
    this.lastTick = now;
    if (this.hintSpot && Date.now() > this.hintUntil) this.hintSpot = null;
  },

  render() {
    ctx.fillStyle = '#14161f';
    ctx.fillRect(0, 0, STAGE_W, STAGE_H);
    if (this.screen === 'title') {
      // Show the harbor scene faintly behind the title sheet.
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.translate(LEFT_X, PANEL_Y);
      LEVELS[0].draw(ctx, 'L');
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.translate(RIGHT_X, PANEL_Y);
      LEVELS[0].draw(ctx, 'R');
      ctx.restore();
      drawTitle(ctx, { best: this.best });
      return;
    }
    const s = this.state;
    s.timerText = fmtTime(s.elapsed);
    s.best = this.best;
    drawPanel(ctx, this.level, 'L', s.found, this.hintSpot, this.input.showCrosshair ? this.input.crosshair : null);
    drawPanel(ctx, this.level, 'R', s.found, this.hintSpot, this.input.showCrosshair ? this.input.crosshair : null);
    drawMiss(ctx, this.miss);
    drawHUD(ctx, s);
    if (this.screen === 'level-complete') drawLevelComplete(ctx, s, this.bonus, this.levelIndex);
    else if (this.screen === 'game-complete') drawGameComplete(ctx, s);
    else if (this.screen === 'game-over') drawGameOver(ctx, s);
    if (isMuted()) {
      ctx.fillStyle = '#ffd23f';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('🔇 muted', STAGE_W - 24, 700);
    }
  },
};

function resize() {
  const scale = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
  canvas.style.width = `${Math.floor(STAGE_W * scale)}px`;
  canvas.style.height = `${Math.floor(STAGE_H * scale)}px`;
}
window.addEventListener('resize', resize);
canvas.width = STAGE_W;
canvas.height = STAGE_H;
resize();

game.input = makeInput(canvas, {
  onSceneClick: (panel, x, y, sx, sy) => game.clickScene(panel, x, y, sx, sy),
  onChromeClick: (x, y) => game.clickChrome(x, y),
  onConfirm: () => game.pressButton(),
  onHint: () => game.useHint(),
  onMute: () => { ensureAudio(); toggleMute(); },
  onRestart: () => { if (game.screen === 'playing') game.startLevel(game.levelIndex); },
  onEscape: () => { if (game.screen !== 'title') game.toTitle(); },
});

// Deterministic screenshot scenes freeze the clock.
game.shotMode = applyShot(game, new URLSearchParams(location.search));
if (!game.shotMode) game.toTitle();

function frame(now) {
  game.tick(now);
  game.render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Live state for the maker's playtests (and for curious players in devtools).
window.__twin = game;
