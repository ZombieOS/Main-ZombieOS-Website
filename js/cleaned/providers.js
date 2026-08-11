import { auth } from "./firebase.js";

import {
    createUserDocument
} from "./users.js";

import {

    GoogleAuthProvider,

    GithubAuthProvider,

    OAuthProvider,

    signInWithPopup

} from "firebase/auth";

/* =========================================
   SHARED AUTH
========================================= */

async function authenticate(

    provider,

    createAccount = false

){

    try{

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

    catch(error){

        console.error(
            "Provider authentication failed:",
            error
        );

        throw error;

    }

}

/* =========================================
   GOOGLE
========================================= */

export async function signInWithGoogle(){

    const provider =
    new GoogleAuthProvider();

    provider.setCustomParameters({

        prompt:
        "select_account"

    });

    return authenticate(
        provider
    );

}

export async function signUpWithGoogle(){

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

export async function signInWithGitHub(){

    const provider =
    new GithubAuthProvider();

    provider.addScope(
        "read:user"
    );

    provider.addScope(
        "user:email"
    );

    return authenticate(
        provider
    );

}

export async function signUpWithGitHub(){

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

export async function signInWithMicrosoft(){

    const provider =
    new OAuthProvider(
        "microsoft.com"
    );

    provider.setCustomParameters({

        prompt:
        "select_account"

    });

    return authenticate(
        provider
    );

}

export async function signUpWithMicrosoft(){

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

export async function signInWithDiscord(){

    const provider =
    new OAuthProvider(
        "discord.com"
    );

    return authenticate(
        provider
    );

}

export async function signUpWithDiscord(){

    const provider =
    new OAuthProvider(
        "discord.com"
    );

    return authenticate(
        provider,
        true
    );

}

*/

/* =========================================
   APPLE
   COMING SOON
========================================= */

/*

export async function signInWithApple(){

    const provider =
    new OAuthProvider(
        "apple.com"
    );

    return authenticate(
        provider
    );

}

export async function signUpWithApple(){

    const provider =
    new OAuthProvider(
        "apple.com"
    );

    return authenticate(
        provider,
        true
    );

}

*/