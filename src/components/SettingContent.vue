<template>
  <div class="setting-content" :style="contentStyle">
    <loading v-show="isLoading"/>
    <router-view/>
    <div id="bia-production-head">
      <p>bia-production-head</p>
    </div>
    <div id="center-canvas-container" :style="canvasContainer">
      <div class="canvas-container">
        <canvas class="lower-canvas" id="lower-canvas" :width="innerCanvasSize.width"
                :height="innerCanvasSize.height"></canvas>
        <canvas class="upper-canvas" id="upper-canvas" :width="innerCanvasSize.width"
                :height="innerCanvasSize.height"></canvas>
      </div>
    </div>

    <div class="tools-bar">
      <div class="tools-item" style="display: none;">
        <!--<div class="selected-item"></div>-->

      </div>
      <div class="tools-content">
        <a @click="setMosaic">
          <icon name="coloricon" scale="2.4"></icon>
        </a>
        <a>
          <icon name="biaicon" scale="2.4"></icon>
        </a>

      </div>

    </div>
    <div class="setting-bottom">
      <div id="upload-group">
        <label for="capture-upload">
          <icon name="camera" scale="4"/>
          <span>上传图片</span>
        </label>
        <input id="capture-upload" style="display: none;" type="file" capture="camera"
               accept="image/jpeg,image/jpg,image/png" name="file"
               @change="upload">

      </div>
      <div id="figure-group">
        <router-link to="figure">
          <icon name="figureicon" scale="3.2"/>
          <span>使用图形</span>
        </router-link>
        <!--<a>-->
        <!--<icon name="figureicon" scale="3.2"/>-->
        <!--<span>使用图形</span>-->
        <!--</a>-->
      </div>
      <div id="bia-group" v-if="upperCanvasState">
        <a @click="">
          <icon name="biaicon" scale="3.2"/>
          <span>加点特技</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
  import Lodash from 'lodash'
  import Bus from '../common/Bus'
  import qs from 'querystring'
  import Mosaic from '../common/SpecialEffects/Mosaic'
  import Loading from '@/components/Loading'

  export default {
    name: "setting-content",
    components: {
      Loading
    },
    data() {
      return {
        contentStyle: {
          height: '16px'
        },
        canvasContainer: {
          //width: '16px',
          height: '16px'
        },
        innerCanvasSize: {
          height: 0,
          width: 0
        },
        upperCanvas: {},
        copyUpperCanvas: {},
        upperCanvasState: false,
        panelState: false,
        imgDetails: {
          url: ''
        },
        clothesImg: './static/img/clothes.png',
        shownImg: "",
        isLoading: false
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
        _this.shownImg = val;
        let materialImg = new Image();
        materialImg.src = _this.shownImg;
        materialImg.onload = () => {
          let thisCtx = _this.upperCanvas.getContext('2d');
          thisCtx.clearRect(0, 0, 10000, 10000);
          let scale = materialImg.width / materialImg.height;
          let imgWidth = _this.upperCanvas.width * 0.36;
          let imgHeight = imgWidth / scale;
          thisCtx.drawImage(materialImg, (_this.upperCanvas.width - imgWidth) * 0.5, (_this.upperCanvas.height - imgHeight) * 0.5, imgWidth, imgHeight);
          _this.upperCanvasState = true;
          _this.$router.go(-1);

          //copy canvas
          _this.copyUpperCanvas = document.createElement('canvas');
          _this.copyUpperCanvas.width = _this.upperCanvas.width;
          _this.copyUpperCanvas.height = _this.upperCanvas.height;
          _this.copyUpperCanvas.getContext('2d').drawImage(_this.upperCanvas, 0, 0)
        }
      })
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
          this.innerCanvasSize.height = parseInt(this.canvasContainer.height);
          this.innerCanvasSize.width = document.getElementById('center-canvas-container').offsetWidth;
          resolve();
        })
      },

      upload: function (e) {
        this.isLoading = true;
        console.log(e);
        let _this = this;
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
          let base64Url = this.result;
          _this.imgDetails.url = base64Url;
          _this.$router.push({path: '/edit', query: {imgDetails: _this.imgDetails}}, function () {
            e.target.value = '';
            _this.isLoading = false;
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
        param.append('key', 'biaker/' + date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.valueOf() + '.' + type[type.length - 1])
        //param.append('chunk', '0');//添加form表单中其他数据

        let config = {
          headers: {'Content-Type': 'multipart/form-data'}
        };  //添加请求头
        this.$axios.post('/api', qs.stringify(tokenParam))
          .then(response => {
            this.token = response.data.token;
            param.append('token', this.token);
            _this.uploadTo(param, config)

          })
      },
      uploadTo: function (param, config) {
        this.$axios.post('http://upload-z2.qiniup.com/', param, config)
          .then(response => {
            console.log(response.data);
          })
      },

      setMosaic: function () {

        this.resetCanvas().then(() => {
          Mosaic(this.copyUpperCanvas, [{
            shape: 'diamond',
            resolution: 12,
            size: 8,
            offset: 12,
            alpha: 0.5
          }])
            .then((arg) => {
              console.log(arg);
              this.upperCanvas.getContext('2d').clearRect(0, 0, 10000, 10000);
              this.upperCanvas.getContext('2d').drawImage(arg, 0, 0)
            })
        })
      },

      resetCanvas: function () {
        return new Promise((resolve) => {
          this.upperCanvas.getContext('2d').clearRect(0, 0, 10000, 10000);
          this.upperCanvas.getContext('2d').drawImage(this.copyUpperCanvas, 0, 0);
          resolve();
        })
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
  }

  .canvas-container canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .tools-item {
    width: 60%;
    height: 10rem;
    color: #00ccaa;
    background-color: #fff;
    border: 1px solid #00ccaa;
    border-radius: 1rem;
    padding: 0.2rem 0.625rem 0.2rem;
    margin-bottom: 0.25rem;
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
    z-index: 100;
    height: 3.5rem;
    width: 100%;
    border-top: 1px solid #e5e5e5;
    display: flex;
    align-items: center;
    justify-content: space-around;
    flex-direction: row;
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
    color: #00ccaa;
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
    color: #00ccaa;
  }
</style>
