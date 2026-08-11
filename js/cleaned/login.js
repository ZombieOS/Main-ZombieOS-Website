import { auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import {
    showPopup
} from "/js/cleaned/popup.js";

import {
    signInWithGoogle,
    signInWithGitHub,
    signInWithMicrosoft
} from "/js/cleaned/providers.js";

/* =========================================
   HELPERS
========================================= */

function getInput(id){

    const element =
    document.getElementById(id);

    if(!(element instanceof HTMLInputElement)){

        throw new Error(
            `Missing input: ${id}`
        );

    }

    return element;

}

function popup(

    title,

    message,

    callback

){

    showPopup(

        title,

        message,

        callback

    );

}

function goToDashboard(){

    window.location.href =
    "https://dashboard.zombieos.com/";

}

/* =========================================
   ALREADY LOGGED IN
========================================= */

let loginInProgress =
false;

onAuthStateChanged(

    auth,

    (user)=>{

        if(
            !user ||
            loginInProgress
        ){

            return;

        }

        popup(

            "Already Logged In",

            "You are already signed into a ZombieOS account.",

            goToDashboard

        );

    }

);

/* =========================================
   EMAIL LOGIN
========================================= */

const loginForm =
document.getElementById(
    "login-form"
);

if(loginForm instanceof HTMLFormElement){

    loginForm.addEventListener(

        "submit",

        async(event)=>{

            event.preventDefault();

            const email =
            getInput(
                "email"
            ).value.trim();

            const password =
            getInput(
                "password"
            ).value;

            if(
                !email ||
                !password
            ){

                popup(

                    "Missing Information",

                    "Please enter your email and password."

                );

                return;

            }

            loginInProgress =
            true;

            try{

                await signInWithEmailAndPassword(

                    auth,

                    email,

                    password

                );

                goToDashboard();

            }

            catch(error){

                loginInProgress =
                false;

                let message =
                "Login failed.";

                switch(error?.code){

                    case "auth/user-not-found":

                        message =
                        "No account exists with that email.";

                        break;

                    case "auth/wrong-password":

                        message =
                        "Incorrect password.";

                        break;

                    case "auth/invalid-credential":

                        message =
                        "Incorrect email or password.";

                        break;

                    case "auth/user-disabled":

                        message =
                        "This account has been disabled.";

                        break;

                    case "auth/network-request-failed":

                        message =
                        "Network error. Please try again.";

                        break;

                }

                console.error(
                    "Login failed:",
                    error
                );

                popup(

                    "Login Failed",

                    message

                );

            }

        }

    );

}

/* =========================================
   SHARED PROVIDER LOGIN
========================================= */

async function providerLogin(

    providerName,

    loginFunction

){

    loginInProgress =
    true;

    try{

        await loginFunction();

        goToDashboard();

    }

    catch(error){

        loginInProgress =
        false;

        console.error(
            `${providerName} login failed:`,
            error
        );

        let message =
        `Unable to sign in with ${providerName}.`;

        if(
            error?.code ===
            "auth/account-exists-with-different-credential"
        ){

            message =
            `A ZombieOS account already exists with this email. Sign in using your existing login method, then link ${providerName} from your account settings.`;

        }

        else if(
            error?.code ===
            "auth/popup-blocked"
        ){

            message =
            "Your browser blocked the sign-in popup. Allow popups and try again.";

        }

        else if(
            error?.code ===
            "auth/popup-closed-by-user"
        ){

            message =
            "The sign-in window was closed before login finished.";

        }

        else if(
            error?.code ===
            "auth/network-request-failed"
        ){

            message =
            "A network error occurred. Check your connection and try again.";

        }

        popup(

            `${providerName} Login`,

            message

        );

    }

}

/* =========================================
   GOOGLE
========================================= */

document
.getElementById(
    "google-login"
)
?.addEventListener(

    "click",

    ()=>{

        providerLogin(

            "Google",

            signInWithGoogle

        );

    }

);

/* =========================================
   GITHUB
========================================= */

document
.getElementById(
    "github-login"
)
?.addEventListener(

    "click",

    ()=>{

        providerLogin(

            "GitHub",

            signInWithGitHub

        );

    }

);

/* =========================================
   MICROSOFT
========================================= */

document
.getElementById(
    "microsoft-login"
)
?.addEventListener(

    "click",

    ()=>{

        providerLogin(

            "Microsoft",

            signInWithMicrosoft

        );

    }

);

/* =========================================
   DISCORD (COMING SOON)
========================================= */

/*

import {
    signInWithDiscord
} from "./providers.js";

document
.getElementById(
    "discord-login"
)
?.addEventListener(

    "click",

    ()=>{

        providerLogin(

            "Discord",

            signInWithDiscord

        );

    }

);

*/

/* =========================================
   APPLE (COMING SOON)
========================================= */

/*

import {
    signInWithApple
} from "./providers.js";

document
.getElementById(
    "apple-login"
)
?.addEventListener(

    "click",

    ()=>{

        providerLogin(

            "Apple",

            signInWithApple

        );

    }

);

*/