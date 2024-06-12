<template>
  <div v-if="item">
    <form @submit.prevent="submitEdit">
      <h3>Edit Position</h3>
      
      <label for="name">Item name:</label>
      <input type="text" v-model="localItem.name" placeholder="Name" required />

      <label for="model">Item model:</label>
      <input type="text" v-model="localItem.model" placeholder="Model" required />

      <label for="category">Item category:</label>
      <div>
        <select v-model="localItem.category" required>
          <option v-for="category in categories" :key="category.id" :value="category">
            {{ category.name }}
          </option>
        </select>
        <button type="button" @click="showAddCategoryModal = true">Add New Category</button>
      </div>

      <label for="quantity">Item quantity:</label>
      <input type="number" v-model.number="localItem.quantity" placeholder="Quantity" required />

      <label for="price">Item price:</label>
      <input type="number" v-model.number="localItem.price" placeholder="Price" required />

      <label for="condition">Item condition:</label>
      <select v-model="localItem.condition" required>
        <option v-for="condition in conditions" :key="condition.id" :value="condition">
          {{ condition.name }}
        </option>
      </select>

      <label for="info">Additional info:</label>
      <input type="text" v-model="localItem.info" placeholder="Additional Info" />

      <label for="source">Item source:</label>
      <div>
        <select v-model="localItem.source" required>
          <option v-for="source in sources" :key="source.id" :value="source">
            {{ source.name }}
          </option>
        </select>
        <button type="button" @click="showAddSourceModal = true">Add New Source</button>
      </div>

      <p>Modified by: {{ currentUserEmail }}</p>

      <button type="submit">Save</button>
      <button type="button" @click="cancelEdit">Cancel</button>
    </form>

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
      sources: [
        { id: '1', name: 'Stock 1' },
        { id: '2', name: 'Stock 2' },
        { id: '3', name: 'Stock 3' },
        { id: '4', name: 'Shop 1' },
        { id: '5', name: 'Shop 2' }
      ],
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
          name: this.newCategory
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
</style>
