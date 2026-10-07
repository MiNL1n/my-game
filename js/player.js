import { PACMAN_START_POS, TILE } from "./config.js";

/**
 * 玩家（吃豆人）控制與狀態類別
 */
export class Player {
  constructor() {
    this.reset();
  }

  /**
   * 重設吃豆人位置與方向
   */
  reset() {
    this.x = PACMAN_START_POS.x;
    this.y = PACMAN_START_POS.y;
    this.dir = { x: 0, y: 0 };
    this.next = { x: 0, y: 0 };
    this.mouth = 0;
  }

  /**
   * 設置玩家輸入的預備移動方向
   * @param {{x: number, y: number}} nextDir
   */
  setNextDirection(nextDir) {
    this.next = nextDir;
  }

  /**
   * 嘴巴張合動畫推進
   */
  animateMouth() {
    this.mouth += 0.5;
  }

  /**
   * 依據地圖可行路徑更新吃豆人位置
   * @param {function(number, number): boolean} isOpen
   * @param {function(object, object): boolean} moveEntity
   */
  update(isOpen, moveEntity) {
    if (this.next.x !== 0 || this.next.y !== 0) {
      if (isOpen(this.x + this.next.x, this.y + this.next.y)) {
        this.dir = { ...this.next };
      }
    }
    if (this.dir.x !== 0 || this.dir.y !== 0) {
      moveEntity(this, this.dir);
    }
  }

  /**
   * 繪製吃豆人
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} tile
   */
  draw(ctx, tile = TILE) {
    const cx = this.x * tile + tile / 2;
    const cy = this.y * tile + tile / 2;

    let angle = 0;
    if (this.dir.x < 0) {
      angle = Math.PI;
    } else if (this.dir.y < 0) {
      angle = -Math.PI / 2;
    } else if (this.dir.y > 0) {
      angle = Math.PI / 2;
    }

    const mouth = 0.22 + Math.abs(Math.sin(this.mouth)) * 0.22;
    ctx.fillStyle = "#ffd900";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, 8.5, angle + mouth, angle + Math.PI * 2 - mouth);
    ctx.closePath();
    ctx.fill();
  }
}
