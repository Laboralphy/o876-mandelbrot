import CanvasHelper from "../libs/canvas-helper";
import PixelProcessor from "../libs/pixel-processor";
import * as Tools2D from "../libs/tools2d";
import {create, all} from 'mathjs'

const config = {
    number: 'BigNumber',
    precision: 64
};
const math = create(all, config);

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

    num(x) {
        return math.bignumber(x);
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
        this._magnificationFactor = this.num(value);
    }

    get x() {
        return this._xPan;
    }

    set x(value) {
        this._xPan = this.num(value);
    }

    get y() {
        return this._yPan;
    }

    set y(value) {
        this._yPan = this.num(value);
    }

    get canvas () {
        return this._canvas;
    }

    set canvas (value) {
        this._canvas = value;
        this._pixels = Tools2D.createArray2D(value.width, value.height, 0, Uint8Array);
    }

    checkIfBelongsToMandelbrotSet(x, y) {
        let rcRes = x;
        let icRes = y;
        const bn2 = this.num(2);
        const bn5 = this.num(5);

        const nMax = this._maxIterations;
        for (let i = 0; i < nMax; ++i) {
            // Calculate the real and imaginary components of the result
            // separately

            let rcRes2 = math.square(rcRes);
            let icRes2 = math.square(icRes);

            // let rcTmp = rcRes * rcRes - icRes * icRes + x;
            let rcTmp = math.add(math.subtract(rcRes2, icRes2), x);

            // let icTmp = 2 * rcRes * icRes + y;
            let icTmp = math.add(math.multiply(bn2, rcRes, icRes), y);

            rcRes = rcTmp;
            icRes = icTmp;
            if (math.number(math.multiply(rcRes, icRes)) > 5) {
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
        const h2 = math.divide(this.num(height), this.num(2));
        const w2 = math.divide(this.num(width), this.num(2));
        for (let y = 0; y < height; ++y) {
            console.log(y)
            const bny = this.num(y);
            const yf = math.subtract(
                math.divide(
                    math.subtract(bny, h2),
                    magnificationFactor
                ), panY
            );
            // (y - height / 2) / magnificationFactor - panY;
            for (let x = 0; x < width; ++x) {
                const bnx = this.num(x);
                const xf = math.subtract(
                    math.divide(
                        math.subtract(bnx, w2),
                        magnificationFactor
                    ), panX
                );
                // const xf = (x - width / 2) / magnificationFactor - panX;
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
    const CANVAS = CanvasHelper.createCanvas(400, 400);
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
