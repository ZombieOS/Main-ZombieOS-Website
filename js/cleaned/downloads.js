import { auth, db } from "/js/cleaned/firebase.js";

import {
    onAuthStateChanged
} from "firebase/auth";

import {
    showPopup,
    showChangelog
} from "/js/cleaned/popup.js";

import {
    doc,
    getDoc
} from "firebase/firestore";

/* =========================================
   RELEASES
========================================= */

const Releases = {

    stable:{

        version:"A27.0.0.0",

        channel:"Stable",

        download:
        "",

        changelog:[

            "[TITLE]ZombieOS 0.0.0",

            "[SUBTITLE]A27.0.0.0 is not released yet."

        ]

    },

    release:{

        version:"A27.0.0.0",

        channel:"Release",

        download:
        "",

        changelog:[

            "[TITLE]ZombieOS A27.0.0.0",
            "[SUBTITLE]A27.0.0.0 is not released yet."
        ]

    },

    development:{

        version:"A27.0.0.0",

        channel:"Development",

        download:
        "",

        changelog:[

            "[TITLE]ZombieOS Development Build",

            "[SUBTITLE]A27.0.0.0 is not released yet."

        ]

    }

};

/* =========================================
   ELEMENTS
========================================= */

const stableVersion =
document.getElementById(
    "stable-version"
);

const releaseVersion =
document.getElementById(
    "release-version"
);

const developmentVersion =
document.getElementById(
    "development-version"
);

const stableDownload =
document.getElementById(
    "stable-download"
);

const releaseDownload =
document.getElementById(
    "release-download"
);

const developmentDownload =
document.getElementById(
    "development-download"
);

/* =========================================
   LOAD RELEASES
========================================= */

function loadRelease(

    release,

    prefix

){

    document.getElementById(
        `${prefix}-version`
    ).textContent =
    release.version;

    document.getElementById(
        `${prefix}-download`
    ).href =
    release.download;

}

loadRelease(
    Releases.stable,
    "stable"
);

loadRelease(
    Releases.release,
    "release"
);

loadRelease(
    Releases.development,
    "development"
);

/* =========================================
   CHANGELOG
========================================= */

function openChangelog(

    release

){

    /*
    Will hook into the
    changelog system later.
    */

    console.log(
        release.changelog
    );

}

document
.getElementById(
    "stable-changelog"
)
?.addEventListener(

    "click",

    ()=>{

        showChangelog(
            Releases.stable
        );

    }

);

document
.getElementById(
    "release-changelog"
)
?.addEventListener(

    "click",

    ()=>{

        showChangelog(
            Releases.release
        );

    }

);

document
.getElementById(
    "development-changelog"
)
?.addEventListener(

    "click",

    ()=>{

        showChangelog(
            Releases.development
        );

    }

);

/* =========================================
   DEV ACCESS
========================================= */

function lockDevelopmentButton(

    locked

){

    if(!developmentDownload){

        return;

    }

    if(locked){

        developmentDownload.classList.add(
            "disabled"
        );

        developmentDownload.removeAttribute(
            "href"
        );

        developmentDownload.innerHTML = `

<i class="fa-solid fa-lock"></i>

<span>

Developer Access Required

</span>

`;

        developmentDownload.onclick =
        ()=>{

            showPopup(

                "Developer Program",

                "Development builds are only available to members of the ZombieOS Developer Program."

            );

        };

        return;

    }

    developmentDownload.classList.remove(
        "disabled"
    );

    developmentDownload.href =
    Releases.development.download;

    developmentDownload.innerHTML = `

<i class="fa-solid fa-download"></i>

<span>

Download Development Build

</span>

`;

    developmentDownload.onclick =
    null;

}

/* =========================================
   AUTH
========================================= */

onAuthStateChanged(

    auth,

    async(user)=>{

        if(!user){

            lockDevelopmentButton(
                true
            );

            return;

        }

        try{

            const snap =
            await getDoc(

                doc(
                    db,
                    "users",
                    user.uid
                )

            );

            if(!snap.exists()){

                lockDevelopmentButton(
                    true
                );

                return;

            }

            const badges =
            snap.data().badges ?? [];

            lockDevelopmentButton(

                !badges.includes(
                    "DEV"
                )

            );

        }

        catch(error){

            console.error(
                error
            );

            lockDevelopmentButton(
                true
            );

        }

    }

);