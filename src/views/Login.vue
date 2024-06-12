<template>
  <form @submit.prevent="handleSubmit">
    <h2>Login</h2>

    <label for="email">Email:</label>
    <input type="email" name="email" v-model="email" required>

    <label for="password">Password:</label>
    <input type="password" name="password" v-model="password" required>

    <button>Login</button>
  </form>
  <p>{{ errorCode }}</p>
  <p>{{ errorMsg }}</p>
</template>

<script>

import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

export default {
  data() {
    return {
      email: '',
      password: '',
      error: '',
      errorMsg: '',
      errorCode:''
    }
  },
  methods: {
    async handleSubmit(){
      console.log(this.email, this.password)

      try {
        const res = await signInWithEmailAndPassword(getAuth(), this.email, this.password)
        if (!res) {
          throw new Error('Could not log in')
        }
        this.error = null
        this.$router.push('/home')
      }
      catch (err) {
        this.errorCode = err.code 
        this.errorMsg = err.message
      }
    }
  }
}
</script>

<style>
.home ul {
  padding: 0;
}
.home li {
  list-style-type: none;
  background: #fff;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}
.home li .details {
  margin-right: auto;
}
.home li h3 {
  margin: 0;
  margin-bottom: 4px;
}
.home li p {
  margin: 0;
}
.icon {
  color: #bbbbbb;
  cursor: pointer;
}
.fav {
  color: red;
}
button {
  margin-left: 10px;
  cursor: pointer;
}
.genre-section {
  margin-bottom: 20px;
}
</style>