import {initializeApp} from 'firebase/app'
import {getFirestore} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCSPfdUyEyQOQQgDX9-TfabG5z8rizvg2o",
  authDomain: "inventory-project-9d80a.firebaseapp.com",
  projectId: "inventory-project-9d80a",
  storageBucket: "inventory-project-9d80a.appspot.com",
  messagingSenderId: "698656496358",
  appId: "1:698656496358:web:4d1e1f4dce159a0b7e3927"
};

  initializeApp(firebaseConfig)

  const db = getFirestore()

  export {db}