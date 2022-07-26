import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCz9tivjZv3hwOPbobXp3sZ7l8JBn7ruvw",
  authDomain: "fir-demo-e5ab9.firebaseapp.com",
  projectId: "fir-demo-e5ab9",
  storageBucket: "fir-demo-e5ab9.appspot.com",
  messagingSenderId: "127260826688",
  appId: "1:127260826688:web:d1148e2180023dc42613a5",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const firestore = firebase.firestore();
