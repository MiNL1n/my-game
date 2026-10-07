export const CANVAS_WIDTH = 560;
export const CANVAS_HEIGHT = 620;
export const TILE = 20;

// 地圖定義：# = 牆壁, . = 普通豆, o = 能量豆, 空白 = 通道
export const MAP = [
  "############################",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o####.#####.##.#####.####o#",
  "#.####.#####.##.#####.####.#",
  "#..........................#",
  "#.####.##.########.##.####.#",
  "#......##....##....##......#",
  "######.##### ## #####.######",
  "     #.##### ## #####.#     ",
  "     #.##          ##.#     ",
  "######.## ###--### ##.######",
  "     #.   #      #   .#     ",
  "     #.## #      # ##.#     ",
  "######.## ######## ##.######",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o..##................##..o#",
  "###.##.##.########.##.##.###",
  "#......##....##....##......#",
  "#.##########.##.##########.#",
  "#..........................#",
  "############################"
];

export const COLS = 28;
export const ROWS = MAP.length;

// 時間步長與移動頻率設定 (毫秒)
export const STEP = 115;
export const GHOST_MOVE_EVERY = 2;

// 遊戲初始數值
export const INITIAL_LIVES = 3;
export const SCORE_DOT = 10;
export const SCORE_POWER = 50;

// 吃豆人初始設定
export const PACMAN_START_POS = {
  x: 13,
  y: 17
};

// 鬼魂初始設定與外觀
export const GHOST_CONFIGS = [
  { x: 13, y: 12, color: "#ff3b3b", name: "Blinky" },
  { x: 14, y: 12, color: "#ff9de2", name: "Pinky" },
  { x: 12, y: 12, color: "#38e8ff", name: "Inky" },
  { x: 15, y: 12, color: "#ff9d32", name: "Clyde" }
];

/**
 * 依據地圖設定生成初始二維字元陣列
 */
export function createInitialGrid() {
  return MAP.map(row => row.padEnd(COLS, " ").slice(0, COLS).split(""));
}
