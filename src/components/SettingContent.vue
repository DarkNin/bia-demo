<template>
  <div class="setting-content" :style="contentStyle">
    <loading v-show="isLoading"/>
    <router-view/>

    <div id="bia-production-head">
      <p>{{wow}}</p>
    </div>
    <div class="video-container">
      <transition name="fade">
        <video id="video" width="720" height="1280" class="video-style" autoplay v-show="videoState">
        </video>
      </transition>
    </div>
    <div id="center-canvas-container" :style="canvasContainer">
      <div class="canvas-container">
        <canvas class="lower-canvas" :class="{shaking: isShake}" id="lower-canvas" :width="innerCanvasSize.width"
                :height="innerCanvasSize.height"></canvas>
        <canvas class="upper-canvas" :class="{shaking: isShake}" id="upper-canvas" :width="innerCanvasSize.width"
                :height="innerCanvasSize.height"></canvas>
      </div>
    </div>
    <div class="tools-bar" v-if="upperCanvasState">
      <transition name="fade">
        <div class="tools-item-filter" v-if="filterPanelState">
          <div class="tools-item" v-for="filter in filterLib">
            <a @click="setFilter(filter.name)" style="margin-top: 1rem">
              <icon name="image" scale="5"></icon>
            </a>
            <span>{{filter.msg}}</span>
          </div>
        </div>
        <div class="tools-item-clip" v-if="clipPanelState">
          <div class="tools-item" v-for="clip in clipLib">
            <a @click="setClipStyle(clip.name)">
              <icon :name="'clip_' + clip.name" scale="14"></icon>
            </a>
            <span>{{clip.msg}}</span>
          </div>
        </div>
        <div class="tools-item-effect" v-if="effectPanelState">
          <div class="tools-item" v-for="effect in effectsLib">
            <a @click="setEffect(effect.name)">
              <icon :name="effect.name" scale="14"></icon>
            </a>
            <span>{{effect.msg}}</span>
          </div>
        </div>
        <div class="tools-control" v-if="!effectPanelState && !clipPanelState && !filterPanelState">
          <a @click="resetAll">
            <icon name="restore" scale="3.2"></icon>
          </a>
        </div>
      </transition>
      <div class="tools-content">
        <a @click="toggleFilterPanel">
          <icon name="coloricon" scale="2.4"></icon>
        </a>
        <a @click="toggleClipPanel">
          <icon name="clip" scale="4.8"></icon>
        </a>
        <a @click="toggleEffectPanel">
          <icon name="biaicon" scale="2.4"></icon>
        </a>

      </div>
    </div>
    <div class="setting-bottom">
      <div id="upload-group">
        <label for="capture-upload">
          <icon name="camera" scale="10"/>
          <span>上传图片</span>
        </label>
        <input id="capture-upload" style="display: none;" type="file" capture="camera"
               accept="image/jpeg,image/jpg,image/png" name="file"
               @change="upload">
      </div>
      <div id="bia-group" v-if="upperCanvasState">
        <a @click="createCamera">
          <icon name="AR" scale="4.2"/>
          <span>wow!</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
  import Lodash from 'lodash'
  import EXIF from 'exif-js'
  import Bus from '../common/Bus'
  import Filter from '../common/AddFilter'
  import {Mosaic} from '../common/AddEffect'
  import StackBlur from 'stackblur-canvas'
  import Loading from '../components/Loading'

  export default {
    name: "setting-content",
    components: {
      Loading
    },
    data() {
      return {

        //本页面样式数据
        contentStyle: {
          height: '16px' //模块高度
        },
        canvasContainer: {
          //width: '16px',
          height: '16px' //canvas高度
        },

        //canvas宽高
        innerCanvasSize: {
          height: 0,
          width: 0
        },

        //所添加img的宽高及偏移
        imgWidth: 0,
        imgHeight: 0,
        imgOffsetX: 0,
        imgOffsetY: 0,

        //canvas声明
        upperCanvas: {},
        copyUpperCanvas: {},

        //叠加层canvas是否有内容
        upperCanvasState: false,

        panelState: false,

        //所添加img的信息
        imgDetails: {
          url: '',
          orientation: ''
        },

        //底图
        clothesImg: './static/img/clothes.png',
        shownImg: "",
        constShownImg: "",
        isLoading: false,
        filterLib: [{name: 'none', msg: '原图'}, {name: 'grey', msg: '黑白照'}, {name: 'sepia', msg: '旧照片'}],
        effectsLib: [{name: 'none', msg: '清除效果'}, {name: 'mosaic', msg: '马赛克化'}, {name: 'blur', msg: '毛玻璃'}],
        clipLib: [{name: 'default', msg: '默认裁剪'},
          {name: 'circle', msg: '圆形裁剪'},
          {name: 'star', msg: '星形裁剪'},
          {name: 'unregularCircle', msg: '喷溅式'}
        ],
        filterPanelState: false,
        effectPanelState: false,
        clipPanelState: false,
        filterNow: 'none',
        effectNow: 'none',
        clipStyle: 'default',


        isShake: false,
        SHAKE_RATE: 150,
        last_update: 0,
        last_catch: 0,
        accelerateAttr: {
          x: 0,
          y: 0,
          z: 0,
          last_x: 0,
          last_y: 0,
          last_z: 0
        },
        suck: 0,
        videoObj: {
          'video': {width: {min: 240}, height: {min: 320}, facingMode: 'environment'}
        },
        videoState: false,
        streamStack: {}
      }
    },
    mounted: function () {
      const _this = this;
      this.upperCanvas = document.getElementById('upper-canvas');
      let lowerCanvas = document.getElementById('lower-canvas');
      let lowerCtx = lowerCanvas.getContext('2d');
      this.contentHeightCalc();
      this.canvasContainerHeightCalc().then(
        () => {
          let clothesImg = new Image();
          clothesImg.src = this.clothesImg;
          clothesImg.onload = function () {
            lowerCtx.drawImage(clothesImg, 0, 0, lowerCanvas.width, lowerCanvas.height);

          };
        }
      );
      window.onresize = Lodash.debounce(function () {
        _this.contentHeightCalc();
        _this.canvasContainerHeightCalc().then(
          () => {
            let clothesImg = new Image();
            clothesImg.src = _this.clothesImg;
            clothesImg.onload = function () {
              let lowerCanvas = document.getElementById('lower-canvas');
              let lowerCtx = lowerCanvas.getContext('2d');
              lowerCtx.drawImage(clothesImg, 0, 0, lowerCanvas.width, lowerCanvas.height);
            };
          }
        );
      }, 400);
      Bus.$on('shownImg', function (val) {
        _this.constShownImg = val;
        _this.shownImg = val;
        let thisCtx = _this.upperCanvas.getContext('2d');
        thisCtx.clearRect(0, 0, 10000, 10000);
        /*        let materialImg = new Image();
                materialImg.src = _this.shownImg;
                materialImg.onload = () => {
                  let thisCtx = _this.upperCanvas.getContext('2d');
                  thisCtx.clearRect(0, 0, 10000, 10000);
                  let scale = materialImg.width / materialImg.height;
                  let imgWidth = _this.imgWidth = _this.upperCanvas.width * 0.36;
                  let imgHeight = _this.imgHeight = imgWidth / scale;
                  _this.imgOffsetX = (_this.upperCanvas.width - imgWidth) * 0.5;
                  _this.imgOffsetY = (_this.upperCanvas.height - imgHeight) * 0.5;
                  thisCtx.drawImage(materialImg, _this.imgOffsetX, _this.imgOffsetY, _this.imgWidth, _this.imgHeight);
                  _this.upperCanvasState = true;*/
        _this.renderImg(_this.shownImg).then(
          () => {
            //copy canvas
            _this.copyUpperCanvas = document.createElement('canvas');
            _this.copyUpperCanvas.width = _this.upperCanvas.width;
            _this.copyUpperCanvas.height = _this.upperCanvas.height;
            _this.copyUpperCanvas.getContext('2d').drawImage(_this.upperCanvas, 0, 0)
          });
        _this.$router.go(-1);


        //}
      })
        .$on('stopLoading', function () {
          _this.isLoading = false;
        });
      if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', function (e) {
          if (_this.effectNow !== 'none') {
            _this.deviceMotionHandler(e);
          }
        }, false)
      }

    },
    watch: {},
    methods: {
      contentHeightCalc: function () {
        this.contentStyle.height = (document.body.clientHeight / 18 - 6) + "rem";
        Bus.$emit('trans', this.contentStyle.height)
      },
      canvasContainerHeightCalc: function () {
        return new Promise((resolve) => {
          this.canvasContainer.height = document.getElementById('center-canvas-container').offsetWidth * 650 / 605 + "px"; //hack
          this.innerCanvasSize.height = 1290;//parseInt(this.canvasContainer.height);
          this.innerCanvasSize.width = 1200;//document.getElementById('center-canvas-container').offsetWidth;
          resolve();
        })
      },

      checkExif: function (data) {
        let _this = this;
        return new Promise(resolve => {
          EXIF.getData(data, () => {
            let orientation = EXIF.getTag(data, 'Orientation');
            resolve(orientation);
          });
        })

      },
      upload: function (e) {
        this.isLoading = true;
        let _this = this;
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
          let thisReader = this;
          _this.checkExif(file).then((arg) => {
            console.log('exif:' + arg)
            _this.imgDetails.orientation = arg;
            _this.imgDetails.url = thisReader.result;
            _this.$router.push({path: '/edit', query: {imgDetails: _this.imgDetails}}, function () {
              e.target.value = '';
            })
          })

        };
        let date = new Date();
        let type = file.name.split('.');
        let tokenParam = {
          //'putPolicy':'{\"name\":\"$(fname)\",\"size\":\"$(fsize)\",\"w\":\"$(imageInfo.width)\",\"h\":\"$(imageInfo.height)\",\"hash\":\"$(etag)\"}',
          //'key':'orderReview/'+date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate()+'/'+date.valueOf()+'.'+type[type.length-1],
          'scope': 'bia-demo'
        };
        let param = new FormData(); //创建form对象
        param.append('file', file);//通过append向form对象添加数据
        param.append('key', 'biaker/' + date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.valueOf() + '.' + type[type.length - 1]);
        //param.append('chunk', '0');//添加form表单中其他数据

        let config = {
          headers: {'Content-Type': 'multipart/form-data'}
        };  //添加请求头
        // this.$axios.post('/api', qs.stringify(tokenParam))
        //   .then(response => {
        //     this.token = response.data.token;
        //     param.append('token', this.token);
        //     _this.uploadTo(param, config)
        //
        //   })
      },
      uploadTo: function (param, config) {
        this.$axios.post('http://upload-z2.qiniup.com/', param, config)
          .then(response => {
            console.log(response.data);
          })
      },

      renderImg: function (img) {
        return new Promise((resolve) => {
          let materialImg = new Image();
          materialImg.src = img;
          materialImg.onload = () => {
            let thisCtx = this.upperCanvas.getContext('2d');
            let scale = materialImg.width / materialImg.height;
            let imgWidth = this.imgWidth = this.upperCanvas.width * 0.36;
            let imgHeight = this.imgHeight = imgWidth / scale;
            this.imgOffsetX = (this.upperCanvas.width - imgWidth) * 0.5;
            this.imgOffsetY = (this.upperCanvas.height - imgHeight) * 0.5;
            thisCtx.drawImage(materialImg, this.imgOffsetX, this.imgOffsetY, this.imgWidth, this.imgHeight);
            this.upperCanvasState = true;
            resolve();
          }
        });

      },
      toggleEffectPanel: function () {
        this.effectPanelState = !this.effectPanelState;
        this.clipPanelState = false;
        this.filterPanelState = false;
      },
      toggleFilterPanel: function () {
        this.filterPanelState = !this.filterPanelState;
        this.clipPanelState = false;
        this.effectPanelState = false;
      },
      toggleClipPanel: function () {
        this.clipPanelState = !this.clipPanelState;
        this.effectPanelState = false;
        this.filterPanelState = false;
      },
      setFilter: function (style, canvas) {
        return new Promise((resolve) => {
          let thisCanvas = canvas || this.copyUpperCanvas;
          if (this.upperCanvasState) {
            this.filterNow = style;
            Filter(thisCanvas, style).then((arg) => {
              console.log(thisCanvas)
              this.upperCanvas.getContext('2d').clearRect(0, 0, 10000, 10000);
              this.upperCanvas.getContext('2d').drawImage(arg, 0, 0);
              resolve();
            });
            if (this.filterPanelState) {
              this.toggleFilterPanel();
            }
          }

        })

      },
      setClipStyle: function (shape) {
        this.upperCanvas.width = this.upperCanvas.width;
        this.clipStyle = shape;
        this.clipCanvas(shape);
        this.renderImg(this.shownImg).then(() => {

          this.setFilter(this.filterNow);
        });
        if (this.clipPanelState) {
          this.toggleClipPanel();
        }
      },
      setMosaic: function (opt) {
        this.resetCanvas().then(() => {
          this.setFilter(this.filterNow).then(() => {

            Mosaic(this.upperCanvas)
              .then((arg) => {
                this.upperCanvas.getContext('2d').clearRect(0, 0, 10000, 10000);
                this.clipCanvas(this.clipStyle);
                this.upperCanvas.getContext('2d').drawImage(arg, 0, 0);
              })
          });
        })
      },
      setBlur: function (opt) {
        this.setFilter(this.filterNow, this.upperCanvas).then(() => {
          StackBlur.canvasRGBA(this.upperCanvas, 0, 0, this.innerCanvasSize.width, this.innerCanvasSize.height, 10)
        })
      },

      resetCanvas: function () {
        return new Promise((resolve) => {
          this.upperCanvas.getContext('2d').clearRect(0, 0, 10000, 10000);
          this.upperCanvas.getContext('2d').drawImage(this.copyUpperCanvas, 0, 0);
          resolve();
        })
      },
      resetAll: function () {
        this.upperCanvas.width = this.upperCanvas.width;
        this.filterNow = 'none';
        this.effectNow = 'none';
        this.clipStyle = 'default';
        this.renderImg(this.constShownImg);
      },


      setEffect: function (opt) {
        if (this.upperCanvasState) {
          this.effectNow = opt;
          switch (opt) {
            case 'mosaic':
              this.setMosaic();
              break;
            case 'blur':
              this.setBlur();
              break;
            default:
              this.resetCanvas().then(() => {
                this.setFilter(this.filterNow);
              });
          }
        }
        if (this.effectPanelState) {
          this.toggleEffectPanel();
        }
      },

      clipCanvas: function (shape) {
        let thisCtx = this.upperCanvas.getContext('2d');
        thisCtx.strokeStyle = 'rgba(0,0,0,0)';
        thisCtx.fillStyle = 'rgba(0,0,0,0)';
        switch (shape) {
          case 'circle':
            thisCtx.beginPath();
            thisCtx.arc(this.imgOffsetX + 0.5 * this.imgWidth,
              this.imgOffsetY + 0.5 * this.imgHeight,
              0.5 * ((this.imgWidth < this.imgHeight) ? this.imgWidth : this.imgHeight),
              0, Math.PI * 2);
            thisCtx.fill();
            thisCtx.clip();
            break;
          case 'star':
            thisCtx.beginPath();
            for (let i = 0; i < 5; i++) {
              thisCtx.lineTo(Math.cos((18 + i * 72) / 180 * Math.PI) * (0.5 * this.imgWidth)
                + this.imgOffsetX + (0.5 * this.imgWidth),
                -Math.sin((18 + i * 72) / 180 * Math.PI) * (0.5 * this.imgWidth)
                + this.imgOffsetY + (0.5 * this.imgWidth));
              thisCtx.lineTo(Math.cos((54 + i * 72) / 180 * Math.PI) * (0.5 * 0.5 * this.imgWidth)
                + this.imgOffsetX + (0.5 * this.imgWidth),
                -Math.sin((54 + i * 72) / 180 * Math.PI) * (0.5 * 0.5 * this.imgWidth)
                + this.imgOffsetY + (0.5 * this.imgWidth));

            }
            thisCtx.closePath();
            thisCtx.fill();
            thisCtx.clip();
            break;
          case 'unregularCircle':
            let points = 512; //多边形边的总数目
            let rad, theta;
            let twoPi = 2 * Math.PI;
            let x0, y0;
            let minRad = 0.8 * 0.5 * this.imgWidth;
            let maxRad = 0.5 * this.imgWidth;

            thisCtx.beginPath();
            theta = 0;
            x0 = this.imgOffsetX + 0.5 * this.imgWidth + rad * Math.cos(theta);
            y0 = this.imgOffsetY + 0.5 * this.imgWidth + rad * Math.sin(theta);
            thisCtx.lineTo(x0, y0);
            for (let i = 0; i < points; i++) {
              theta += twoPi / points;
              rad = minRad + Math.random() * (maxRad - minRad); //随机半径
              x0 = this.imgOffsetX + 0.5 * this.imgWidth + rad * Math.cos(theta);
              y0 = this.imgOffsetY + 0.5 * this.imgWidth + rad * Math.sin(theta);
              thisCtx.lineTo(x0, y0);
            }
            thisCtx.fill();
            thisCtx.clip();
            break;
          default:
            thisCtx.beginPath();
            thisCtx.rect(this.imgOffsetX, this.imgOffsetY, this.imgWidth, this.imgHeight);
            thisCtx.fill();
            thisCtx.clip();
        }

      },
      deviceMotionHandler: function (e) {
        let acceleration = e.accelerationIncludingGravity;
        let curTime = new Date().getTime();
        let _this = this;

        if ((curTime - this.last_update) > 500) {
          let diffTime = curTime - this.last_update;
          this.last_update = curTime;
          let x = this.accelerateAttr.x = acceleration.x;
          let y = this.accelerateAttr.y = acceleration.y;
          let z = this.accelerateAttr.z = acceleration.z;
          let speed = Math.abs(x + y + z - this.last_x - this.last_y - this.last_z) / diffTime * 10000;

          if (speed > this.SHAKE_RATE) {
            if ((curTime - this.last_catch) > 800) {
              this.isShake = true;
              this.last_catch = curTime;
              setTimeout(function () {
                _this.isShake = false;
                _this.suck++;
                _this.setEffect(_this.effectNow);
              }, 400)

            }
          }


        }
        this.last_x = this.accelerateAttr.x;
        this.last_y = this.accelerateAttr.y;
        this.last_z = this.accelerateAttr.z;
      },
      createCamera: function () {
        if (navigator.mediaDevices.getUserMedia && this.videoState === false) {
          navigator.mediaDevices.getUserMedia(this.videoObj)
            .then((stream) => {
              video.srcObject = stream;
              this.streamStack = stream.getTracks()[0];
              video.play();
              this.videoState = true;
            }).catch((err) => {
            console.log('video error:' + err)
          })
        } else if (this.videoState === true) {
          video.pause();
          this.streamStack.stop();
          this.videoState = false;

        } else {
          alert('您的浏览器不支持此功能')
        }
      }
    }
  }
</script>

<style scoped>

  #bia-production-head {
    height: 3.125rem;
    position: relative;
    width: 100%;
    background-color: white;
    color: #00ccaa;
    line-height: 3.125rem;
    text-align: center;
    vertical-align: center;
  }

  .setting-content {
    height: 100%;
    background-color: #f0f2f5;
    z-index: 97
  }

  #center-canvas-container {
    margin: 0.8rem 3rem 0 3rem;
    position: relative;
    text-align: center;
    overflow: hidden;
    z-index: 200;
  }

  .canvas-container {
    width: 100%;
    height: 100%;
  }

  .shaking {
    animation: shake 0.4s ease-out;
  }

  .canvas-container canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .tools-item-effect, .tools-item-clip, .tools-item-filter {
    width: 60%;
    /*height: 10rem;*/
    color: #00ccaa;
    background-color: #fff;
    border: 1px solid #00ccaa;
    border-radius: 1rem;
    padding: 0.2rem 0.625rem 0.2rem;
    margin-bottom: 0.25rem;

    display: flex;
    flex-wrap: wrap;
    /*align-items: center;*/
    justify-content: space-around;
  }

  .tools-item {
    width: 28%;
    border: 1px solid #00ccaa;
    border-radius: 0.5rem;
    margin: 0.625rem 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .tools-item span {
    font-size: 0.625rem;
    margin-bottom: 0.125rem;
  }

  .tools-bar {
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 8888;
    bottom: 6.125rem;
    width: 100%;
  }

  .tools-control {
    margin-left: 55%;
    right: 0;
    height: 2.125rem;
    width: 2.125rem;
    margin-bottom: 10px;
    color: #00ccaa;
    background-color: #fff;
    border: 1px solid #00ccaa;
    border-radius: 50%;

    justify-content: center;
    display: flex;
    align-items: center;
  }

  .tools-bar .tools-content {
    height: 2.125rem;
    line-height: 2.125rem;
    padding: 0.2rem 0.625rem 0;
    width: 60%;
    color: #00ccaa;
    background-color: #fff;
    border: 1px solid #00ccaa;
    border-radius: 1rem;
  }

  .tools-content {
    display: flex;
    align-items: baseline;
    justify-content: space-around;
  }

  .setting-bottom {
    position: absolute;
    bottom: 0;
    z-index: 200;
    height: 3.5rem;
    width: 100%;
    border-top: 1px solid #e5e5e5;
    display: flex;
    align-items: center;
    justify-content: space-around;
    flex-direction: row;
    background-color: #fff;
  }

  #upload-group, #figure-group {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  #upload-group label {
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  #upload-group span {
    margin-top: -5px;
    display: block;
    font-size: 0.5rem;
    color: #999999;
  }

  #bia-group a, #figure-group a {
    display: flex;
    align-items: center;
    flex-direction: column;
    text-decoration: none;
  }

  #bia-group span, #figure-group span {
    display: block;
    font-size: 0.5rem;
    color: #999999;
  }

  .video-container {

    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    z-index: 100;
    display: flex;
    justify-content: center;
  }

  .video-style {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .fade-enter-active, .fade-leave-active {
    transform: translate3d(0, 0, 0);
    transition: all 0.1s linear;
    opacity: 1;
  }

  .fade-enter, .fade-leave-to {
    transition: all 0.1s linear;
    opacity: 0;
  }

  @keyframes shake {
    0% {
      margin-left: 0;
      margin-top: 0;
    }
    12.5% {
      margin-left: -25px;
      margin-top: 15px;
    }
    25% {
      margin-left: 0;
      margin-top: -15px;
    }
    50% {
      margin-left: -15px;
      margin-top: 0;
    }
    75% {
      margin-left: 15px;
      margin-top: 10px;
    }
    100% {
      margin-left: 0;
      margin-top: 0;
    }
  }
</style>
