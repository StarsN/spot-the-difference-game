// Twin Town — Spot the Difference: deterministic screenshot scenes.
//
// `?shot=play` (and friends) puts the game into a fixed, staged state so the
// screenshots are real renders of the game code with the same content every
// run. The shot presets are only for the maker's screenshots; a normal visit
// with no query string starts at the title screen.

export function applyShot(game, query) {
  const shot = query.get('shot');
  if (!shot) return false;
  if (shot === 'title') {
    game.toTitle();
    return true;
  }
  if (shot === 'play') {
    // Harbor Dawn mid-game: three differences already found (rings visible),
    // four still hidden, the counter reading "4 still hidden".
    game.startLevel(0);
    game.state.found = new Set(['sun-rays', 'sail', 'fish']);
    game.state.elapsed = 83;
    game.state.hints = 2;
    game.state.score = 300;
    return true;
  }
  if (shot === 'market') {
    // Lantern Market mid-game: two found, five hidden.
    game.startLevel(1);
    game.state.found = new Set(['moon', 'cat']);
    game.state.elapsed = 61;
    game.state.hearts = 2;
    game.state.hints = 3;
    game.state.score = 200;
    return true;
  }
  if (shot === 'win') {
    // Level-complete screen for Harbor Dawn, with the time bonus shown.
    game.startLevel(0);
    game.state.found = new Set(game.state.level.diffs.map((d) => d.id));
    game.state.score = 700;
    game.state.elapsed = 95;
    game.completeLevel();
    return true;
  }
  return false;
}
