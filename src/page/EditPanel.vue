<template>
  <transition name="fade" @after-enter="afterEnter">
    <div class="edit-panel">
      <loading v-show="isLoading"/>

      <div class="corner-back">
        <a @click="closePanel">
          <icon name="back" scale="2.5" style="color:#00ccaa"/>
        </a>
      </div>
      <div class="edit-canvas-container" id="edit-canvas-container">
        <img v-bind:src="imgDetails.url" @load="imgHandler" style="display: none;">
        <img v-bind:src="afterHandleImg" id="edit-img" @load="canvasSizeCalc" v-show="!handleState">
        <canvas class="canvas-container" id="edit-canvas" :width="canvasSize.width"
                :height="canvasSize.height"></canvas>
      </div>
      <div class="tools-bar">

        <div class="pen-bar">
          <a @click="togglePen">
            <icon :name="penIcon" scale="10"/>
          </a>
        </div>
        <div class="clear-btn">
          <!--<button v-on:click="clear">清除</button>-->
          <a @click="clear">
            <icon name="pen_clear" scale="10"/>
          </a>
        </div>
        <div class="save-btn">
          <!--<button v-on:click.once="save">保存</button>-->
          <a @click.once="save">
            <icon name="pen_save" scale="10"/>
          </a>
        </div>
      </div>

    </div>
  </transition>
</template>

<script>
  import Lodash from 'lodash'
  import Bus from '../common/Bus'
  import Loading from '@/components/Loading'

  const preHandler = function (e) {
    e.preventDefault();
  };

  class Draw {
    constructor(el) {
      this.operationStack = [];
      this.el = el;
      this.canvas = document.getElementById(this.el);
      this.ctx = this.canvas.getContext('2d');
      this.stage_info = this.canvas.getBoundingClientRect();
      this.penColor = "#fff";
      this.path = {
        beginX: 0,
        beginY: 0,
        endX: 0,
        endY: 0
      }
    }

    init(btn) {
      console.log('init')
      let _this = this;
      this.canvas.addEventListener('touchstart', function (event) {
        document.addEventListener('touchstart', preHandler, {passive: false});
        _this.drawBegin(event)
      });
      this.canvas.addEventListener('touchend', function (event) {
        document.addEventListener('touchend', preHandler, {passive: false});
        _this.drawEnd()

      });
      this.clear(btn)
    }

    drawBegin(e) {
      let _this = this;
      window.getSelection() ? window.getSelection().removeAllRanges() : document.selection.empty()
      let penWidth = 0.8 * 18;
      this.ctx.strokeStyle = this.penColor;
      this.ctx.lineWidth = penWidth;
      this.ctx.lineCap = "round";
      this.ctx.beginPath();
      this.ctx.moveTo(
        e.changedTouches[0].clientX - this.stage_info.left,
        e.changedTouches[0].clientY - this.stage_info.top
      );
      this.path.beginX = e.changedTouches[0].clientX - this.stage_info.left
      this.path.beginY = e.changedTouches[0].clientY - this.stage_info.top
      this.canvas.addEventListener("touchmove", function () {
        _this.drawing(event)
      })
    }

    drawing(e) {
      this.ctx.lineTo(
        e.changedTouches[0].clientX - this.stage_info.left,
        e.changedTouches[0].clientY - this.stage_info.top
      );
      this.path.endX = e.changedTouches[0].clientX - this.stage_info.left;
      this.path.endY = e.changedTouches[0].clientY - this.stage_info.top;
      this.ctx.stroke()
    }

    drawEnd() {
      document.removeEventListener('touchstart', preHandler, false);
      document.removeEventListener('touchend', preHandler, false);
      document.removeEventListener('touchmove', preHandler, false);
      this.operationStack.push("drawn");
      //canvas.ontouchmove = canvas.ontouchend = null
    }

    clear(btn) {
      this.ctx.clearRect(0, 0, 10000, 10000);
      this.operationStack = [];
    }

    changeColor(color) {
      this.penColor = color;
    }

    save() {
      return this.canvas.toDataURL("image/png")
    }


  }

  export default {
    components: {Loading},
    data() {
      return {
        editCanvas: {},
        imgDetails: {
          url: '',
          orientation: ''

        },
        canvasSize: {
          width: 300,
          height: 600

        },
        imgSize: {
          width: 300,
          height: 600
        },
        draw: {},
        penStatus: "front",
        penIcon: "frontpen",
        coverImg: "",
        shownImg: "",
        isLoading: false,
        handleState: false,
        afterHandleImg: ''
      }
    },
    props: ['panelState'],
    created() {
      this.imgDetails = this.$route.query.imgDetails;
    },
    mounted() {
      let _this = this;
      window.onresize = Lodash.debounce(function () {
        _this.canvasSizeCalc();
      }, 400)
    },
    updated: function () {

    },
    watch: {},
    methods: {
      afterEnter: function (el) {
        this.initCanvas();
      },
      initCanvas: function () {
        this.draw = new Draw('edit-canvas');
        this.draw.init();
        this.canvasSizeCalc()
      },
      canvasSizeCalc: function () {
        let editImg = document.getElementById("edit-img");
        this.canvasSize.width = editImg.offsetWidth;
        this.canvasSize.height = editImg.offsetHeight;
      },
      closePanel: function () {
        this.$router.go(-1)
      },
      togglePen: function () {
        this.penStatus = (this.penStatus === "front") ? "back" : "front";
        if (this.penStatus === "front") {
          this.penIcon = "frontpen";
          this.draw.changeColor("#fff");
        } else if (this.penStatus === "back") {
          this.penIcon = "backpen";
          this.draw.changeColor("#000");
        }
      },
      clear: function () {
        this.draw.clear();
      },
      save: function () {
        this.isLoading = true;
        let _this = this;
        let data = this.draw.save();
        let coverData = new Image();
        coverData.src = data;
        coverData.onload = function () {
          let srcImg = document.getElementById("edit-img");
          _this.coverImg = _this.createCover(srcImg, coverData);
          if (_this.draw.operationStack.length === 0) {
            _this.shownImg = _this.compressImg(srcImg);
            Bus.$emit('shownImg', _this.shownImg);
          }
        };

      },

      createCover: function (src, cover) {
        let offscreenCanvas = document.createElement("Canvas");
        offscreenCanvas.width = src.naturalWidth;
        offscreenCanvas.height = src.naturalHeight;
        let canvasCtx = offscreenCanvas.getContext("2d");
        canvasCtx.fillStyle = "#00FF00";
        canvasCtx.fillRect(0, 0, src.naturalWidth, src.naturalHeight);
        canvasCtx.drawImage(cover, 0, 0, src.naturalWidth, src.naturalHeight);
        //this.imgDetails.testUrl = offscreenCanvas.toDataURL("img/jpeg");
        return offscreenCanvas.toDataURL("img/png");
      },

      compressImg: function (src) {
        if (src.naturalWidth > 1000 || src.naturalHeight > 1000) {
          let compressCanvas = document.createElement("Canvas");
          compressCanvas.width = 1000;
          compressCanvas.height = 1000 / src.naturalWidth * src.naturalHeight;
          let canvasCtx = compressCanvas.getContext("2d");
          canvasCtx.drawImage(src, 0, 0, compressCanvas.width, compressCanvas.height)
          return compressCanvas.toDataURL("img/jpeg", 0.5);
        } else {
          return src.src;
        }
      },
      imgHandler: function (e) {
        let ori = this.imgDetails.orientation;
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        if (ori === 6 || ori === 8 || ori === 3) {
          switch (ori) {
            case 6: //需左旋转90°
              canvas.width = e.target.naturalHeight;
              canvas.height = e.target.naturalWidth;
              ctx.rotate(0.5 * Math.PI)
              ctx.drawImage(e.target, 0, -e.target.naturalHeight);
              this.afterHandleImg = canvas.toDataURL();
              console.log('case: 1')
              break;
            case 8: //需右旋转90°
              canvas.width = e.target.naturalHeight;
              canvas.height = e.target.naturalWidth;
              ctx.rotate(-0.5 * Math.PI)
              ctx.drawImage(e.target, -e.target.naturalWidth, 0);
              this.afterHandleImg = canvas.toDataURL();
              console.log('case: 2')
              break;
            case 3: //颠倒
              canvas.width = e.target.naturalHeight;
              canvas.height = e.target.naturalWidth;
              ctx.rotate(Math.PI)
              ctx.drawImage(e.target, -e.target.naturalWidth, -e.target.naturalHeight);
              this.afterHandleImg = canvas.toDataURL();
              console.log('case: 3')
              break;


          }
        } else {
          this.afterHandleImg = this.imgDetails.url;
          this.handleState = false;
          console.log('case: 0')
        }
        document.getElementById('edit-img').onload = () => {
          this.canvasSizeCalc();
          Bus.$emit('stopLoading');
        }
      },
      rotateImg: function () {

      }
    }
  }
</script>

<style scoped>
  .fade-enter-active, .fade-leave-active {
    transform: translate3d(0, 0, 0);
    left: 0;
  }

  .fade-enter, .fade-leave-to {
    transform: translate3d(0, 0, 0);
    left: -100%;
  }

  .edit-panel {
    position: absolute;
    top: 0;
    z-index: 9999;
    width: 100%;
    height: 100%;
    background: #fff;
    transition: all 0.2s linear;
  }

  .corner-back {
    position: absolute;
    left: 0;
    top: 0;
    width: 6rem;
    height: 3.5rem;
  }

  .corner-back a {
    display: inline-block;
  }

  .corner-back a svg {
    padding: 1rem;
  }

  .edit-canvas-container {
    margin: 4rem 2rem 0 2rem;
    height: 70%;
    position: relative;
    text-align: center;
    overflow: hidden;
  }

  .edit-canvas-container canvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10001;
  }

  .edit-canvas-container img {
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 10000;
  }

  .tools-bar {
    display: flex;
    align-items: center;
    position: absolute;
    height: 3.5rem;
    width: 100%;
    bottom: 0;
    border-top: 1px solid #e5e5e5;
  }

  .tools-bar div {
    display: flex;
    justify-content: center;
    width: 33.33%;
  }

  .pen-bar {
  }

  .pen-bar a {
  }
</style>
