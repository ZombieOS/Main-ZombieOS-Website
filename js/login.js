import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
getAuth,
signInWithEmailAndPassword,
GoogleAuthProvider,
signInWithPopup
}
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

/* FIREBASE */

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

const app =
initializeApp(firebaseConfig);

const user =
cresedentials.username;

const auth =
getAuth(app);

if(user)
{
    showPopUp(
        "Error Z-02",
        "You're already logged into an account. You need to sign out first.",
        function(){
            window.location.href = "/dashboard";
        }
    );
}

/* LOGIN */

const loginForm =
document.getElementById(
"login-form"
);

if(loginForm){

loginForm.addEventListener(
"submit",
async(event)=>{

event.preventDefault();

const email =
document.getElementById(
"email"
).value.trim();

const password =
document.getElementById(
"password"
).value;

try{

await signInWithEmailAndPassword(
auth,
email,
password
);

/* REDIRECT */

window.location.href =
"/dashboard";

}catch(error){

console.error(
"Login Error:",
error
);

let message =
"Login failed.";

switch(error.code){

case
"auth/user-not-found":

message =
"No account with that email.";

break;

case
"auth/wrong-password":

message =
"Incorrect password.";

break;

case
"auth/invalid-credential":

message =
"Incorrect email or password.";

break;

case
"auth/user-disabled":

message =
"This account is disabled.";

break;

}

alert(message);

}

}
);

}

/* GOOGLE LOGIN */

const googleButton =
document.getElementById(
"google-login"
);

if(googleButton){

googleButton.addEventListener(
"click",
async()=>{

try{

const provider =
new GoogleAuthProvider();

await signInWithPopup(
auth,
provider
);

window.location.href =
"/dashboard";

}catch(error){

console.error(
"Google Login Error:",
error
);

alert(
"Google login failed."
);

}

}
);

}