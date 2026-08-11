import { auth, db } from "./firebase.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    GoogleAuthProvider,
    GithubAuthProvider,
    OAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

/* -----------------------------
   Footer
----------------------------- */

const year =
document.getElementById("year");

if(year){

    year.textContent =
    new Date().getFullYear().toString();

}

/* -----------------------------
   Mobile Navbar
----------------------------- */

const toggle =
document.getElementById("navbar-toggle");

const links =
document.getElementById("nav-links");

toggle?.addEventListener(
    "click",
    ()=>{

        if(!links){
            return;
        }

        links.classList.toggle("open");

        toggle.textContent =
        links.classList.contains("open")
        ? "✕ Close"
        : "☰ Menu";

    }
);

/* -----------------------------
   Popup
----------------------------- */

export function showPopup(

    title,

    message,

    onConfirm,

    onCancel

){

    const overlay =
    document.getElementById("popup-overlay");

    const popupTitle =
    document.getElementById("popup-title");

    const popupMessage =
    document.getElementById("popup-message");

    const confirm =
    document.getElementById("popup-confirm");

    const cancel =
    document.getElementById("popup-cancel");

    if(
        !overlay ||
        !popupTitle ||
        !popupMessage ||
        !confirm ||
        !cancel
    ){

        alert(
            title +
            "\n\n" +
            message
        );

        onConfirm?.();

        return;

    }

    popupTitle.textContent =
    title;

    popupMessage.textContent =
    message;

    overlay.classList.add(
        "show"
    );

    confirm.onclick =
    ()=>{

        overlay.classList.remove(
            "show"
        );

        onConfirm?.();

    };

    cancel.onclick =
    ()=>{

        overlay.classList.remove(
            "show"
        );

        onCancel?.();

    };

}

window.showPopup =
showPopup;

/* -----------------------------
   Navbar Account
----------------------------- */

async function setNavbarAccount(

    user,

    userData

){

    const account =
    document.querySelector(
        ".navbar-account"
    );

    if(!account){

        return;

    }

    if(!user){

        account.innerHTML = `
            <a
                href="/login"
                class="nav-button"
            >
                Login
            </a>
        `;

        return;

    }

    const avatar =

        userData?.avatarBase64 ??

        userData?.avatar ??

        userData?.profilePicture ??

        user.photoURL ??

        "/images/favicon.png";

    const badges =
    userData?.badges ?? [];

    account.innerHTML = `
        <div class="profile-menu">

            <img
                id="navbar-pfp"
                class="navbar-pfp"
                src="${avatar}"
                alt="Profile"
            >

            <div
                id="profile-dropdown"
                class="profile-dropdown"
            >

                <a href="https://dashboard.zombieos.com/">
                    Dashboard
                </a>

                <a href="/social">
                    Social
                </a>

                <a href="https://dashboard.zombieos.com/settings">
                    Settings
                </a>

                ${
                    badges.includes("DEV")
                    ? `
                        <a href="https://dashboard.zombieos.com/analytics">
                            Analytics
                        </a>
                    `
                    : ""
                }

                ${
                    badges.includes("STAFF")
                    ? `
                        <a href="/tickets/staff">
                            Staff
                        </a>
                    `
                    : ""
                }

                <button id="logout-button">
                    Logout
                </button>

            </div>

        </div>
    `;

    const pfp =
    document.getElementById(
        "navbar-pfp"
    );

    const dropdown =
    document.getElementById(
        "profile-dropdown"
    );

    const logout =
    document.getElementById(
        "logout-button"
    );
  
    pfp?.addEventListener(

        "click",

        (event)=>{

            event.stopPropagation();

            dropdown?.classList.toggle(
                "show"
            );

        }

    );

    document.addEventListener(

        "click",

        ()=>{

            dropdown?.classList.remove(
                "show"
            );

        }

    );

    logout?.addEventListener(

        "click",

        async()=>{

            try{

                await signOut(
                    auth
                );

            }

            finally{

                window.location.replace(
                    "/"
                );

            }

        }

    );

}

/* -----------------------------
   Auth
----------------------------- */

onAuthStateChanged(

    auth,

    async(user)=>{

        let userData =
        null;

        if(user){

            try{

                const snap =
                await getDoc(

                    doc(

                        db,

                        "users",

                        user.uid

                    )

                );

                if(

                    snap.exists()

                ){

                    userData =
                    snap.data();

                }

            }

            catch(error){

                console.error(

                    "Failed to load user data:",

                    error

                );

            }

        }

        await setNavbarAccount(

            user,

            userData

        );

    }

);