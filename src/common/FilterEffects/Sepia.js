function GreyScale(el){
  let canvas = document.createElement('canvas');
  let w = canvas.width = el.offsetWidth,
    h = canvas.height = el.offsetHeight;
  let ctx = canvas.getContext('2d');
  ctx.drawImage(el, 0, 0);

  // 对像素作处理
  let imgObjData = ctx.getImageData(0, 0, w, h);
  let imgData = imgObjData.data;
  for (let i = 0, len = d.length; i < len; i+=4){
    let red = imgData[i],
      green = imgData[i+1],
      blue = imgData[i+2];
    imgData[i] = imgData[i+1] = imgData[i+2] = (red + green + blue) / 3;
  }
  ctx.putImageData(imgObjData, 0, 0);

  // 导出
  let img = new Image();
  img.src = ctx.toDataURL("image/*");
  return img;
};
// let red = imgData[i],
//   green = imgData[i+1],
//   blue = imgData[i+2];
// imgData[i] = (red * 0.393)+(green * 0.769)+(blue * 0.189);
// imgData[i+1] = (red * 0.349)+(green * 0.686)+(blue * 0.168);
// imgData[i+2] = (red * 0.272)+(green * 0.534)+(blue * 0.131);
