import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css';

import {getAuth, onAuthStateChanged} from 'firebase/auth'

let app

onAuthStateChanged(getAuth(), () => {
    if (!app) {
        app = createApp(App).use(router).mount('#app')
    }
})

