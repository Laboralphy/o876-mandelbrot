import CanvasHelper from "../libs/canvas-helper";
import PixelProcessor from "../libs/pixel-processor";
import Mandelbrot from "../libs/mandelbrot";

let CANVAS;

function buildPalette() {
    const palette = [];
    for (let i = 0; i < 256; ++i) {
        palette.push({
            r: i,
            g: 0,
            b: 0
        });
    }
    return palette;
}

function render(canvas, mandel, palette) {
    console.time('mandelbrot');
    mandel.compute();
    const pixels = mandel.pixels;
    PixelProcessor.process(canvas, function(pctx) {
        const mbColor = palette[pixels[pctx.y][pctx.x]];
        pctx.color.r = mbColor.r;
        pctx.color.g = mbColor.g;
        pctx.color.b = mbColor.b;
        pctx.color.a = 255;
    }, mandel.region);
    console.timeEnd('mandelbrot');
    console.log('x', mandel.x, 'y', mandel.y, 'zoom', mandel.zoom, 'iter', mandel.iterations);
}

function main() {
    const palette = buildPalette();
    CANVAS = CanvasHelper.createCanvas(600, 400);
    const mb = new Mandelbrot();
    mb.zoom = 200;
    mb.iterations = 100;
    mb.x = 0;
    mb.y = 0;
    mb.width = CANVAS.width;
    mb.height = CANVAS.height;
    mb.region = {x: 0, y: 0, width: CANVAS.width, height:CANVAS.height};

    function go() {
        render(CANVAS, mb, palette);
    }

    go();

    window.addEventListener('keydown', event => {
        switch (event.key) {
            case 'ArrowUp':
                mb.y += mb.height / (mb.zoom * 10);
                go();
                break;

            case 'ArrowDown':
                mb.y -= mb.height / (mb.zoom * 10);
                go();
                break;

            case 'ArrowLeft':
                mb.x += mb.width / (mb.zoom * 10);
                go();
                break;

            case 'ArrowRight':
                mb.x -= mb.width / (mb.zoom * 10);
                go();
                break;

            case 'a':
                mb.zoom *= 1.5;
                go();
                break;

            case 'z':
                mb.zoom /= 1.5;
                go();
                break;

            case 'e':
                mb.iterations *= 1.5;
                go();
                break;

            case 'r':
                mb.iterations /= 1.5;
                go();
                break;
        }
    });

    document.body.appendChild(CANVAS);
    CANVAS.addEventListener('click', function(event) {

    });
}

window.addEventListener('load', main);
