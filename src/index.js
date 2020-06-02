import CanvasHelper from "../libs/canvas-helper";
import PixelProcessor from "../libs/pixel-processor";
import * as Tools2D from "../libs/tools2d";


let CANVAS;

class Mandelbrot {
    constructor() {
        this._pixels = [];
        this._iterationCount = 100;
        this._zoom = 200;
        this._xPan = 2;
        this._yPan = 1.5;
        this._width = 0;
        this._height = 0;
        this._region = {x: 0, y: 0, width: 0, height: 0};
    }

    get pixels() {
        return this._pixels;
    }

    get width () {
        return this._width;
    }

    get height () {
        return this._height;
    }

    set width(value) {
        this._width = value;
    }

    set height(value) {
        this._height = value;
    }

    get iterations() {
        return this._iterationCount;
    }

    set iterations(value) {
        this._iterationCount = parseInt(value);
    }

    get zoom() {
        return this._zoom;
    }

    set zoom(value) {
        this._zoom = value;
    }

    set region({x, y, width, height}) {
        if (x < 0) {
            width += x;
            x = 0;
        }
        if ((x + width) > this._width) {
            width = this._width - x;
        }
        if (y < 0) {
            height += y;
            y = 0;
        }
        if ((x + width) > this._width) {
            width = this._width - x;
        }
        this._pixels = Tools2D.createArray2D(width, height, 0, Uint8Array);
        this._region.x = x;
        this._region.y = y;
        this._region.width = width;
        this._region.height = height;
    }

    get region() {
        return this._region;
    }

    get x() {
        return this._xPan;
    }

    set x(value) {
        this._xPan = value;
    }

    get y() {
        return this._yPan;
    }

    set y(value) {
        this._yPan = value;
    }

    mandelbrotFunc(x, y) {
        let rcResult = x;
        let icResult = y;
        const nMax = this._iterationCount;
        for (let i = 0; i < nMax; ++i) {
            let rcTmp = rcResult * rcResult - icResult * icResult + x;
            let icTmp = 2 * rcResult * icResult + y;
            rcResult = rcTmp;
            icResult = icTmp;
            if (rcResult * icResult > 5) {
                return i / nMax * 255;
            }
        }
        return 0;
    }

    compute() {
        const pixels = this._pixels;
        const zoom = this._zoom;
        const panX = this._xPan;
        const panY = this._yPan;
        const height = this.height;
        const width = this.width;
        const h2 = height / 2;
        const w2 = width / 2;
        const region = this._region;
        let xReg = region.x;
        let wReg = region.width;
        let yReg = region.y;
        let hReg = region.height;
        if (xReg < 0) {
            wReg += xReg;
            xReg = 0;
        }
        if ((xReg + wReg) > width) {
            wReg = width - xReg;
        }
        if (yReg < 0) {
            hReg += yReg;
            yReg = 0;
        }
        if ((xReg + wReg) > width) {
            wReg = width - xReg;
        }
        for (let y = 0; y < hReg; ++y) {
            const yf = (yReg + y - h2) / zoom - panY;
            for (let x = 0; x < wReg; ++x) {
                const xf = (xReg + x - w2) / zoom - panX;
                pixels[y][x] = this.mandelbrotFunc(xf, yf) | 0;
            }
        }
    }
}

function renderPixels(canvas, region, pixels, palette) {
    PixelProcessor.process(canvas, function(pctx) {
        const mbColor = palette[pixels[pctx.y][pctx.x]];
        pctx.color.r = mbColor.r;
        pctx.color.g = mbColor.g;
        pctx.color.b = mbColor.b;
        pctx.color.a = 255;
    });
}


function main() {
    const palette = [];
    for (let i = 0; i < 256; ++i) {
        palette.push({
            r: i,
            g: 0,
            b: 0
        });
    }
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
        console.time('mandelbrot');
        mb.compute();
        // mb.compute();
        renderPixels(CANVAS, mb.region, mb.pixels, palette);
        console.timeEnd('mandelbrot');
        console.log('x', mb.x, 'y', mb.y, 'zoom', mb.zoom, 'iter', mb.iterations);
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
