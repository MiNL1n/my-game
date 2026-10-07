import { GHOST_CONFIGS, TILE } from "./config.js";

/**
 * 單一鬼魂（敵方角色）類別
 */
export class Ghost {
  constructor(config, index) {
    this.startX = config.x;
    this.startY = config.y;
    this.color = config.color;
    this.name = config.name;
    this.index = index;
    this.reset();
  }

  /**
   * 重設鬼魂至初始位置與巡邏方向
   */
  reset() {
    this.x = this.startX;
    this.y = this.startY;
    this.dir = this.index % 2 ? { x: -1, y: 0 } : { x: 1, y: 0 };
  }

  /**
   * 取得鬼魂當前周圍所有可通行的方向
   * @param {function(number, number): boolean} isOpen
   * @returns {Array<{x: number, y: number}>}
   */
  getValidDirections(isOpen) {
    const directions = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ];
    return directions.filter(d => isOpen(this.x + d.x, this.y + d.y));
  }

  /**
   * 鬼魂 AI 轉向決策：多數時間朝吃豆人接近，偶爾隨機轉向增加變數
   * @param {{x: number, y: number}} pac
   * @param {function(number, number): boolean} isOpen
   */
  chooseDirection(pac, isOpen) {
    const dirs = this.getValidDirections(isOpen);
    if (!dirs.length) return;

    // 避免立刻掉頭，除非沒有其他路可走
    const reverse = { x: -this.dir.x, y: -this.dir.y };
    let choices = dirs.filter(d => !(d.x === reverse.x && d.y === reverse.y));
    if (!choices.length) choices = dirs;

    // 簡單 AI：約 78% 機率朝吃豆人曼哈頓距離最近的方向移動，其餘隨機
    if (Math.random() < 0.78) {
      choices.sort((a, b) => {
        const da = Math.abs((this.x + a.x) - pac.x) + Math.abs((this.y + a.y) - pac.y);
        const db = Math.abs((this.x + b.x) - pac.x) + Math.abs((this.y + b.y) - pac.y);
        return da - db;
      });
      this.dir = choices[0];
    } else {
      this.dir = choices[Math.floor(Math.random() * choices.length)];
    }
  }

  /**
   * 鬼魂移動邏輯（於路口或撞牆時重新選路）
   * @param {{x: number, y: number}} pac
   * @param {function(number, number): boolean} isOpen
   * @param {function(object, object): boolean} moveEntity
   */
  update(pac, isOpen, moveEntity) {
    const validDirs = this.getValidDirections(isOpen);
    const atIntersection = validDirs.length >= 3 || !isOpen(this.x + this.dir.x, this.y + this.dir.y);
    if (atIntersection) {
      this.chooseDirection(pac, isOpen);
    }
    moveEntity(this, this.dir);
  }

  /**
   * 繪製鬼魂造型與眼睛
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} tile
   */
  draw(ctx, tile = TILE) {
    const cx = this.x * tile + tile / 2;
    const cy = this.y * tile + tile / 2;

    // 身體與下擺裙褶
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(cx, cy - 1, 8, Math.PI, 0);
    ctx.lineTo(cx + 8, cy + 8);
    ctx.lineTo(cx + 4, cy + 5);
    ctx.lineTo(cx, cy + 8);
    ctx.lineTo(cx - 4, cy + 5);
    ctx.lineTo(cx - 8, cy + 8);
    ctx.closePath();
    ctx.fill();

    // 眼白
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 2, 2.6, 0, Math.PI * 2);
    ctx.arc(cx + 3, cy - 2, 2.6, 0, Math.PI * 2);
    ctx.fill();

    // 眼珠（深藍色）
    ctx.fillStyle = "#1734a8";
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 2, 1.2, 0, Math.PI * 2);
    ctx.arc(cx + 3, cy - 2, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * 敵方管理者：負責生成、更新與碰撞檢測所有鬼魂
 */
export class EnemyManager {
  constructor() {
    this.ghosts = GHOST_CONFIGS.map((cfg, i) => new Ghost(cfg, i));
  }

  /**
   * 重設所有鬼魂
   */
  reset() {
    this.ghosts.forEach(g => g.reset());
  }

  /**
   * 批次更新所有鬼魂
   * @param {{x: number, y: number}} pac
   * @param {function(number, number): boolean} isOpen
   * @param {function(object, object): boolean} moveEntity
   */
  update(pac, isOpen, moveEntity) {
    this.ghosts.forEach(g => g.update(pac, isOpen, moveEntity));
  }

  /**
   * 檢測是否有任何鬼魂與玩家碰撞
   * @param {{x: number, y: number}} pac
   * @returns {boolean}
   */
  checkCollision(pac) {
    return this.ghosts.some(g => g.x === pac.x && g.y === pac.y);
  }

  /**
   * 繪製所有鬼魂
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} tile
   */
  draw(ctx, tile = TILE) {
    this.ghosts.forEach(g => g.draw(ctx, tile));
  }
}
