import { auth } from "./firebase";

import { createUserDocument } from "./users";

import {

    GoogleAuthProvider,

    GithubAuthProvider,

    OAuthProvider,

    signInWithPopup,

    User

} from "firebase/auth";

/* =========================================
   SHARED AUTH
========================================= */

async function authenticate(

    provider:
        GoogleAuthProvider |
        GithubAuthProvider |
        OAuthProvider,

    createAccount:boolean = false

):Promise<User>{

    const result =
    await signInWithPopup(
        auth,
        provider
    );

    const user =
    result.user;

    if(createAccount){

        await createUserDocument(

            user.uid,

            user.displayName ??
            user.email?.split("@")[0] ??
            "ZombieOS User",

            user.email ?? ""

        );

    }

    return user;

}

/* =========================================
   GOOGLE
========================================= */

export async function signInWithGoogle():Promise<User>{

    const provider =
    new GoogleAuthProvider();

    provider.setCustomParameters({

        prompt:
        "select_account"

    });

    return authenticate(
        provider,
        false
    );

}

export async function signUpWithGoogle():Promise<User>{

    const provider =
    new GoogleAuthProvider();

    provider.setCustomParameters({

        prompt:
        "select_account"

    });

    return authenticate(
        provider,
        true
    );

}

/* =========================================
   GITHUB
========================================= */

export async function signInWithGitHub():Promise<User>{

    const provider =
    new GithubAuthProvider();

    provider.addScope(
        "read:user"
    );

    provider.addScope(
        "user:email"
    );

    return authenticate(
        provider,
        false
    );

}

export async function signUpWithGitHub():Promise<User>{

    const provider =
    new GithubAuthProvider();

    provider.addScope(
        "read:user"
    );

    provider.addScope(
        "user:email"
    );

    return authenticate(
        provider,
        true
    );

}

/* =========================================
   MICROSOFT
========================================= */

export async function signInWithMicrosoft():Promise<User>{

    const provider =
    new OAuthProvider(
        "microsoft.com"
    );

    provider.setCustomParameters({

        prompt:
        "select_account"

    });

    return authenticate(
        provider,
        false
    );

}

export async function signUpWithMicrosoft():Promise<User>{

    const provider =
    new OAuthProvider(
        "microsoft.com"
    );

    provider.setCustomParameters({

        prompt:
        "select_account"

    });

    return authenticate(
        provider,
        true
    );

}

/* =========================================
   DISCORD
   COMING SOON
========================================= */

/*

import {

OAuthProvider

} from "firebase/auth";

export async function signInWithDiscord(){

    const provider =
    new OAuthProvider(
        "discord.com"
    );

}

export async function signUpWithDiscord(){

    const provider =
    new OAuthProvider(
        "discord.com"
    );

}

*/

/* =========================================
   APPLE
   COMING SOON
========================================= */

/*

import {

OAuthProvider

} from "firebase/auth";

export async function signInWithApple(){

    const provider =
    new OAuthProvider(
        "apple.com"
    );

}

export async function signUpWithApple(){

    const provider =
    new OAuthProvider(
        "apple.com"
    );

}

*/