<template>
  <div class="setting-title">
    <p>{{title}}</p>
  </div>
</template>

<script>
  import Bus from '../common/Bus'

  export default {
    name: "setting-title",
    data() {
      return {
        title: '555'
      }
    },
    mounted: function () {
      const _this = this;
      Bus.$on('trans', function (val) {
        _this.title = val.toString();
      })
    }
  }
</script>

<style scoped>
  .setting-title {
    position: relative;
    width: 100%;
    font-size: .8rem;
    color: #00ccaa;
    height: 2.5rem;
    line-height: 2.5rem;
    vertical-align: middle;
    text-align: center;
    top: 0;
    border-bottom: 1px #e5e5e5 solid;
  }
</style>
