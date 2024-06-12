<template>
    <div>
      <div v-if="isAdmin">
        <h2>Add New User</h2>
        <form @submit.prevent="addUser">
          <label for="email">Email:</label>
          <input type="email" v-model="email" required />
  
          <label for="password">Password:</label>
          <input type="password" v-model="password" required />
  
          <label for="isAdmin">Is Admin:</label>
          <input type="checkbox" v-model="isAdminInput" />
  
          <button type="submit">Add User</button>
        </form>
      </div>
      <div v-else>
        <p>You do not have permission to access this page.</p>
      </div>
    </div>
  </template>
  
  <script>
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
  import { doc, setDoc, getDoc } from 'firebase/firestore'
  import { db } from '../firebase/config'
  
  export default {
    data() {
      return {
        email: '',
        password: '',
        isAdminInput: false,
        user: null,
        isAdmin: false
      }
    },
    async mounted() {
      const auth = getAuth()
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.user = user
          const docRef = doc(db, 'users', user.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            this.isAdmin = docSnap.data().isAdmin
          }
        }
      })
    },
    methods: {
      async addUser() {
        const adminAuth = getAuth()
        const adminUser = adminAuth.currentUser
  
        try {
          // Temporarily sign out admin
          await signOut(adminAuth)
  
          // Create the new user
          const newAuth = getAuth()
          const res = await createUserWithEmailAndPassword(newAuth, this.email, this.password)
          if (res) {
            await setDoc(doc(db, 'users', res.user.uid), {
              email: res.user.email,
              isAdmin: this.isAdminInput
            })
  
            // Sign back in as admin
            await signInWithEmailAndPassword(adminAuth, adminUser.email, this.password)
  
            // Reset form fields
            this.email = ''
            this.password = ''
            this.isAdminInput = false
            alert('User added successfully')
          }
        } catch (error) {
          console.error('Error adding user: ', error)
        }
      }
    }
  }
  </script>