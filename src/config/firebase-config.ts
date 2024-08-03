// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC-SK2aCYtDVp71M9VgHJ11sch7XY0z3BQ",
  authDomain: "netmart-e1a81.firebaseapp.com",
  projectId: "netmart-e1a81",
  storageBucket: "netmart-e1a81.appspot.com",
  messagingSenderId: "79499582554",
  appId: "1:79499582554:web:c011532b3557fce16ccc63",
  measurementId: "G-CCFVM4ZD2S",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
