import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TILE,
  ROWS,
  COLS,
  STEP,
  GHOST_MOVE_EVERY,
  INITIAL_LIVES,
  SCORE_DOT,
  SCORE_POWER,
  createInitialGrid
} from "./config.js";
import { Player } from "./player.js";
import { EnemyManager } from "./enemy.js";

/**
 * 遊戲主控制器與狀態管理類別
 */
export class Game {
  /**
   * @param {Object} elements - 相關 DOM 元素
   * @param {HTMLCanvasElement} elements.canvas
   * @param {HTMLElement} elements.scoreEl
   * @param {HTMLElement} elements.livesEl
   * @param {HTMLButtonElement} [elements.restartBtn]
   */
  constructor({ canvas, scoreEl, livesEl, restartBtn }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.scoreEl = scoreEl;
    this.livesEl = livesEl;
    this.restartBtn = restartBtn;

    this.player = new Player();
    this.enemyManager = new EnemyManager();

    this.grid = createInitialGrid();
    this.score = 0;
    this.lives = INITIAL_LIVES;
    this.gameOver = false;
    this.win = false;
    this.lastTime = 0;
    this.accumulator = 0;
    this.ghostTick = 0;
    this.animationFrameId = null;

    this.bindEvents();
    this.resetPositions();
  }

  /**
   * 判斷指定座標是否可通行（支援左右穿梭通道）
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  isOpen = (x, y) => {
    if (y < 0 || y >= ROWS) return false;
    if (x < 0 || x >= COLS) return true; // 左右穿隧通道
    return this.grid[y][x] !== "#";
  };

  /**
   * 移動實體物件（支援地圖邊緣環繞迴轉）
   * @param {{x: number, y: number}} entity
   * @param {{x: number, y: number}} dir
   * @returns {boolean}
   */
  moveEntity = (entity, dir) => {
    let nx = entity.x + dir.x;
    let ny = entity.y + dir.y;
    if (nx < 0) nx = COLS - 1;
    if (nx >= COLS) nx = 0;
    if (!this.isOpen(nx, ny)) return false;
    entity.x = nx;
    entity.y = ny;
    return true;
  };

  /**
   * 重設玩家與所有敵人的站位
   */
  resetPositions() {
    this.player.reset();
    this.enemyManager.reset();
  }

  /**
   * 處理吃豆與得分邏輯
   */
  eat() {
    const cell = this.grid[this.player.y][this.player.x];
    if (cell === ".") {
      this.grid[this.player.y][this.player.x] = " ";
      this.score += SCORE_DOT;
    } else if (cell === "o") {
      this.grid[this.player.y][this.player.x] = " ";
      this.score += SCORE_POWER;
    }
    if (this.scoreEl) {
      this.scoreEl.textContent = this.score;
    }

    // 計算場上剩餘豆子
    let remaining = 0;
    for (const row of this.grid) {
      for (const c of row) {
        if (c === "." || c === "o") remaining++;
      }
    }
    if (remaining === 0) {
      this.win = true;
      this.gameOver = true;
    }
  }

  /**
   * 玩家與鬼魂碰撞檢測
   */
  collisionCheck() {
    if (this.enemyManager.checkCollision(this.player)) {
      this.lives--;
      if (this.livesEl) {
        this.livesEl.textContent = this.lives;
      }
      if (this.lives <= 0) {
        this.gameOver = true;
      } else {
        this.resetPositions();
      }
    }
  }

  /**
   * 繪製迷宮地圖、牆壁與豆子
   */
  drawMaze() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const cell = this.grid[y][x];
        if (cell === "#") {
          this.ctx.fillStyle = "#101d9b";
          this.ctx.fillRect(x * TILE + 2, y * TILE + 2, TILE - 4, TILE - 4);
          this.ctx.strokeStyle = "#2d50ff";
          this.ctx.strokeRect(x * TILE + 4, y * TILE + 4, TILE - 8, TILE - 8);
        } else if (cell === "." || cell === "o") {
          this.ctx.fillStyle = "#ffe9a8";
          const r = cell === "o" ? 5 : 2.2;
          this.ctx.beginPath();
          this.ctx.arc(x * TILE + TILE / 2, y * TILE + TILE / 2, r, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }
  }

  /**
   * 繪製遊戲結束或獲勝覆蓋畫面
   */
  drawOverlay() {
    if (!this.gameOver) return;
    this.ctx.fillStyle = "rgba(0,0,0,.72)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = this.win ? "#ffd900" : "#fff";
    this.ctx.font = "bold 38px Arial";
    this.ctx.fillText(this.win ? "YOU WIN!" : "GAME OVER", this.canvas.width / 2, this.canvas.height / 2 - 20);
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "18px Arial";
    this.ctx.fillText("按「重新開始」再玩一次", this.canvas.width / 2, this.canvas.height / 2 + 25);
  }

  /**
   * 綜合繪製主渲染方法
   */
  draw() {
    this.drawMaze();
    this.player.draw(this.ctx, TILE);
    this.enemyManager.draw(this.ctx, TILE);
    this.drawOverlay();
  }

  /**
   * 遊戲核心循環更新
   * @param {number} time
   */
  update = (time) => {
    if (!this.lastTime) this.lastTime = time;
    this.accumulator += time - this.lastTime;
    this.lastTime = time;

    while (this.accumulator >= STEP && !this.gameOver) {
      this.player.animateMouth();
      this.player.update(this.isOpen, this.moveEntity);
      this.eat();

      this.ghostTick++;
      if (this.ghostTick % GHOST_MOVE_EVERY === 0) {
        this.enemyManager.update(this.player, this.isOpen, this.moveEntity);
        this.collisionCheck();
      }
      this.accumulator -= STEP;
    }

    this.draw();
    this.animationFrameId = requestAnimationFrame(this.update);
  };

  /**
   * 重新啟動遊戲狀態
   */
  restart() {
    this.grid = createInitialGrid();
    this.score = 0;
    this.lives = INITIAL_LIVES;
    this.gameOver = false;
    this.win = false;
    this.ghostTick = 0;
    this.accumulator = 0;
    this.lastTime = 0;

    if (this.scoreEl) {
      this.scoreEl.textContent = this.score;
    }
    if (this.livesEl) {
      this.livesEl.textContent = this.lives;
    }
    this.resetPositions();
  }

  /**
   * 綁定鍵盤控制與按鈕事件
   */
  bindEvents() {
    window.addEventListener("keydown", (e) => {
      const keys = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }
      };
      if (keys[e.key]) {
        e.preventDefault();
        this.player.setNextDirection(keys[e.key]);
      }
    });

    if (this.restartBtn) {
      this.restartBtn.addEventListener("click", () => this.restart());
    }
  }

  /**
   * 開始遊戲主循環
   */
  start() {
    this.restart();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.animationFrameId = requestAnimationFrame(this.update);
  }
}
