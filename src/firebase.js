import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyD7ZpNr_HdRldBAfGcm9Dgd5_0jVGk_HkQ",
  authDomain: "manager-facturi.firebaseapp.com",
  projectId: "manager-facturi",
  storageBucket: "manager-facturi.appspot.com", 
  messagingSenderId: "8113453689",
  appId: "1:8113453689:web:cd80b3e491fe94c1b432a8",
  measurementId: "G-MT1WE5947S"
};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;