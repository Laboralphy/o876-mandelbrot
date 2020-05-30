import CanvasHelper from "../libs/canvas-helper";
import PixelProcessor from "../libs/pixel-processor";
import * as Tools2D from "../libs/tools2d";


let CANVAS;

function checkIfBelongsToMandelbrotSet(x, y) {
    let realComponentOfResult = x;
    let imaginaryComponentOfResult = y;

    for (let i = 0; i < 100; ++i) {
        // Calculate the real and imaginary components of the result
        // separately
        let tempRealComponent = realComponentOfResult * realComponentOfResult
            - imaginaryComponentOfResult * imaginaryComponentOfResult
            + x;

        let tempImaginaryComponent = 2 * realComponentOfResult * imaginaryComponentOfResult
            + y;

        realComponentOfResult = tempRealComponent;
        imaginaryComponentOfResult = tempImaginaryComponent;
    }

    return realComponentOfResult * imaginaryComponentOfResult < 5;
}

function draw(pixels) {
    const magnificationFactor = 200;
    const panX = 2;
    const panY = 1.5;
    const height = pixels.length;
    const width = pixels[0].length;
    console.log('drawing');
    for (let x = 0; x < width; ++x) {
        for (let y = 0; y < height; ++y) {
            let belongsToSet =
                checkIfBelongsToMandelbrotSet(
                    x / magnificationFactor - panX,
                    y / magnificationFactor - panY
                );

            pixels[y][x] = belongsToSet ? 0 : 255;
        }
    }
    console.log('done');
}

function render(pixels, canvas) {
    PixelProcessor.process(canvas, function(pctx) {
        const mbColor = pixels[pctx.y][pctx.x];
        pctx.color.r = mbColor;
        pctx.color.g = mbColor >> 1;
        pctx.color.b = mbColor >> 2;
        pctx.color.a = 255;
    });
}

function go() {
    const pixels = Tools2D.createArray2D(600, 600, 0, Uint8Array);
    draw(pixels);
    render(pixels, CANVAS);
}



function main() {
    CANVAS = CanvasHelper.createCanvas(600, 600);
    document.body.appendChild(CANVAS);
    CANVAS.addEventListener('click', function(event) {

    })
}

window.addEventListener('load', main);
