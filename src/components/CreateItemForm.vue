<template>
  <h5><b>Add a New Item</b></h5>
  <form @submit.prevent="handleSubmit">

    <div class="mb-3">
      <label for="name" class="form-label">Item name: </label>
      <input type="text" class="form-control" name="name" v-model="name" required>
    </div>

    <div class="mb-3">
      <label for="model" class="form-label">Item model: </label>
      <input type="text" class="form-control" name="model" v-model="model" required>
    </div>

    <div class="mb-3">
      <label for="category" class="form-label">Item category: </label>
      <div class="d-flex">
        <select class="form-select" v-model="selectedCategory" required>
          <option v-for="category in categories" :key="category.id" :value="category">
            {{ category.name }}
          </option>
        </select>
        <button type="button" class="btn btn-secondary ms-2" @click="showAddCategoryModal = true">Add New
          Category</button>
      </div>
    </div>

    <div class="mb-3">
      <label for="quantity" class="form-label">Item quantity: </label>
      <input type="number" class="form-control" name="quantity" v-model.number="quantity" required>
    </div>

    <div class="mb-3">
      <label for="price" class="form-label">Item price: </label>
      <input type="number" class="form-control" name="price" v-model.number="price" required>
    </div>

    <div class="mb-3">
      <label for="condition" class="form-label">Item condition: </label>
      <select class="form-select" v-model="selectedCondition" required>
        <option v-for="condition in conditions" :key="condition.id" :value="condition">
          {{ condition.name }}
        </option>
      </select>
    </div>

    <div class="mb-3">
      <label for="info" class="form-label">Additional info: </label>
      <input type="text" class="form-control" name="info" v-model="info">
    </div>

    <div class="mb-3">
      <label for="source" class="form-label">Item source: </label>
      <div class="d-flex">
        <select class="form-select" v-model="selectedSource" required>
          <option v-for="source in sources" :key="source.id" :value="source">
            {{ source.name }}
          </option>
        </select>
        <button type="button" class="btn btn-secondary ms-2" @click="showAddSourceModal = true">Add New Source</button>
      </div>
    </div>

    <button class="btn btn-primary">Add Item</button>

    <div v-if="showAddCategoryModal" class="modal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add New Category</h5>
            <button type="button" class="btn-close" @click="showAddCategoryModal = false"></button>
          </div>
          <div class="modal-body">
            <label for="newCategoryName" class="form-label">Category name:</label>
            <input type="text" class="form-control" v-model="newCategoryName">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showAddCategoryModal = false">Close</button>
            <button type="button" class="btn btn-primary" @click="addNewCategory">Add Category</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddSourceModal" class="modal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add New Source</h5>
            <button type="button" class="btn-close" @click="showAddSourceModal = false"></button>
          </div>
          <div class="modal-body">
            <label for="newSourceName" class="form-label">Source name:</label>
            <input type="text" class="form-control" v-model="newSourceName">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showAddSourceModal = false">Close</button>
            <button type="button" class="btn btn-primary" @click="addNewSource">Add Source</button>
          </div>
        </div>
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

<style scoped>
form {
  padding: 10px;
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  max-width: 45%;
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

.modal-content {
  background-color: #fefefe;
  margin: auto;
  padding: 20px;
  border: 1px solid #888;
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

.mb-3 {
  margin-bottom: 15px;
}
</style>
