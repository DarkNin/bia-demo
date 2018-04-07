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
      <img src="/static/img/rabbit.bmp" id="picture" @load="setMosaic">

    </div>
  </transition>
</template>

<script>
  import Mosaic from '../common/SpecialEffects/Mosaic.js'
  export default {
    data() {
      return {
        figureGroup: [{
          "name": "triangle"
        }, {
          "name": "square"
        }]
      }
    },
    mounted: function () {


    },
    methods: {
      setMosaic: function (e) {
        Mosaic(e.target, [ { shape : 'circle', resolution : 24, size: 16, offset: 12, alpha: 0.5 } ])
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

  .figure-panel {
    position: absolute;
    top: 0;
    z-index: 9999;
    width: 100%;
    height: 100%;
    background: #fff;
    transition: all 0.2s linear;
  }

  .figure-title {
    text-align: center;
    color: #00ccaa;
    line-height: 3rem;
    font-size: 3rem;
  }
</style>
