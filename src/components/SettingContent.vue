<template>
  <div class="setting-content" :style="contentStyle">
    <loading v-if="isLoading"/>
    <router-view/>

    <!--<edit-panel :panelState="panelState" @closePanel="panelState = false"/>-->
    <div id="bia-production-head">
      <p>bia-production-head</p>
    </div>
    <div id="center-canvas-container" :style="canvasContainer">
      <div class="canvas-container">
        <canvas class="lower-canvas"></canvas>
        <canvas class="upper-canvas"></canvas>
      </div>
    </div>
    <div class="tools-bar">
      <div class="tools-content">
        <span> | </span>
        <a>
          <icon name="camera" scale="2.5"></icon>
          <input type="file" capture="camera" accept="image/jpeg,image/jpg,image/png" name="file" @change="upload">
        </a>
      </div>

    </div>
  </div>
</template>

<script>
  import Lodash from 'lodash'
  import Bus from '../common/Bus'
  import qs from 'querystring'
  import EditPanel from '../page/EditPanel'
  import Loading from '@/components/Loading'

  export default {
    name: "setting-content",
    components: {
      EditPanel,
      Loading
    },
    data() {
      return {
        contentStyle: {
          height: '16px'
        },
        canvasContainer: {
          height: '16px'
        },
        panelState: false,
        imgDetails: {
          url: './static/img/rabbit.bmp'
        },
        isLoading: false
      }
    },
    mounted: function () {
      const _this = this;
      _this.contentHeightCalc();
      _this.canvasContainerHeightCalc();
      window.onresize = Lodash.debounce(function () {
        _this.contentHeightCalc();
        _this.canvasContainerHeightCalc();
      }, 400);
    },
    watch: {
      '$route': function () {
        console.log("父组件")
      }
    },
    methods: {
      contentHeightCalc: function () {
        this.contentStyle.height = (document.body.clientHeight / 18 - 6) + "rem";
        Bus.$emit('trans', this.contentStyle.height)
      },
      canvasContainerHeightCalc: function () {
        this.canvasContainer.height = document.getElementById('center-canvas-container').offsetWidth / 18 + 2 + "rem";
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
          _this.imgDetails.url = base64Url
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
        param.append('key', 'biaker/'+date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate()+'/'+date.valueOf()+'.'+type[type.length-1])
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
        this.$axios.post('http://upload-z2.qiniup.com/',param,config)
          .then(response=>{
            console.log(response.data);
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
    margin: 1.5rem 2rem 0 2rem;
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

  .tools-bar {
    position: absolute;
    display: flex;
    z-index: 8888;
    bottom: 6.125rem;
    width: 100%;
    justify-content: center;
  }

  .tools-bar .tools-content {
    height: 2.125rem;
    line-height: 2.125rem;
    padding: 0 0.625rem;
    width: 60%;
    color: #00ccaa;
    background-color: #fff;
    border: 1px solid #00ccaa;
    border-radius: 10px;
  }
</style>
