function BlurConstructor(canvas) {
  this.canvas = document.createElement('canvas');
  this.canvas.width = canvas.width;
  this.canvas.height = canvas.height;
  this.ctx = this.canvas.getContext('2d');
  this.ctx.drawImage(canvas, 0, 0);

  return this.render().catch((err) => {
    console.log(err);
  })
}

BlurConstructor.prototype.render = function () {
  return new Promise((resolve) => {
    // let blurRadius = 3;
    // let totalNum = (2 * blurRadius + 1) * (2 * blurRadius + 1);
    //
    // let w = this.width = this.canvas.width;
    // let h = this.height = this.canvas.height;
    // let tmpImgData = this.ctx.getImageData(0, 0, w, h);
    // let tmpPixelData = tmpImgData.data;
    // let imgData = this.ctx.getImageData(0, 0, w, h);
    // let pixelData = imgData.data;
    //
    // for (let i = blurRadius; i < w - blurRadius; i++) {
    //   for (let j = blurRadius; j < w - blurRadius; j++) {
    //     let red = 0, green = 0, blue = 0;
    //     for (let dx = -blurRadius; dx <= blurRadius; dx++) {
    //       for (let dy = -blurRadius; dy <= blurRadius; dy++) {
    //         let x = j + dx;
    //         let y = j + dy;
    //
    //         let p = x * w + y;
    //         red += tmpPixelData[p * 4];
    //         green += tmpPixelData[p * 4 + 1];
    //         blue += tmpPixelData[p * 4 + 2];
    //       }
    //
    //     }
    //
    //     let p = i * w + j;
    //     pixelData[p * 4]= red / totalNum;
    //     pixelData[p * 4 + 1] = green / totalNum;
    //     pixelData[p * 4 + 2] = blue / totalNum;
    //   }
    // }
    // this.ctx.putImageData(imgData, 0, 0);

    var tmpImageData = this.ctx.getImageData( 0 , 0 , this.canvas.width , this.canvas.height )
    var tmpPixelData = tmpImageData.data

    var imageData = this.ctx.getImageData( 0 , 0 , this.canvas.width , this.canvas.height )
    var pixelData = imageData.data

    var blurR = 30
    var totalnum = (2*blurR + 1)*(2*blurR + 1)

    for( var i = blurR ; i < this.canvas.height - blurR ; i ++ )
      for( var j = blurR ; j < this.canvas.width - blurR ; j ++ ){

        var totalr = 0 , totalg = 0 , totalb = 0
        for( var dx = -blurR ; dx <= blurR ; dx ++ )
          for( var dy = -blurR ; dy <= blurR ; dy ++ ){

            var x = i + dx
            var y = j + dy

            var p = x*this.canvas.width + y
            totalr += tmpPixelData[p*4+0]
            totalg += tmpPixelData[p*4+1]
            totalb += tmpPixelData[p*4+2]
          }

        var p = i*this.canvas.width + j
        pixelData[p*4+0] = totalr / totalnum
        pixelData[p*4+1] = totalg / totalnum
        pixelData[p*4+2] = totalb / totalnum
      }

    this.ctx.putImageData( imageData , 0 , 0 , 0 , 0 , this.canvas.width , this.canvas.height )
    resolve(this.canvas);

  })
};

export default function Blur(canvas) {
  return new BlurConstructor(canvas);
}
