
<template>
  <div class="writepost">
    <header class="writepost__header">
      <ul class="writepost__header-left">
        <img src="../../assets/icons/back-arrow.png" alt="cancle" />
      </ul>
      <ul class="writepost__header-right">
        <li>Next</li>
      </ul>
      <img src="../../assets/logo.png" alt="Logo" class="writepost__logo" />
    </header>

    <Container />

    <footer class="writepost__footer">
      <ul class="writepost__footer-upload">
        <input type="file" id="file" class="writepost__inputfile" />
        <label for="file" class="writepost__plus-button">+</label>
      </ul>
    </footer>
  </div>
</template>

<style scoped>
.writepost {
  margin: 0 auto;
  max-width: 460px;
  width: 100%;
  font-family: "consolas";
  box-sizing: border-box;
  position: relative;
  border-left: 1px solid #eee;
  border-right: 1px solid #eee;
}

.writepost__header {
  position: sticky;
  top: 0;
  width: 100%;
  height: 40px;
  background-color: white;
  padding-bottom: 8px;
}

.writepost__header-left,
.writepost__header-right {
  list-style: none;
  padding: 5px;
  margin-top: 10px;
  cursor: pointer;
  width: 50px;
}

.writepost__header-left {
  float: left;
  padding-left: 20px;
}

.writepost__header-right {
  float: right;
}

.writepost__logo {
  width: 22px;
  position: absolute;
  top: 13px;
  left: 0;
  right: 0;
  margin: auto;
  display: block;
}

.writepost__footer {
  position: sticky;
  bottom: 0;
  width: 100%;
  padding-bottom: 10px;
  background-color: white;
}

.writepost__footer-upload {
  list-style: none;
  margin: auto;
  width: 80px;
  text-align: center;
  font-size: 24px;
  padding-top: 12px;
  cursor: pointer;
}

.writepost__inputfile {
  display: none;
}

.writepost__plus-button {
  cursor: pointer;
}
</style>
