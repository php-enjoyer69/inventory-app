<template>
  <form @submit.prevent="handleSubmit">
    <h3>Add a New Item</h3>

    <label for="name">Item name:</label>
    <input type="text" name="name" v-model="name" required>

    <label for="model">Item model:</label>
    <input type="text" name="model" v-model="model" required>

    <label for="category">Item category:</label>
    <div>
      <select v-model="selectedCategory" required>
        <option v-for="category in categories" :key="category.id" :value="category">
          {{ category.name }}
        </option>
      </select>
      <button type="button" @click="showAddCategoryModal = true">Add New Category</button>
    </div>

    <label for="quantity">Item quantity:</label>
    <input type="number" name="quantity" v-model.number="quantity" required>

    <label for="price">Item price:</label>
    <input type="number" name="price" v-model.number="price" required>

    <label for="condition">Item condition:</label>
    <select v-model="selectedCondition" required>
      <option v-for="condition in conditions" :key="condition.id" :value="condition">
        {{ condition.name }}
      </option>
    </select>

    <label for="info">Additional info:</label>
    <input type="text" name="info" v-model="info">

    <label for="source">Item source:</label>
    <div>
      <select v-model="selectedSource" required>
        <option v-for="source in sources" :key="source.id" :value="source">
          {{ source.name }}
        </option>
      </select>
      <button type="button" @click="showAddSourceModal = true">Add New Source</button>
    </div>

    <button>Add Item</button>

    <div v-if="showAddCategoryModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showAddCategoryModal = false">&times;</span>
        <h4>Add New Category</h4>
        <label for="newCategoryName">Category name:</label>
        <input type="text" v-model="newCategoryName">
        <button type="button" @click="addNewCategory">Add Category</button>
      </div>
    </div>

    <div v-if="showAddSourceModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showAddSourceModal = false">&times;</span>
        <h4>Add New Source</h4>
        <label for="newSourceName">Source name:</label>
        <input type="text" v-model="newSourceName">
        <button type="button" @click="addNewSource">Add Source</button>
      </div>
    </div>
  </form>
</template>

<script>
import { db } from '../firebase/config'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

export default {
  data() {
    return {
      name: '',
      model: '',
      selectedCategory: null,
      quantity: 0,
      price: 0,
      selectedCondition: null,
      info: '',
      selectedSource: null,
      categories: [],
      conditions: [
        { id: '1', name: 'New' },
        { id: '2', name: 'Used' },
        { id: '3', name: 'Damaged' }
      ],
      sources: [],
      showAddCategoryModal: false,
      showAddSourceModal: false,
      newCategoryName: '',
      newSourceName: '',
      currentUserEmail: null
    }
  },
  async created() {
    const auth = getAuth()
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUserEmail = user.email;
      }
    })

    const colRefCategories = collection(db, 'categories')
    const snapshotCategories = await getDocs(colRefCategories)
    this.categories = snapshotCategories.docs.map(doc => ({ ...doc.data(), id: doc.id }))
    
    const colRefSources = collection(db, 'sources')
    const snapshotSources = await getDocs(colRefSources)
    this.sources = snapshotSources.docs.map(doc => ({ ...doc.data(), id: doc.id }))
  },
  methods: {
    async handleSubmit() {
      const colRef = collection(db, 'inventory')

      try {
        await addDoc(colRef, {
          name: this.name,
          model: this.model,
          category: this.selectedCategory,
          quantity: this.quantity,
          price: this.price,
          condition: this.selectedCondition,
          info: this.info,
          source: this.selectedSource,
          modifiedBy: this.currentUserEmail,
          lastModified: new Date().toISOString()
        })
        this.name = ''
        this.model = ''
        this.selectedCategory = null
        this.quantity = 0
        this.price = 0
        this.selectedCondition = null
        this.info = ''
        this.selectedSource = null
      } catch (error) {
        console.error('Error adding document: ', error)
      }
    },
    async addNewCategory() {
      const colRef = collection(db, 'categories')
      try {
        const docRef = await addDoc(colRef, {
          name: this.newCategoryName
        })
        const newCategory = {
          id: docRef.id,
          name: this.newCategoryName
        }
        this.categories.push(newCategory)
        this.selectedCategory = newCategory
        this.showAddCategoryModal = false
        this.newCategoryName = ''
      } catch (error) {
        console.error('Error adding category: ', error)
      }
    },
    async addNewSource() {
      const colRef = collection(db, 'sources')
      try {
        const docRef = await addDoc(colRef, {
          name: this.newSourceName
        })
        const newSource = {
          id: docRef.id,
          name: this.newSourceName
        }
        this.sources.push(newSource)
        this.selectedSource = newSource
        this.showAddSourceModal = false
        this.newSourceName = ''
      } catch (error) {
        console.error('Error adding source: ', error)
      }
    }
  }
}
</script>

<style>
form {
  padding: 10px;
  margin-top: 10px;
  border: 1px dashed #c3c8ce;
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
  border
  : 1px solid #888;
  width: 80%;
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
