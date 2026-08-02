import { auth } from "./firebase";

import {
    onAuthStateChanged,
    signInWithEmailAndPassword
} from "firebase/auth";

import { FirebaseError } from "firebase/app";

import {
    signInWithGoogle,
    signInWithGitHub,
    signInWithMicrosoft
} from "./providers";

/* =========================================
   HELPERS
========================================= */

function getInput(
    id:string
):HTMLInputElement{

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

    title:string,

    message:string,

    callback?:()=>void

):void{

    if(window.showPopup){

        window.showPopup(
            title,
            message,
            callback
        );

        return;

    }

    alert(
        `${title}\n\n${message}`
    );

    callback?.();

}

function goToDashboard():void{

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

                if(error instanceof FirebaseError){

                    switch(error.code){

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

                }

                console.error(error);

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

    providerName:string,

    loginFunction:()=>Promise<unknown>

):Promise<void>{

    loginInProgress =
    true;

    try{

        await loginFunction();

        goToDashboard();

    }

    catch(error){

        loginInProgress =
        false;

        console.error(error);

        popup(

            `${providerName} Login`,

            `Unable to sign in with ${providerName}.`

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

} from "./providers";

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

} from "./providers";

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