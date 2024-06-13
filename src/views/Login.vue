<template>
  <div>
    <div>
      <h5 class="bold-heading">Login</h5>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" name="email" v-model="email" class="form-control" required>
        </div>

        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" name="password" v-model="password" class="form-control" required>
        </div>

        <button class="btn btn-primary btn-sm" type="submit">Login</button>
      </form>

      <p v-if="errorCode">{{ errorCode }}</p>
      <p v-if="errorMsg">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script>
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

export default {
  data() {
    return {
      email: '',
      password: '',
      errorCode: '',
      errorMsg: ''
    }
  },
  methods: {
    async handleSubmit() {
      try {
        const res = await signInWithEmailAndPassword(getAuth(), this.email, this.password)
        if (!res) {
          throw new Error('Could not log in')
        }
        this.errorCode = ''
        this.errorMsg = ''
        this.$router.push('/home')
      } catch (err) {
        this.errorCode = err.code
        this.errorMsg = err.message
      }
    }
  }
}
</script>

<style scoped>
.form {
  padding: 10px;
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  max-width: 45%;
  flex-direction: column;
}

.btn-primary {
  background-color: #61008f !important;
  color: #fff !important;
  margin-top: 5px;
}

.bold-heading {
  font-weight: bold;
  margin-bottom: -5px;
  margin-top: 30px;
}
</style>
