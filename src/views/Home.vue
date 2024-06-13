<template>
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
  <div class="home container mt-4">
    <div v-if="categories.length">
      <div v-for="category in categories" :key="category.id" class="category-section mb-4">
        <h4 class="item-field category-name">{{ category.name }}</h4>
        <ul class="list-group">
          <li v-for="item in inventory.filter(item => item.category.id === category.id)" :key="item.id"
            class="list-group-item d-flex justify-content-between align-items-center mb-2">
            <div class="item-details d-flex flex-wrap align-items-center w-100">
              <h5 @click="showItemDetails(item)" class="item-field item-name medium-font">{{ item.name }}</h5>
              <p class="item-field-wide">{{ item.model }}</p>
              <p class="item-field">{{ item.quantity }}</p>
              <p class="item-field">${{ item.price }}</p>
              <p :style="{ color: getColor(item.condition.name) }" class="item-field">{{ item.condition.name }}</p>
              <p v-if="item.source" class="item-field">{{ item.source.name }}</p>
              <p class="item-field">Total <b>${{ totalValue(item) }}</b></p>
              <p v-if="item.info" class="item-field-wide">Info: {{ item.info }}</p>
              <p v-if="item.modifiedBy" class="item-field modified-field smaller-font">{{ item.modifiedBy }} at
                {{ formatLastModified(item.lastModified) }}</p>
              <div class="item-actions ml-auto">
                <div :class="{ icon: true, fav: item.isFav }" @click="isAdmin && handleUpdate(item)">
                  <span class="material-icons" :class="{ fav: item.isFav }">star</span>
                </div>
                <button @click="handleEdit(item)" v-if="isAdmin" class="btn btn-primary btn-sm ml-4">Edit</button>
                <button @click="handleDelete(item)" v-if="isAdmin" class="btn btn-danger btn-sm ml-4">Delete</button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <CreateItemForm v-if="isAdmin && !editingItem" />
    <EditItemForm v-if="editingItem" :item="editingItem" @editComplete="editComplete" @editCancel="editCancel" />

    <div v-if="showItemModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedItem.name }}</h5>
            <span class="material-icons btn-close" @click="showItemModal = false">close</span>
          </div>
          <div class="modal-body">
            <p><b>Model:</b> {{ selectedItem.model }}</p>
            <p><b>Category: </b>{{ selectedItem.category.name }}</p>
            <p><b>Quantity:</b> {{ selectedItem.quantity }}</p>
            <p><b>Price for 1: </b> ${{ selectedItem.price }}</p>
            <p :style="{ color: getColor(selectedItem.condition.name) }">{{ selectedItem.condition.name }}</p>
            <p v-if="selectedItem.source"><b>Source:</b> {{ selectedItem.source.name }}</p>
            <p v-if="selectedItem.info"><b>Info:</b> {{ selectedItem.info }}</p>
            <p><b>Total Value:</b> {{ totalValue(selectedItem) }}</p>
            <p>Last modified by {{ selectedItem.modifiedBy }} at {{ formatLastModified(selectedItem.lastModified) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CreateItemForm from './../components/CreateItemForm.vue'
import EditItemForm from './../components/EditItemForm.vue'
import { db } from '../firebase/config'
import { collection, onSnapshot, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore'
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
    closeModal() {
      this.showItemModal = false;
    },
    getColor(conditionName) {
      if (conditionName === 'New') {
        return 'limegreen';
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

.home .item-details {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  width: 100%;
}

.home .item-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 5px;
}

.home .item-field {
  margin-right: 5px;
  flex: 1.9;
}

.home .modified-field {
  color: gray;
  flex: 1;
  margin-left: 10px;
}

.home .smaller-font {
  font-size: 12px;
}

.home .medium-font {
  margin-top: 10px;
  font-size: 18px;
  cursor: pointer;
  font-weight: bold;
}

.home .item-field-wide {
  margin-left: 30px;
  margin-right: 10px;
  flex: 1.9;
}

.home .item-name {
  color: #61008f;
}

.home li h3 {
  margin: 0;
  margin-right: 10px;
  cursor: pointer;
  color: #61008f;
}

.home li h3:hover {
  text-decoration: underline;
}

.home li p {
  margin: 0;
  margin-right: 10px;
}

.icon {
  color: #bbbbbb;
  cursor: pointer;
  margin-right: 10px;
}

.fav {
  color: orange !important;
}

.category-section {
  margin-bottom: 20px;
}

.home .category-name {
  font-weight: bold;
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
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-dialog {
  width: 100%;
  max-width: 500px;
  margin: auto;
}

.modal-content {
  background-color: #fefefe;
  margin: auto;
  padding: 20px;
  border: 1px solid #888;
  border-radius: 10px;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

.modal-header h5 {
  margin-bottom: 0;
  color: #333;
}

.modal-body p {
  margin-bottom: 10px;
}

.modal-header .modal-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-right: auto;
}

.btn-close {
  cursor: pointer;
  font-size: 24px;
  color: #888;
  margin-left: auto;
}
</style>