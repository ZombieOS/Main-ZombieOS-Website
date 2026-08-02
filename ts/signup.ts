import { auth } from "./firebase";
import { createUserDocument } from "./users";

import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    updateProfile
} from "firebase/auth";

import { FirebaseError } from "firebase/app";

import {
    signUpWithGoogle,
    signUpWithGitHub,
    signUpWithMicrosoft
} from "./providers";

/* =========================================
   STATE
========================================= */

/*
Prevents the "already logged in" popup from appearing
immediately after this page successfully creates an account.
*/

let signupInProgress = false;

/* =========================================
   ELEMENT HELPERS
========================================= */

function getInput(id: string): HTMLInputElement | null {

    const element = document.getElementById(id);

    if (!(element instanceof HTMLInputElement)) {

        console.error(`Input element not found: #${id}`);

        return null;

    }

    return element;

}

function getButton(id: string): HTMLButtonElement | null {

    const element = document.getElementById(id);

    if (!(element instanceof HTMLButtonElement)) {

        return null;

    }

    return element;

}

/* =========================================
   POPUP
========================================= */

function showMessage(
    title: string,
    message: string,
    onConfirm?: () => void
): void {

    if (window.showPopup) {

        window.showPopup(
            title,
            message,
            onConfirm
        );

        return;

    }

    alert(`${title}\n\n${message}`);

    onConfirm?.();

}

/* =========================================
   VALIDATION
========================================= */

function normalizeHandle(handle: string): string {

    return handle
        .trim()
        .replace(/^@+/, "");

}

function isValidHandle(handle: string): boolean {

    /*
    Allows:
    - letters
    - numbers
    - underscores
    - periods
    - dashes

    Length: 3–30 characters
    */

    return /^[a-zA-Z0-9_.-]{3,30}$/.test(handle);

}

function isValidUsername(username: string): boolean {

    return username.length >= 2 &&
           username.length <= 32;

}

function getFirebaseMessage(error: unknown): string {

    if (!(error instanceof FirebaseError)) {

        return "An unexpected error occurred while creating your account.";

    }

    switch (error.code) {

        case "auth/email-already-in-use":
            return "An account already exists with that email.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/weak-password":
            return "Your password is too weak. Use at least six characters.";

        case "auth/operation-not-allowed":
            return "Email and password signup is not currently enabled.";

        case "auth/network-request-failed":
            return "A network error occurred. Check your connection and try again.";

        case "auth/popup-blocked":
            return "Your browser blocked the signup popup. Allow popups and try again.";

        case "auth/popup-closed-by-user":
            return "The signup window was closed before signup finished.";

        case "auth/account-exists-with-different-credential":
            return "That email is already connected to another login provider.";

        default:
            return error.message || "Account creation failed.";

    }

}

/* =========================================
   REDIRECT
========================================= */

function goToDashboard(): void {

    window.location.href =
        "https://dashboard.zombieos.com/";

}

/* =========================================
   ALREADY LOGGED IN CHECK
========================================= */

onAuthStateChanged(
    auth,
    (user) => {

        if (!user || signupInProgress) {

            return;

        }

        showMessage(
            "Already Signed In",
            "You are already signed into a ZombieOS account. Log out before creating another account.",
            goToDashboard
        );

    }
);

/* =========================================
   EMAIL / PASSWORD SIGNUP
========================================= */

const signupForm =
    document.getElementById("signup-form");

if (signupForm instanceof HTMLFormElement) {

    signupForm.addEventListener(
        "submit",
        async (event: SubmitEvent) => {

            event.preventDefault();

            const usernameInput =
                getInput("username");

            const handleInput =
                getInput("handle");

            const emailInput =
                getInput("email");

            const passwordInput =
                getInput("password");

            if (
                !usernameInput ||
                !handleInput ||
                !emailInput ||
                !passwordInput
            ) {

                showMessage(
                    "Signup Error",
                    "One or more required signup fields could not be found."
                );

                return;

            }

            const username =
                usernameInput.value.trim();

            const handle =
                normalizeHandle(
                    handleInput.value
                );

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;

            if (
                !username ||
                !handle ||
                !email ||
                !password
            ) {

                showMessage(
                    "Missing Information",
                    "Please fill out every required field."
                );

                return;

            }

            if (!isValidUsername(username)) {

                showMessage(
                    "Invalid Username",
                    "Your username must contain between 2 and 32 characters."
                );

                return;

            }

            if (!isValidHandle(handle)) {

                showMessage(
                    "Invalid Handle",
                    "Handles must contain 3–30 letters, numbers, periods, underscores, or dashes."
                );

                return;

            }

            signupInProgress = true;

            try {

                const credential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );

                const user =
                    credential.user;

                await updateProfile(
                    user,
                    {
                        displayName: username
                    }
                );

                await createUserDocument(
                    user.uid,
                    username,
                    email,
                    handle
                );

                goToDashboard();

            } catch (error: unknown) {

                signupInProgress = false;

                console.error(
                    "Email signup failed:",
                    error
                );

                showMessage(
                    "Signup Failed",
                    getFirebaseMessage(error)
                );

            }

        }
    );

}

/* =========================================
   SHARED PROVIDER HANDLER
========================================= */

async function handleProviderSignup(
    providerName: string,
    signupFunction: () => Promise<unknown>
): Promise<void> {

    signupInProgress = true;

    try {

        await signupFunction();

        goToDashboard();

    } catch (error: unknown) {

        signupInProgress = false;

        console.error(
            `${providerName} signup failed:`,
            error
        );

        showMessage(
            `${providerName} Signup Failed`,
            getFirebaseMessage(error)
        );

    }

}

/* =========================================
   GOOGLE
========================================= */

const googleButton =
    getButton("google-signup");

googleButton?.addEventListener(
    "click",
    () => handleProviderSignup(
        "Google",
        signUpWithGoogle
    )
);

/* =========================================
   GITHUB
========================================= */

const githubButton =
    getButton("github-signup");

githubButton?.addEventListener(
    "click",
    () => handleProviderSignup(
        "GitHub",
        signUpWithGitHub
    )
);

/* =========================================
   MICROSOFT
========================================= */

const microsoftButton =
    getButton("microsoft-signup");

microsoftButton?.addEventListener(
    "click",
    () => handleProviderSignup(
        "Microsoft",
        signUpWithMicrosoft
    )
);

/* =========================================
   DISCORD — COMING LATER
========================================= */

/*

import {
    signUpWithDiscord
} from "./providers";

const discordButton =
    getButton("discord-signup");

discordButton?.addEventListener(
    "click",
    () => handleProviderSignup(
        "Discord",
        signUpWithDiscord
    )
);

*/

/* =========================================
   APPLE — COMING LATER
========================================= */

/*

import {
    signUpWithApple
} from "./providers";

const appleButton =
    getButton("apple-signup");

appleButton?.addEventListener(
    "click",
    () => handleProviderSignup(
        "Apple",
        signUpWithApple
    )
);

*/