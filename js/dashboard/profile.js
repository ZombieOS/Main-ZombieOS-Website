import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";"https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDG0hSabeqYdGgSISOgvSnkOwATXDLiV9g",
  authDomain: "zombieos.firebaseapp.com",
  projectId: "zombieos",
  storageBucket: "zombieos.firebasestorage.app",
  messagingSenderId: "577624378484",
  appId: "1:577624378484:web:3e88e693724bde8e89d521"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = (id) => document.getElementById(id);

function setValue(id, value) {
  const el = $(id);
  if (el) el.value = value || "";
}

function setChecked(id, value) {
  const el = $(id);
  if (el) el.checked = !!value;
}

function getValue(id) {
  const el = $(id);
  return el ? el.value.trim() : "";
}

/* MOBILE NAVBAR */

const navbar = $("dashboard-navbar");
const toggleButton = $("mobile-navbar-toggle");

if (navbar && toggleButton) {
  let navbarVisible = true;

  toggleButton.addEventListener("click", () => {
    navbarVisible = !navbarVisible;

    if (navbarVisible) {
      navbar.classList.remove("hidden-navbar");
      toggleButton.textContent = "Hide Menu";
    } else {
      navbar.classList.add("hidden-navbar");
      toggleButton.textContent = "Show Menu";
    }
  });
}

/* AUTH */

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/login";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    alert("Profile data was not found.");
    return;
  }

  const data = userSnap.data();

/* PROFILE PREVIEW */

const previewButton =
document.getElementById(
"profile-preview-button"
);

if(previewButton){

previewButton.href =
`https://social.zombieos.com/@${data.handle}`;

}

  let avatarBase64 = data.avatarBase64 || "";
  let bannerBase64 = data.bannerBase64 || "";

  /* LOAD SAVED IMAGES */

  if (avatarBase64 && $("profile-avatar-preview")) {
    $("profile-avatar-preview").src = avatarBase64;
  }

  if (bannerBase64 && $("profile-banner-preview")) {
    $("profile-banner-preview").src = bannerBase64;
  }

  /* LOAD TEXT DATA */

  setValue("profile-username", data.username);
  setValue("profile-handle", data.handle);
  setValue("profile-bio", data.bio);
  setValue("profile-pronouns", data.pronouns);

  setValue("social-youtube", data.socials?.youtube);
  setValue("social-github", data.socials?.github);
  setValue("social-discord", data.socials?.discord);
  setValue("social-instagram", data.socials?.instagram);
  setValue("social-facebook", data.socials?.facebook);
  setValue("social-twitter", data.socials?.twitter);

  setChecked("toggle-public-profile", data.publicProfile ?? true);
  setChecked("toggle-display-badges", data.displayBadges ?? true);
  setChecked("toggle-zosplus-profile", data.zosPlusProfile ?? false);

  /* IMAGE PREVIEW */

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  function setupImageUpload(inputId, previewId, type) {
    const input = $(inputId);
    const preview = $(previewId);

    if (!input || !preview) return;

    input.addEventListener("change", () => {
      const file = input.files[0];

      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        alert("Image must be 5MB or smaller.");
        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        if (type === "avatar") {
          avatarBase64 = event.target.result;
        }

        if (type === "banner") {
          bannerBase64 = event.target.result;
        }

        preview.src = event.target.result;
      };

      reader.readAsDataURL(file);
    });
  }

  setupImageUpload("avatar-upload", "profile-avatar-preview", "avatar");
  setupImageUpload("banner-upload", "profile-banner-preview", "banner");

  /* BADGE DROPDOWN */

  const displayBadgesToggle = $("toggle-display-badges");
  const badgeOptions = $("badge-display-options");
  const badgeList = $("badge-toggle-list");

  if (displayBadgesToggle && badgeOptions) {
    badgeOptions.style.display = displayBadgesToggle.checked ? "block" : "none";

    displayBadgesToggle.addEventListener("change", () => {
      badgeOptions.style.display = displayBadgesToggle.checked ? "block" : "none";
    });
  }

  if (badgeList) {
    badgeList.innerHTML = "";

    const badges = data.badges || [];

    if (badges.length === 0) {
      badgeList.innerHTML = "<p class='profile-note'>You have no badges.</p>";
    } else {
      badges.forEach((badge) => {
        const badgeEnabled = data.visibleBadges?.[badge] ?? true;

        const badgeRow = document.createElement("div");
        badgeRow.className = "extra-setting-header";

        badgeRow.innerHTML = `
          <span>${badge}</span>

          <label class="switch">
            <input type="checkbox" id="badge-${badge}" ${badgeEnabled ? "checked" : ""}>
            <span class="slider"></span>
          </label>
        `;

        badgeList.appendChild(badgeRow);
      });
    }
  }

  /* ZOS+ SECTION */

  if (data.subscription === "ZOS+" && $("profile-color-section")) {
    $("profile-color-section").style.display = "block";
  }

  /* SAVE */

  const saveButton = $("profile-save-button");

  if (saveButton) {
    saveButton.onclick = async () => {
      const username = getValue("profile-username");
      const handle = getValue("profile-handle").toLowerCase();
      const bio = getValue("profile-bio");
      const pronouns = getValue("profile-pronouns");

      if (!username || !handle) {
        alert("Username and handle are required.");
        return;
      }

      if (handle.includes(" ")) {
        alert("Handles cannot contain spaces.");
        return;
      }

      const blockedWords = [
        "fuck",
        "shit",
        "bitch",
        "sex",
        "porn",
        "nazi",
        "hitler",
        "admin",
        "moderator",
        "official",
        "zombieos",
        "zos"
      ];

      if (!data.bypassUsernameFilter) {
        for (const word of blockedWords) {
          if (
            username.toLowerCase().includes(word) ||
            handle.includes(word)
          ) {
            alert("That username or handle is not allowed.");
            return;
          }
        }
      }

      const lastHandleChange = data.lastHandleChange || 0;
      const daysSinceChange = (Date.now() - lastHandleChange) / 86400000;

      if (handle !== data.handle && daysSinceChange < 30) {
        alert("You can only change your handle once every 30 days.");
        return;
      }

      const visibleBadges = {};

      if (data.badges) {
        data.badges.forEach((badge) => {
          const toggle = $(`badge-${badge}`);
          visibleBadges[badge] = toggle ? toggle.checked : true;
        });
      }

      await updateProfile(user, {
        displayName: username
      });

      await setDoc(
        userRef,
        {
          username,
          handle,
          bio,
          pronouns,

          customHandle:
            handle !== data.handle ? true : data.customHandle || false,

          lastHandleChange:
            handle !== data.handle ? Date.now() : lastHandleChange,

          avatarBase64,
          bannerBase64,

          socials: {
            youtube: getValue("social-youtube"),
            github: getValue("social-github"),
            discord: getValue("social-discord"),
            instagram: getValue("social-instagram"),
            facebook: getValue("social-facebook"),
            twitter: getValue("social-twitter")
          },

          publicProfile: $("toggle-public-profile")?.checked ?? true,
          displayBadges: $("toggle-display-badges")?.checked ?? true,
          zosPlusProfile: $("toggle-zosplus-profile")?.checked ?? false,
          visibleBadges
        },
        {
          merge: true
        }
      );

      alert("Profile saved successfully.");
    };
  }
});