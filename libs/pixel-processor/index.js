/**
 * @typedef {{x: number, width: number, y: number, height: number}} Region
 */
class PixelProcessor {

    /**
     * Create a new region that fit inside the given canvas dimensions
     * @param width {number}
     * @param height {number}
     * @param region {Region}
     * @return {Region}
     */
    static fit(width, height, region) {
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
        return {
            x: xReg,
            y: yReg,
            width: wReg,
            height: hReg
        };
    }

    /**
     *
     * @param oCanvas {HTMLCanvasElement}
     * @param cb {function({
     *  width: number,
     *  height: number,
     *  x: number,
     *  y: number,
     *  color: {
     *      r: number,
     *      g: number,
     *      b: number,
     *      a: number
     *  },
     *  pixel: function(x: number, y: number)
     *  })} callback
     * @param region {Region}
     */
    static process(oCanvas, cb, region = undefined) {
        console.time('process-start');
        let ctx = oCanvas.getContext('2d');
        let oImageData = ctx.createImageData(oCanvas.width, oCanvas.height);
        let pixels = new Uint32Array(oImageData.data.buffer);
        let h = oCanvas.height;
        let w = oCanvas.width;
        if (region === undefined) {
            region = {x: 0, y: 0, width: w, height: h};
        }
        region = PixelProcessor.fit(w, h, region);
        let oPixelCtx = {
            pixel: (x, y) => {
                let nOffset = y * w + x;
                let p = pixels[nOffset];
                return {
                    r: p & 0xFF,
                    g: (p >> 8) & 0xFF,
                    b: (p >> 16) & 0xFF,
                    a: (p >> 24) & 0xFF
                };
            },
            width: w,
            height: h,
            x: 0,
            y: 0,
            color: {
                r: 0,
                g: 0,
                b: 0,
                a: 255
            }
        };
        let aColors = [];
        const pcolor = oPixelCtx.color;
        const {x: xReg, y: yReg, width: wReg, height: hReg} = PixelProcessor.fit(w, h, region);
        console.timeEnd('process-start');
        console.time('process-iter');
        for (let iy = 0; iy < hReg; ++iy) {
            const y = iy + yReg;
            for (let ix = 0; ix < wReg; ++ix) {
                const x = ix + xReg;
                let nOffset = y * w + x;
				let p = pixels[nOffset];
                oPixelCtx.x = x;
                oPixelCtx.y = y;
                pcolor.r = p && 0xFF;
                pcolor.g = (p >> 8) && 0xFF;
                pcolor.b = (p >> 16) && 0xFF;
                pcolor.a = (p >> 24) && 0xFF;
                cb(oPixelCtx);
                if (!oPixelCtx.color) {
                    throw new Error('pixelprocessor : callback destroyed the color');
                }
                aColors.push({
                    offset: nOffset,
                    r: pcolor.r,
                    g: pcolor.g,
                    b: pcolor.b,
                    a: pcolor.a
                });
                //aColors.push({offset: nOffset, color: {...oPixelCtx.color}});
            }
        }
        console.timeEnd('process-iter');
        console.time('process-fill');
        aColors.forEach(({offset, r, g, b, a}) => {
            pixels[offset] = r | (g << 8) | (b << 16) | (a << 24);
        });
        ctx.putImageData(oImageData, 0, 0);
        console.timeEnd('process-fill');
    }
}

export default PixelProcessor;