import { initializeApp } from "firebase/app";

import {
    getAuth
} from "firebase/auth";

import {
    getFirestore
} from "firebase/firestore";

/* =========================================
   FIREBASE CONFIG
========================================= */

const firebaseConfig = {

    apiKey:
    "AIzaSyDG0hSabeqYdGgSISOgvSnkOwATXDLiV9g",

    authDomain:
    "zombieos.firebaseapp.com",

    projectId:
    "zombieos",

    storageBucket:
    "zombieos.firebasestorage.app",

    messagingSenderId:
    "577624378484",

    appId:
    "1:577624378484:web:3e88e693724bde8e89d521"

};

/* =========================================
   INITIALIZE FIREBASE
========================================= */

export const app =
initializeApp(firebaseConfig);

export const auth =
getAuth(app);

export const db =
getFirestore(app);