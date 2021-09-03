var video;
var canvas;
var canvas2;
var checkBox;
var kernel;
var convolve;

var mirrored;

window.onload = function () {
  mirrored = false;
  video = document.getElementById("video");
  canvas = document.getElementById("canvas");
  canvas2 = document.getElementById("canvas2");
  checkBox = document.getElementById("mirrorCheck");

  var options = {
    audio: false,
    video: {
      width: 512, height: 512
    }
  };

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(options).then(function (stream) {
      video.srcObject = stream;
      loadCanvas();
      processImage();
    }).catch(function (err) {
      alert("An error ocurred");
    })
  }

  kernel = [1, -1, 1,
    0, 0, 0,
    1, -1, -1];
};

function changed() {
  if (checkBox.checked) {
    mirrored = true;
  } else {
    mirrored = false;
  }
}

function loadCanvas() {
  var ctx = canvas.getContext("2d");

  ctx.drawImage(video, 0, 0, 512, 512);

  var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.putImageData(imgData, 0, 0);

  setTimeout(loadCanvas, 10);
}

function processImage() {
  var ctx = canvas2.getContext("2d");

  if (mirrored) {
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, -512, 512);
  } else {
    ctx.drawImage(video, 0, 0, 512, 512);
  }

  var w = 512;
  var h = 512;

  var dctx = canvas2.getContext("2d");
  var dstImageData = dctx.getImageData(0, 0, 512, 512);
  var dst = dstImageData.data;

  var side = Math.round(Math.sqrt(kernel.length));
  var halfSide = Math.floor(side / 2);
  var srcImageData = ctx.getImageData(0, 0, w, h);
  var src = srcImageData.data;
  var sw = w;
  var sh = h;

  for (var y = 1; y < h - 1; y++) {
    for (var x = 1; x < w - 1; x++) {

      var sy = y;
      var sx = x;
      var dstOff = (y * w + x) * 4;
   
      var r = 0, g = 0, b = 0, a = 0;
      for (var cy = 0; cy < side; cy++) {
        for (var cx = 0; cx < side; cx++) {

          var scy = sy + cy - halfSide;
          var scx = sx + cx - halfSide;
          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
            var srcOff = (scy * sw + scx) * 4;
            var wt = kernel[cy * side + cx];
            r += src[srcOff] * wt;
            g += src[srcOff + 1] * wt;
            b += src[srcOff + 2] * wt;
            a += src[srcOff + 3];
          }
        }
      }


      dst[dstOff] = r;
      dst[dstOff + 1] = g;
      dst[dstOff + 2] = b;
      dst[dstOff + 3] = 255;

    }
  }


  dctx.putImageData(dstImageData, 0, 0);

  setTimeout(processImage, 10);
}
