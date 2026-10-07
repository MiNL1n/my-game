import { Game } from "./game.js";

/**
 * 遊戲初始化入口
 */
function initGame() {
  const canvas = document.getElementById("game");
  const scoreEl = document.getElementById("score");
  const livesEl = document.getElementById("lives");
  const restartBtn = document.getElementById("restart");

  if (!canvas) {
    console.error("找不到遊戲畫布元素 #game");
    return;
  }

  const game = new Game({
    canvas,
    scoreEl,
    livesEl,
    restartBtn
  });

  game.start();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGame);
} else {
  initGame();
}
