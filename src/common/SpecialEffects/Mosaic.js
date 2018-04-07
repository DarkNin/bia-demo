// util vars
const TWO_PI = Math.PI * 2
const QUARTER_PI = Math.PI * 0.25

// utility functions
function isArray(obj) {
  return Object.prototype.toString.call(obj) === "[object Array]"
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]"
}

const console = window.console


function ClosePixelation(canvas, options) {
  //copy canvas
  this.canvas = document.createElement('canvas');
  this.canvas.width = canvas.width;
  this.canvas.height = canvas.height;
  this.ctx = this.canvas.getContext('2d');
  this.ctx.drawImage(canvas, 0, 0);

  return this.render(options).catch((err) => {
    console.log(err);

  })


}

ClosePixelation.prototype.render = function (options) {
  return new Promise((resolve, reject) => {

    this.options = options;
    // set size
    let w = this.width = this.canvas.width;
    let h = this.height = this.canvas.height;
    // get imageData

    try {
      this.imgData = this.ctx.getImageData(0, 0, w, h).data;
    } catch (error) {
      if (console) {
        reject(error);
      }
      return;
    }

    this.ctx.clearRect(0, 0, w, h);

    for (let i = 0, len = options.length; i < len; i++) {
      this.renderClosePixels(options[i]);
    }
    resolve(this.canvas);
  })

}

ClosePixelation.prototype.renderClosePixels = function (opts) {
  let w = this.width
  let h = this.height
  let ctx = this.ctx
  let imgData = this.imgData

  // option defaults
  let res = opts.resolution || 16
  let size = opts.size || res
  let alpha = opts.alpha || 1
  let offset = opts.offset || 0
  let offsetX = 0
  let offsetY = 0
  let cols = w / res + 1
  let rows = h / res + 1
  let halfSize = size / 2
  let diamondSize = size / Math.SQRT2
  let halfDiamondSize = diamondSize / 2

  if (isObject(offset)) {
    offsetX = offset.x || 0
    offsetY = offset.y || 0
  } else if (isArray(offset)) {
    offsetX = offset[0] || 0
    offsetY = offset[1] || 0
  } else {
    offsetX = offsetY = offset
  }

  let row, col, x, y, pixelY, pixelX, pixelIndex, red, green, blue, pixelAlpha;

  for (row = 0; row < rows; row++) {
    y = (row - 0.5) * res + offsetY
    // normalize y so shapes around edges get color
    pixelY = Math.max(Math.min(y, h - 1), 0)

    for (col = 0; col < cols; col++) {
      x = (col - 0.5) * res + offsetX
      // normalize y so shapes around edges get color
      pixelX = Math.max(Math.min(x, w - 1), 0)
      pixelIndex = (pixelX + pixelY * w) * 4
      red = imgData[pixelIndex + 0]
      green = imgData[pixelIndex + 1]
      blue = imgData[pixelIndex + 2]
      pixelAlpha = alpha * (imgData[pixelIndex + 3] / 255)

      ctx.fillStyle = 'rgba(' + red + ',' + green + ',' + blue + ',' + pixelAlpha + ')'

      switch (opts.shape) {
        case 'circle' :
          ctx.beginPath()
          ctx.arc(x, y, halfSize, 0, TWO_PI, true)
          ctx.fill()
          ctx.closePath()
          break
        case 'diamond' :
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(QUARTER_PI)
          ctx.fillRect(-halfDiamondSize, -halfDiamondSize, diamondSize, diamondSize)
          ctx.restore()
          break
        default :
          // square
          ctx.fillRect(x - halfSize, y - halfSize, size, size)
      } // switch
    } // col
  } // row

}


export default function Mosaic(obj, opt) {
  return new ClosePixelation(obj, opt)
}
