<template>
  <h5><b>Edit Position</b></h5>
  <div v-if="item">
    <form @submit.prevent="submitEdit">

      <div class="mb-3">
        <label for="name">Item name: </label>
        <input type="text" v-model="localItem.name" class="form-control" placeholder="Name" required />
      </div>

      <div class="mb-3">
        <label for="model">Item model: </label>
        <input type="text" v-model="localItem.model" class="form-control" placeholder="Model" required />
      </div>

      <div class="mb-3">
        <label for="category">Item category: </label>
        <div class="d-flex">
          <select v-model="localItem.category" class="form-select" required>
            <option v-for="category in categories" :key="category.id" :value="category">
              {{ category.name }}
            </option>
          </select>
          <button type="button" @click="showAddCategoryModal = true" class="btn btn-secondary ms-2">Add New
            Category</button>
        </div>
      </div>

      <div class="mb-3">
        <label for="quantity">Item quantity: </label>
        <input type="number" v-model.number="localItem.quantity" class="form-control" placeholder="Quantity" required />
      </div>

      <div class="mb-3">
        <label for="price">Item price: </label>
        <input type="number" v-model.number="localItem.price" class="form-control" placeholder="Price" required />
      </div>

      <div class="mb-3">
        <label for="condition">Item condition: </label>
        <select v-model="localItem.condition" class="form-select" required>
          <option v-for="condition in conditions" :key="condition.id" :value="condition">
            {{ condition.name }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label for="info">Additional info: </label>
        <input type="text" v-model="localItem.info" class="form-control" placeholder="Additional Info" />
      </div>

      <div class="mb-3">
        <label for="source">Item source: </label>
        <div class="d-flex">
          <select v-model="localItem.source" class="form-select" required>
            <option v-for="source in sources" :key="source.id" :value="source">
              {{ source.name }}
            </option>
          </select>
          <button type="button" @click="showAddSourceModal = true" class="btn btn-secondary ms-2">Add New
            Source</button>
        </div>
      </div>

      <p class="mb-3">Modified by: {{ currentUserEmail }}</p>

      <div class="mb-3">
        <button type="submit" class="btn btn-primary">Save</button>
        <button type="button" @click="cancelEdit" class="btn btn-secondary ms-2">Cancel</button>
      </div>
    </form>

    <div v-if="showAddCategoryModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showAddCategoryModal = false">&times;</span>
        <h4>Add New Category</h4>
        <div class="mb-3">
          <label for="newCategoryName">Category name:</label>
          <input type="text" v-model="newCategoryName" class="form-control">
        </div>
        <button type="button" @click="addNewCategory" class="btn btn-primary">Add Category</button>
      </div>
    </div>

    <div v-if="showAddSourceModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showAddSourceModal = false">&times;</span>
        <h4>Add New Source</h4>
        <div class="mb-3">
          <label for="newSourceName">Source name:</label>
          <input type="text" v-model="newSourceName" class="form-control">
        </div>
        <button type="button" @click="addNewSource" class="btn btn-primary">Add Source</button>
      </div>
    </div>
  </div>
</template>

<script>
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { collection, getDocs, addDoc } from 'firebase/firestore'

export default {
  name: 'EditItemForm',
  props: {
    item: Object
  },
  data() {
    return {
      localItem: { ...this.item },
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
  watch: {
    item(newItem) {
      this.localItem = { ...newItem }
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
    async submitEdit() {
      const docRef = doc(db, 'inventory', this.localItem.id)
      await updateDoc(docRef, {
        name: this.localItem.name,
        model: this.localItem.model,
        category: this.localItem.category,
        quantity: this.localItem.quantity,
        price: this.localItem.price,
        condition: this.localItem.condition,
        info: this.localItem.info,
        source: this.localItem.source,
        modifiedBy: this.currentUserEmail,
        lastModified: new Date().toISOString()
      })
      this.$emit('editComplete')
    },
    cancelEdit() {
      this.$emit('editCancel')
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
        this.localItem.category = newCategory
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
        this.localItem.source = newSource
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
