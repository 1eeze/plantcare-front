<template>
  <div id="app">
    <router-view />
    </div>
</template>

<script>

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

body, html, #app {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 업로드 모달 */
.upload-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 0;
  background: none;
}
.modal-bg {
  position: absolute; left: 0; top: 0; right: 0; bottom: 0;
  background: #0006;
}
.modal-content {
  position: relative;
  background: #fff;
  padding: 26px 22px;
  border-radius: 18px;
  z-index: 10;
  width: 330px;
  min-width: 330px;
  max-width: 96vw;
  box-sizing: border-box;
  box-shadow: 0 6px 28px #0003;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 auto;
  left: 0; right: 0;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.modal-text {
  font-size: 17px;
  color: #333;
}
.modal-img {
  width: 340px; max-width: 72vw;
  border-radius: 9px; margin-bottom: 14px;
}
</style>