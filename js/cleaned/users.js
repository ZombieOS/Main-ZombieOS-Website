import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    runTransaction
} from "firebase/firestore";

/* =========================================
   USER ID
========================================= */

export async function getNextUserId(){

    const counterRef =
    doc(
        db,
        "system",
        "counters"
    );

    const nextId =
    await runTransaction(

        db,

        async(transaction)=>{

            const counter =
            await transaction.get(
                counterRef
            );

            let current =
            0;

            if(counter.exists()){

                current =
                counter.data().currentUserId ?? 0;

            }

            const next =
            current + 1;

            transaction.set(

                counterRef,

                {
                    currentUserId:
                    next
                },

                {
                    merge:true
                }

            );

            return next;

        }

    );

    return nextId;

}

/* =========================================
   CREATE USER
========================================= */

export async function createUserDocument(

    uid,

    username,

    email,

    handle,

    accountType = "USER"

){

    const userRef =
    doc(
        db,
        "users",
        uid
    );

    const existing =
    await getDoc(
        userRef
    );

    if(existing.exists()){

        return existing.data();

    }

    const nextUserId =
    await getNextUserId();

    const user = {

        userId:
        nextUserId,

        username:
        username,

        email:
        email,

        handle:
        handle ??
        `zos-${nextUserId}`,

        customHandle:
        handle != null,

        subscription:
        "FREE",

        badges:[
            "PROTOTYPE"
        ],

        createdAt:
        Date.now(),

        bio:
        "",

        pronouns:
        "",

        profileColor:
        "default",

        lastHandleChange:
        0,

        socials:{

            youtube:"",
            github:"",
            discord:"",
            instagram:"",
            facebook:"",
            twitter:""

        },

        publicProfile:
        true,

        displayBadges:
        true,

        zosPlusProfile:
        false,

        visibleBadges:{

            PROTOTYPE:
            true

        },

        accountType:
        accountType

    };

    await setDoc(
        userRef,
        user
    );

    return user;

}

/* =========================================
   GET USER
========================================= */

export async function getUser(

    uid

){

    const snap =
    await getDoc(

        doc(
            db,
            "users",
            uid
        )

    );

    if(!snap.exists()){

        return null;

    }

    return snap.data();

}

/* =========================================
   UPDATE USER
========================================= */

export async function updateUser(

    uid,

    updates

){

    await updateDoc(

        doc(
            db,
            "users",
            uid
        ),

        updates

    );

}

/* =========================================
   DELETE USER
========================================= */

export async function deleteUser(

    uid

){

    await deleteDoc(

        doc(
            db,
            "users",
            uid
        )

    );

}

/* =========================================
   HANDLE
========================================= */

export async function changeHandle(

    uid,

    handle

){

    await updateUser(

        uid,

        {

            handle:
            handle,

            customHandle:
            true,

            lastHandleChange:
            Date.now()

        }

    );

}

/* =========================================
   USERNAME
========================================= */

export async function changeUsername(

    uid,

    username

){

    await updateUser(

        uid,

        {

            username:
            username

        }

    );

}

/* =========================================
   BIO
========================================= */

export async function changeBio(

    uid,

    bio

){

    await updateUser(

        uid,

        {

            bio:
            bio

        }

    );

}

/* =========================================
   PROFILE COLOR
========================================= */

export async function setProfileColor(

    uid,

    color

){

    await updateUser(

        uid,

        {

            profileColor:
            color

        }

    );

}