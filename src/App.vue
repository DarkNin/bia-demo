<template>
  <div id="app">
    <setting-title/>
    <setting-content/>
  </div>
</template>

<script>
  import SettingTitle from './components/SettingTitle'
  import SettingContent from './components/SettingContent'
  import EditPanel from './page/EditPanel'
  export default {
    name: 'App',
    components: {
      SettingTitle,
      SettingContent,
      EditPanel
    }
  }
</script>

<style>
  #app {
  }
  html {
    font-size: 18px;
  }
  html, body{
    height: 100%;
  }
  body, div, span, p, h1, h2, h3, h4, h5, h6, ul, li, img, a, form {
    margin: 0;
    padding: 0;
  }
</style>
