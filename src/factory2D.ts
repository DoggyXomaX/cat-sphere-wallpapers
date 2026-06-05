import { RENDER_SIZE } from "./defaults";

let canvas: HTMLCanvasElement;

export const create2DCanvas = () => {
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.className = "canvas2D";
    document.body.appendChild(canvas);
  }

  onResize2D();
};

export const onResize2D = () => {
  const aspect = window.innerWidth / window.innerHeight;
  let width = RENDER_SIZE;
  let height = RENDER_SIZE / aspect;
  if (aspect < 1) {
    width = RENDER_SIZE * aspect;
    height = RENDER_SIZE;
  }

  canvas.width = width;
  canvas.height = height;
};
