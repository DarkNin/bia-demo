<template>
  <transition name="fade">
    <div class="figure-panel">
      <!--<div class="figure-title">-->
      <!--<p>请选择图案</p>-->
      <!--</div>-->
      <!--<div class="figure-group">-->
      <!--<div class="figure-items" v-for="n in figureGroup">-->
      <!--<p>{{n}}</p>-->
      <!--</div>-->
      <!--</div>-->
      <img src="/static/img/rabbit.bmp" id="picture" :class="{shake: isShake}">
      <div><p>{{suck}}</p></div>
      <div><p>{{info.speed}}</p></div>
      <div><p>{{accelerateAttr.x}}</p></div>
      <div><p>{{accelerateAttr.y}}</p></div>
      <div><p>{{accelerateAttr.z}}</p></div>


    </div>
  </transition>
</template>

<script>
  //import Mosaic from '../common/SpecialEffects/Mosaic.js'
  import Lodash from 'lodash'

  export default {
    data() {
      return {
        figureGroup: [{
          "name": "triangle"
        }, {
          "name": "square"
        }],
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
        info: {
          speed: 0
        },
        suck: 0
      }
    },
    mounted: function () {
      if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', this.deviceMotionHandler, false)
      }


    },
    methods: {
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
          let speed = this.info.speed = Math.abs(x + y + z - this.last_x - this.last_y - this.last_z) / diffTime * 10000;

          if (speed > this.SHAKE_RATE) {
            if ((curTime - this.last_catch) > 800) {
              this.isShake = true;
              this.last_catch = curTime;
              setTimeout(function () {
                _this.suck ++;
                _this.isShake = false;
              }, 400)

            }
          }


        }
        this.last_x = this.accelerateAttr.x;
        this.last_y = this.accelerateAttr.y;
        this.last_z = this.accelerateAttr.z;
      },
      handleShakingMotion: function () {
        return new Promise((resolve) => {
          setTimeout(function () {
            resolve();
          }, 400);
        })
      }
    },


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

  .figure-panel {
    position: absolute;
    top: 0;
    z-index: 9999;
    width: 100%;
    height: 100%;
    background: #fff;
    transition: all 0.2s linear;
    /*display: flex;*/
    /*align-items: center;*/
    /*justify-content: center;*/
  }

  .figure-panel .shake {
    animation: shake 0.4s ease-out;
  }

  .figure-title {
    text-align: center;
    color: #00ccaa;
    line-height: 3rem;
    font-size: 3rem;
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
