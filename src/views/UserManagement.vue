<template>
  <div>
    <div v-if="isAdmin">
      <AddUser />
    </div>
    <div v-else>
      <p>You do not have permission to access this page.</p>
    </div>
  </div>
</template>

<script>
import { getAuth } from 'firebase/auth'
import AddUser from './../components/AddUser.vue'

export default {
  components: {
    AddUser
  },
  data() {
    return {
      isAdmin: false
    }
  },
  async mounted() {
    const auth = getAuth()
    auth.onAuthStateChanged(user => {
      if (user) {
        this.isAdmin = true
      }
    })
  }
}
</script>