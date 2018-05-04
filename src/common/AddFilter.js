function AddFilter(canvas, options) {
  this.canvas = document.createElement('canvas');
  this.canvas.width = canvas.width;
  this.canvas.height = canvas.height;
  this.ctx = this.canvas.getContext('2d');
  this.ctx.drawImage(canvas, 0, 0);

  return this.render(options).catch((err) => {
    console.log(err);

  })
}

AddFilter.prototype.render = function (options) {
  return new Promise((resolve, reject) => {
    let ctx = this.canvas.getContext('2d');

    let imgData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    let pixelData = imgData.data;
    switch (options) {
      case 'grey':
        for (let i = 0, len = pixelData.length; i < len; i += 4) {
          let red = pixelData[i],
            green = pixelData[i + 1],
            blue = pixelData[i + 2];
          pixelData[i] = pixelData[i + 1] = pixelData[i + 2] = 0.3 * red + 0.59 * green + 0.11 * blue;
        }
        ctx.putImageData(imgData, 0, 0);

        resolve(this.canvas);
        break;
      case 'sepia':

        for (let i = 0, len = pixelData.length; i < len; i += 4) {
          let red = pixelData[i],
            green = pixelData[i + 1],
            blue = pixelData[i + 2];
          pixelData[i] = (red * 0.393) + (green * 0.769) + (blue * 0.189);
          pixelData[i + 1] = (red * 0.349) + (green * 0.686) + (blue * 0.168);
          pixelData[i + 2] = (red * 0.272) + (green * 0.534) + (blue * 0.131);
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(this.canvas);
        break;
      default:
        resolve(this.canvas);
    }
  })

};

export default function Filter(canvas, options) {
  return new AddFilter(canvas, options)
}
