import CanvasHelper from "../libs/canvas-helper";
import PixelProcessor from "../libs/pixel-processor";
import * as Tools2D from "../libs/tools2d";


let CANVAS;

class Mandelbrot {
    constructor() {
        this._canvas = null;
        this._pixels = null;
        this._maxIterations = 100;
        this._magnificationFactor = 200;
        this._xPan = 2;
        this._yPan = 1.5;
        this._palette = [];
        for (let i = 0; i < 256; ++i) {
            this._palette.push({
                r: i,
                g: 0,
                b: 0
            });
        }
    }

    get width () {
        return this._canvas.width;
    }

    get height () {
        return this._canvas.height;
    }

    get iterations() {
        return this._maxIterations;
    }

    set iterations(value) {
        this._maxIterations = parseInt(value);
    }

    get zoom() {
        return this._magnificationFactor;
    }

    set zoom(value) {
        this._magnificationFactor = value;
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

    get canvas () {
        return this._canvas;
    }

    set canvas (value) {
        this._canvas = value;
        this._pixels = Tools2D.createArray2D(value.width, value.height, 0, Uint8Array);
    }

    checkIfBelongsToMandelbrotSet(x, y) {
        let realComponentOfResult = x;
        let imaginaryComponentOfResult = y;

        const nMax = this._maxIterations;
        for (let i = 0; i < nMax; ++i) {
            // Calculate the real and imaginary components of the result
            // separately
            let tempRealComponent = realComponentOfResult * realComponentOfResult
                - imaginaryComponentOfResult * imaginaryComponentOfResult
                + x;

            let tempImaginaryComponent = 2 * realComponentOfResult * imaginaryComponentOfResult
                + y;

            realComponentOfResult = tempRealComponent;
            imaginaryComponentOfResult = tempImaginaryComponent;
            if (realComponentOfResult * imaginaryComponentOfResult > 5) {
                return i / nMax * 255;
            }
        }
        return 0;
    }

    compute() {
        const pixels = this._pixels;
        const magnificationFactor = this._magnificationFactor;
        const panX = this._xPan;
        const panY = this._yPan;
        const height = this.height;
        const width = this.width;
        for (let y = 0; y < height; ++y) {
            const yf = (y - height / 2) / magnificationFactor - panY;
            for (let x = 0; x < width; ++x) {
                const xf = (x - width / 2) / magnificationFactor - panX;
                pixels[y][x] = this.checkIfBelongsToMandelbrotSet(xf, yf) | 0;
            }
        }
    }

    render() {
        const pixels = this._pixels;
        const w = this.width;
        const h = this.height;
        const w2 = w >> 1;
        const wl = w2 - (w2 >> 1);
        const wh = w2 + (w2 >> 1);
        const h2 = h >> 1;
        const hl = h2 - (h2 >> 1);
        const hh = h2 + (h2 >> 1);
        const pal = this._palette;
        PixelProcessor.process(this._canvas, function(pctx) {
            const x = pctx.x;
            const y = pctx.y;
            if (x > wl && x < wh & y > hl && y < hh && (x === w2 || y === h2)) {
                pctx.color.r = 255;
                pctx.color.g = 255;
                pctx.color.b = 255;
            } else {
                const mbColor = pal[pixels[pctx.y][pctx.x]];
                if (mbColor === undefined) throw new Error('color undefined ' + pixels[pctx.y][pctx.x])
                pctx.color.r = mbColor.r;
                pctx.color.g = mbColor.g;
                pctx.color.b = mbColor.b;
            }
            pctx.color.a = 255;
        });
    }
}



function main() {
    CANVAS = CanvasHelper.createCanvas(400, 400);
    const mb = new Mandelbrot();
    mb.zoom = 200;
    mb.iterations = 100;
    mb.x = 0;
    mb.y = 0;
    mb.canvas = CANVAS;

    function go() {
        console.log('x', mb.x, 'y', mb.y, 'zoom', mb.zoom);
        mb.compute();
        mb.render();
    }

    go();

    window.addEventListener('keydown', event => {
        const z = event.shiftKey ? 10000 : 1000;
        switch (event.key) {
            case 'ArrowUp':
                mb.y -= mb.height / (mb.zoom * 10);
                go();
                break;

            case 'ArrowDown':
                mb.y += mb.height / (mb.zoom * 10);
                go();
                break;

            case 'ArrowLeft':
                mb.x -= mb.width / (mb.zoom * 10);
                go();
                break;

            case 'ArrowRight':
                mb.x += mb.width / (mb.zoom * 10);
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
