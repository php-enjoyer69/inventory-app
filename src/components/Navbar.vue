<template>
  <div>
    <nav>
      <h1>Inventory App</h1>
      
      <div class="nav-right" v-if="user">
        <p class="user-info">
          Logged as: {{ user }} <span v-if="userType === 'admin'">(admin)</span><span v-else>(user)</span>
        </p>
        <router-link to="/home">Home</router-link>
        <router-link to="/admin/user-management" v-if="userType === 'admin'">Manage Users</router-link>
        <button @click="logout">Logout</button>
      </div>
      
    </nav>
  </div>
</template>

<script>
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

export default {
  data() {
    return {
      user: null,
      userType: null
    }
  },
  mounted() {
    onAuthStateChanged(getAuth(), async (_user) => {
      if (_user) {
        this.user = _user.email
        
        // Check if the user is an admin
        const docRef = doc(db, 'users', _user.uid)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists() && docSnap.data().isAdmin) {
          this.userType = 'admin'
        } else {
          this.userType = 'user'
        }
      } else {
        this.user = null
        this.userType = null
      }
    });
  },
  methods: {
    logout() {
      signOut(getAuth())
      this.$router.push('/')
    }
  }
}
</script>

<style>
nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
nav h1 {
  margin-right: auto;
  margin-bottom: 0;
}
nav .nav-right {
  display: flex;
  align-items: center;
}
nav .nav-right .user-info {
  margin: 0;
  margin-right: 16px;
}
nav a {
  margin-left: 16px;
  color: #2c3e50;
}
nav button {
  margin-left: 16px;
}
nav a.router-link-exact-active {
  color: #0ec58e;
}
</style>
