// Twin Town — Spot the Difference: mouse and keyboard input.
//
// The canvas is scaled to fit the window, so pointer positions are converted
// back into the fixed 1280x720 stage space. Keyboard play moves a crosshair
// with the arrow keys and clicks with Enter or Space; H asks for a hint,
// M mutes, R restarts the scene, Enter also presses the big on-screen button.

import { STAGE_W, STAGE_H, PANEL, PANEL_Y, LEFT_X, RIGHT_X } from './render.js';

export function makeInput(canvas, hooks) {
  const input = {
    // Keyboard crosshair: { panel: 'L'|'R', x, y } in scene coordinates, or null.
    crosshair: null,
    showCrosshair: false,
  };

  function stagePoint(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * STAGE_W,
      y: ((clientY - r.top) / r.height) * STAGE_H,
    };
  }

  // Which panel (if any) holds a stage point, and the scene coordinates in it.
  function panelAt(p) {
    if (p.y >= PANEL_Y && p.y < PANEL_Y + PANEL) {
      if (p.x >= LEFT_X && p.x < LEFT_X + PANEL) return { panel: 'L', x: p.x - LEFT_X, y: p.y - PANEL_Y };
      if (p.x >= RIGHT_X && p.x < RIGHT_X + PANEL) return { panel: 'R', x: p.x - RIGHT_X, y: p.y - PANEL_Y };
    }
    return null;
  }

  canvas.addEventListener('pointerdown', (ev) => {
    const p = stagePoint(ev.clientX, ev.clientY);
    const hit = panelAt(p);
    if (hit) hooks.onSceneClick(hit.panel, hit.x, hit.y, p.x, p.y);
    else hooks.onChromeClick(p.x, p.y);
  });

  canvas.addEventListener('pointermove', (ev) => {
    const p = stagePoint(ev.clientX, ev.clientY);
    const hit = panelAt(p);
    if (hit) {
      input.crosshair = { panel: hit.panel, x: hit.x, y: hit.y };
      input.showCrosshair = false; // mouse users get the system cursor
    }
  });

  window.addEventListener('keydown', (ev) => {
    if (ev.repeat) return;
    const k = ev.key;
    if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown') {
      ev.preventDefault();
      if (!input.crosshair) input.crosshair = { panel: 'L', x: 260, y: 260 };
      input.showCrosshair = true;
      const step = ev.shiftKey ? 60 : 18;
      const c = input.crosshair;
      if (k === 'ArrowLeft') c.x -= step;
      if (k === 'ArrowRight') c.x += step;
      if (k === 'ArrowUp') c.y -= step;
      if (k === 'ArrowDown') c.y += step;
      // Walk off one edge and onto the other panel.
      if (c.x < 0 && c.panel === 'R') { c.panel = 'L'; c.x += PANEL; }
      if (c.x >= PANEL && c.panel === 'L') { c.panel = 'R'; c.x -= PANEL; }
      c.x = Math.max(0, Math.min(PANEL - 1, c.x));
      c.y = Math.max(0, Math.min(PANEL - 1, c.y));
      return;
    }
    if (k === 'Enter' || k === ' ') {
      ev.preventDefault();
      if (input.showCrosshair && input.crosshair) {
        const c = input.crosshair;
        const px = (c.panel === 'L' ? LEFT_X : RIGHT_X) + c.x;
        hooks.onSceneClick(c.panel, c.x, c.y, px, PANEL_Y + c.y);
      } else {
        hooks.onConfirm();
      }
      return;
    }
    if (k === 'h' || k === 'H') { hooks.onHint(); return; }
    if (k === 'm' || k === 'M') { hooks.onMute(); return; }
    if (k === 'r' || k === 'R') { hooks.onRestart(); return; }
    if (k === 'Escape') { hooks.onEscape(); return; }
  });

  return input;
}
