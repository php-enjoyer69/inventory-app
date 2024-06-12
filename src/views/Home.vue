<template>
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
  <div class="home">
    <div v-if="categories.length">
    <div v-for="category in categories" :key="category.id" class="category-section">
      <h2>{{ category.name }}</h2>
      <ul>
        <li v-for="item in inventory.filter(item => item.category.id === category.id)" :key="item.id">
          <div class="details">
            <h3 @click="showItemDetails(item)">{{ item.name }}</h3>
            <p>{{ item.model }}</p>
            <p>Quantity: {{ item.quantity }}</p>
            <p>${{ item.price }}</p>
            <p :style="{ color: getColor(item.condition.name) }">{{ item.condition.name }}</p>
            <p v-if="item.source">Source: {{ item.source.name }}</p>
            <p v-if="item.info">Info: {{ item.info }}</p>
            <p>Total Value: {{ totalValue(item) }}</p>
            <p v-if="item.modifiedBy">Modified By: {{ item.modifiedBy }} at {{ formatLastModified(item.lastModified) }}</p>
          </div>
            <div :class="{icon: true, fav: item.isFav}" @click="handleUpdate(item)" v-if="isAdmin">
              <span class="material-icons" :class="{ fav: item.isFav && isAdmin }">star</span>
            </div>
            <button @click="handleEdit(item)" v-if="isAdmin">Edit</button>
            <button @click="handleDelete(item)" v-if="isAdmin">Delete</button>
          </li>
        </ul>
      </div>
    </div>
    <CreateItemForm v-if="isAdmin && !editingItem" />
    <EditItemForm v-if="editingItem" :item="editingItem" @editComplete="editComplete" @editCancel="editCancel" />

    <div v-if="showItemModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showItemModal = false">&times;</span>
        <h3>{{ selectedItem.name }}</h3>
        <p>Model: {{ selectedItem.model }}</p>
        <p>Quantity: {{ selectedItem.quantity }}</p>
        <p>Price: {{ selectedItem.price }}</p>
        <p :style="{ color: getColor(selectedItem.condition.name) }">{{ selectedItem.condition.name }}</p>
        <p v-if="selectedItem.source">Source: {{ selectedItem.source.name }}</p>
        <p v-if="selectedItem.info">Info: {{ selectedItem.info }}</p>
        <p>Total Value: {{ totalValue(selectedItem) }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import CreateItemForm from './../components/CreateItemForm.vue'
import EditItemForm from './../components/EditItemForm.vue'
import { db, firebase } from '../firebase/config'
import { collection, onSnapshot, deleteDoc, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { watchEffect } from '@vue/runtime-core'

export default {
  name: 'Home',
  components: { CreateItemForm, EditItemForm },
  data() {
    return {
      inventory: [],
      categories: [],
      editingItem: null,
      isAdmin: false,
      showItemModal: false,
      selectedItem: null
    }
  },
  methods: {
    async handleDelete(item) {
      const docRef = doc(db, 'inventory', item.id)
      await deleteDoc(docRef)
    },
    async handleUpdate(item) {
      const docRef = doc(db, 'inventory', item.id)
      await updateDoc(docRef, {
        isFav: !item.isFav,
        lastModified: new Date().toISOString()
      })
    },
    handleEdit(item) {
      this.editingItem = { ...item }
    },
    editComplete() {
      this.editingItem = null
    },
    editCancel() {
      this.editingItem = null
    },
    totalValue(item) {
      return item.quantity * item.price;
    },
    showItemDetails(item) {
      this.selectedItem = item
      this.showItemModal = true
    },
    getColor(conditionName) {
    if (conditionName === 'New') {
    return 'green';
    } else if (conditionName === 'Used') {
    return 'orange';
    } else if (conditionName === 'Damaged') {
    return 'red';
    } else {
    return 'black'; // Default color
  }
},
formatLastModified(date) {
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      return new Date(date).toLocaleString('en-US', options);
    }
  },
  mounted() {
    const auth = getAuth()
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          this.isAdmin = docSnap.data().isAdmin
        }
      }
    })
    
    // Fetching inventory
    const colRefInventory = collection(db, 'inventory')
    const unsubInventory = onSnapshot(colRefInventory, snapshot => {
      let results = []
      snapshot.docs.forEach(doc => {
        results.push({ ...doc.data(), id: doc.id })
      })
      this.inventory = results
    })
    // Fetching categories
    const colRefCategories = collection(db, 'categories')
    const unsubCategories = onSnapshot(colRefCategories, snapshot => {
      let results = []
      snapshot.docs.forEach(doc => {
        results.push({ ...doc.data(), id: doc.id })
      })
      this.categories = results
    })

    watchEffect((onInvalidate) => {
      onInvalidate(() => {
        unsubInventory()
        unsubCategories()
      })
    })
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
  cursor: pointer;
  color: #007bff;
}
.home li h3:hover {
  text-decoration: underline;
}
.home li p {
  margin: 0;
}
.icon {
  color: #bbbbbb;
  cursor: pointer;
}
.fav {
  color: orange !important;
}
button {
  margin-left: 10px;
  cursor: pointer;
}
.category-section {
  margin-bottom: 20px;
}

.modal {
  display: flex;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0,0,0,0.4);
}

.modal-content {
  background-color: #fefefe;
  margin: auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 500px;
  border-radius: 10px;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
</style>
