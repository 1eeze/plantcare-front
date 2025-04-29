<template>
  <div id="app">
    <LoginForm />
    </div>
</template>

<script>
import LoginForm from './components/LoginForm.vue'; 

export default {
  name: 'App',
  components: {
    LoginForm
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center; /* 예시: 가운데 정렬 */
  color: #2c3e50;
  margin-top: 60px; /* 예시: 상단 여백 */
}
</style>
