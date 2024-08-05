// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAf_LfVgvH0TBPvgXdJ3ztw-oAorl7OroM",
  authDomain: "inventory-management-eab0b.firebaseapp.com",
  projectId: "inventory-management-eab0b",
  storageBucket: "inventory-management-eab0b.appspot.com",
  messagingSenderId: "321076442236",
  appId: "1:321076442236:web:17f4fcf9d532d9c1ea45f9",
  measurementId: "G-86VQ864PJY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)

export {firestore}