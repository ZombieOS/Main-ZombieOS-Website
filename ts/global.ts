import { auth, db } from "./firebase";

import {
    onAuthStateChanged,
    signOut,
    type User
} from "firebase/auth";

import {
    doc,
    getDoc,
    type DocumentData
} from "firebase/firestore";

console.log("GLOBAL TS LOADED");

/* -----------------------------
   Types
----------------------------- */

interface UserData {

    avatarBase64?: string;
    avatar?: string;
    profilePicture?: string;

    badges?: string[];

}

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
document.getElementById("navbar-toggle") as HTMLButtonElement | null;

const links =
document.getElementById("nav-links");

toggle?.addEventListener("click",()=>{

    if(!links){
        return;
    }

    links.classList.toggle("open");

    toggle.textContent =
    links.classList.contains("open")
    ? "✕ Close"
    : "☰ Menu";

});

/* -----------------------------
   Popup
----------------------------- */

export function showPopup(

    title:string,

    message:string,

    onConfirm?:()=>void,

    onCancel?:()=>void

){

    const overlay =
    document.getElementById("popup-overlay");

    const popupTitle =
    document.getElementById("popup-title");

    const popupMessage =
    document.getElementById("popup-message");

    const confirm =
    document.getElementById("popup-confirm") as HTMLButtonElement | null;

    const cancel =
    document.getElementById("popup-cancel") as HTMLButtonElement | null;

    if(
        !overlay ||
        !popupTitle ||
        !popupMessage ||
        !confirm ||
        !cancel
    ){
        alert(title + "\n\n" + message);
        return;
    }

    popupTitle.textContent = title;
    popupMessage.textContent = message;

    overlay.classList.add("show");

    confirm.onclick = ()=>{

        overlay.classList.remove("show");

        onConfirm?.();

    };

    cancel.onclick = ()=>{

        overlay.classList.remove("show");

        onCancel?.();

    };

}

(window as any).showPopup = showPopup;

/* -----------------------------
   Navbar Account
----------------------------- */

async function setNavbarAccount(

    user:User | null,

    userData:UserData | null

){

    const account =
    document.querySelector(".navbar-account");

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
        userData?.avatarBase64 ||
        userData?.avatar ||
        userData?.profilePicture ||
        user.photoURL ||
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

                <a href="/dashboard">Dashboard</a>

                <a href="/social">Social</a>

                <a href="/dashboard/settings">Settings</a>

                ${
                    badges.includes("DEV")
                    ? `<a href="/analytics">Analytics</a>`
                    : ""
                }

                ${
                    badges.includes("STAFF")
                    ? `<a href="/tickets/staff">Staff</a>`
                    : ""
                }

                <button id="logout-button">
                    Logout
                </button>

            </div>

        </div>
    `;

    const pfp =
    document.getElementById("navbar-pfp");

    const dropdown =
    document.getElementById("profile-dropdown");

    const logout =
    document.getElementById("logout-button");

    pfp?.addEventListener("click",(event)=>{

        event.stopPropagation();

        dropdown?.classList.toggle("show");

    });

    document.addEventListener("click",()=>{

        dropdown?.classList.remove("show");

    });

    logout?.addEventListener("click",async()=>{

        await signOut(auth);

        window.location.href="/";

    });

}

/* -----------------------------
   Auth
----------------------------- */

onAuthStateChanged(

    auth,

    async(user)=>{

        let userData:UserData | null = null;

        if(user){

            const snap =
            await getDoc(
                doc(
                    db,
                    "users",
                    user.uid
                )
            );

            if(snap.exists()){

                userData =
                snap.data() as UserData;

            }

        }

        await setNavbarAccount(
            user,
            userData
        );

    }

);