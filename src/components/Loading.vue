<template>
  <div class="loading-wrap">
    <div class="loading">
      <div class="loading-circle"></div>
      <span class="loading-text">加载中</span></div>
  </div>
</template>

<script>
  export default {
    name: "loading"
  }
</script>

<style scoped>
  .loading-wrap {
    z-index: 20000;
    position: absolute;
    display: flex;
    width: 100%;
    height: 80%;
    justify-content: center;
    align-items: center;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #e4e4e4;
    border-radius: 10px;
    opacity: 0.3;
    width: 10rem;
    height: 10rem;
  }

  .loading-circle {
    opacity: 1;
    color: #00ccaa;
    font-size: 20px;
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 50%;
    text-indent: -9999em;
    animation: load-effect 1s infinite linear;
  }
  .loading-text{
    display: block;
    margin-top: -0.6em;
    color: #00ccaa;
  }

  @keyframes load-effect {
    0% {
      box-shadow:  0 -3em 0 .2em #00CCAA, /*上*/ 2em -2em 0 0 #00CCAA, /*右上*/ 3em 0 0 -.5em #00CCAA, /*右*/ 2em 2em 0 -.5em #00CCAA, /*右下*/ 0 3em 0 -.5em #00CCAA, /*下*/ -2em 2em 0 -.5em #00CCAA, /*左下*/ -3em 0 0 -.5em #00CCAA, /*左*/ -2em -2em 0 0 #00CCAA; /*左上*/
    }

    12.5% {
      box-shadow: 0 -3em 0 0 #00CCAA,
      2em -2em 0 .2em #00CCAA,
      3em 0 0 0 #00CCAA,
      2em 2em 0 -.5em #00CCAA,
      0 3em 0 -.5em #00CCAA,
      -2em 2em 0 -.5em #00CCAA,
      -3em 0 0 -.5em #00CCAA,
      -2em -2em 0 -.5em #00CCAA;
    }

    25% {
      box-shadow: 0 -3em 0 -.5em #00CCAA,
      2em -2em 0 0 #00CCAA,
      3em 0 0 .2em #00CCAA,
      2em 2em 0 0 #00CCAA,
      0 3em 0 -.5em #00CCAA,
      -2em 2em 0 -.5em #00CCAA,
      -3em 0 0 -.5em #00CCAA,
      -2em -2em 0 -.5em #00CCAA;
    }

    37.5% {
      box-shadow: 0 -3em 0 -.5em #00CCAA,
      2em -2em 0 -.5em #00CCAA,
      3em 0 0 0 #00CCAA,
      2em 2em 0 .2em #00CCAA,
      0 3em 0 0 #00CCAA,
      -2em 2em 0 -.5em #00CCAA,
      -3em 0 0 -.5em #00CCAA,
      -2em -2em 0 -.5em #00CCAA;
    }

    50% {
      box-shadow: 0 -3em 0 -.5em #00CCAA,
      2em -2em 0 -.5em #00CCAA,
      3em 0 0 -.5em #00CCAA,
      2em 2em 0 0 #00CCAA,
      0 3em 0 .2em #00CCAA,
      -2em 2em 0 0 #00CCAA,
      -3em 0 0 -.5em #00CCAA,
      -2em -2em 0 -.5em #00CCAA;
    }

    62.5% {
      box-shadow: 0 -3em 0 -.5em #00CCAA,
      2em -2em 0 -.5em #00CCAA,
      3em 0 0 -.5em #00CCAA,
      2em 2em 0 -.5em #00CCAA,
      0 3em 0 0 #00CCAA,
      -2em 2em 0 .2em #00CCAA,
      -3em 0 0 0 #00CCAA,
      -2em -2em 0 -.5em #00CCAA;
    }

    75% {
      box-shadow: 0 -3em 0 -.5em #00CCAA,
      2em -2em 0 -.5em #00CCAA,
      3em 0 0 -.5em #00CCAA,
      2em 2em 0 -.5em #00CCAA,
      0 3em 0 -.5em #00CCAA,
      -2em 2em 0 0 #00CCAA,
      -3em 0 0 .2em #00CCAA,
      -2em -2em 0 0 #00CCAA;
    }

    87.5% {
      box-shadow: 0 -3em 0 0 #00CCAA,
      2em -2em 0 -.5em #00CCAA,
      3em 0 0 -.5em #00CCAA,
      2em 2em 0 -.5em #00CCAA,
      0 3em 0 -.5em #00CCAA,
      -2em 2em 0 0 #00CCAA,
      -3em 0 0 0 #00CCAA,
      -2em -2em 0 .2em #00CCAA;
    }

    100% {
      box-shadow: 0 -3em 0 .2em #00CCAA,
      2em -2em 0 0 #00CCAA,
      3em 0 0 -.5em #00CCAA,
      2em 2em 0 -.5em #00CCAA,
      0 3em 0 -.5em #00CCAA,
      -2em 2em 0 -.5em #00CCAA,
      -3em 0 0 -.5em #00CCAA,
      -2em -2em 0 0 #00CCAA;
    }
  }
</style>
