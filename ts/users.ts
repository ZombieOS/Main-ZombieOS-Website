import { db } from "./firebase";

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    runTransaction,
    DocumentReference
} from "firebase/firestore";

/* =========================================
   TYPES
========================================= */

export interface UserSocials{

    youtube:string;

    github:string;

    discord:string;

    instagram:string;

    facebook:string;

    twitter:string;

}

export interface UserSettings{

    publicProfile:boolean;

    displayBadges:boolean;

    zosPlusProfile:boolean;

}

export interface UserDocument{

    userId:number;

    username:string;

    email:string;

    handle:string;

    customHandle:boolean;

    subscription:string;

    badges:string[];

    createdAt:number;

    bio:string;

    pronouns:string;

    profileColor:string;

    lastHandleChange:number;

    socials:UserSocials;

    publicProfile:boolean;

    displayBadges:boolean;

    zosPlusProfile:boolean;

    visibleBadges:Record<string,boolean>;

    accountType: "USER";

}

/* =========================================
   USER ID
========================================= */

export async function getNextUserId():Promise<number>{

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
                    currentUserId:next
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

    uid:string,

    username:string,

    email:string,

    handle?:string,

    accountType:"USER" = "USER"

):Promise<UserDocument>{

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

        return existing.data() as UserDocument;

    }

    const nextUserId =
    await getNextUserId();

    const user:UserDocument={

        userId:nextUserId,

        username:username,

        email:email,

        handle:
        handle ??
        `zos-${nextUserId}`,

        customHandle:
        handle != null,

        subscription:"FREE",

        badges:[
            "PROTOTYPE"
        ],

        createdAt:
        Date.now(),

        bio:"",

        pronouns:"",

        profileColor:"default",

        lastHandleChange:0,

        socials:{

            youtube:"",
            github:"",
            discord:"",
            instagram:"",
            facebook:"",
            twitter:""

        },

        publicProfile:true,

        displayBadges:true,

        zosPlusProfile:false,

        visibleBadges: {
            PROTOTYPE:true
        },
        
        accountType:accountType
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

    uid:string

):Promise<UserDocument | null>{

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

    return snap.data() as UserDocument;

}

/* =========================================
   UPDATE USER
========================================= */

export async function updateUser(

    uid:string,

    updates:Partial<UserDocument>

):Promise<void>{

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

    uid:string

):Promise<void>{

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

    uid:string,

    handle:string

):Promise<void>{

    await updateUser(

        uid,

        {

            handle,

            customHandle:true,

            lastHandleChange:
            Date.now()

        }

    );

}

/* =========================================
   USERNAME
========================================= */

export async function changeUsername(

    uid:string,

    username:string

):Promise<void>{

    await updateUser(

        uid,

        {

            username

        }

    );

}

/* =========================================
   BIO
========================================= */

export async function changeBio(

    uid:string,

    bio:string

):Promise<void>{

    await updateUser(

        uid,

        {

            bio

        }

    );

}

/* =========================================
   PROFILE COLOR
========================================= */

export async function setProfileColor(

    uid:string,

    color:string

):Promise<void>{

    await updateUser(

        uid,

        {

            profileColor:color

        }

    );

}