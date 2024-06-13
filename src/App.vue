<template>
  <div class="container">
    <Navbar />
    <router-view />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'

export default {
  components: { Navbar }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

#app {
  min-height: 100vh;
  background: linear-gradient(to top right, #eae1f0, #ffffff);
  font-family: 'Roboto', 'Helvetica', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.container {
  max-width: 1250px;
  margin: 0 auto;
}

.btn {
  background-color: #61008f !important;
  color: #fff !important;
}

.btn-primary {
  border-color: #61008f !important;
}

.btn-danger {
  border-color: #61008f !important;
}

a {
  color: #61008f !important;
}

a:hover {
  text-decoration: underline;
}

form {
  padding: 10px;
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #fdf9ff;
}
</style>
