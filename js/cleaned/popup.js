/* =========================================
   SIMPLE POPUP
========================================= */

export function showPopup(

    title,

    message,

    onConfirm,

    onCancel

){

    const overlay =
    document.getElementById(
        "popup-overlay"
    );

    const popupTitle =
    document.getElementById(
        "popup-title"
    );

    const popupMessage =
    document.getElementById(
        "popup-message"
    );

    const confirm =
    document.getElementById(
        "popup-confirm"
    );

    const cancel =
    document.getElementById(
        "popup-cancel"
    );

    if(

        !overlay ||

        !popupTitle ||

        !popupMessage ||

        !confirm ||

        !cancel

    ){

        alert(

            `${title}\n\n${message}`

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

/* =========================================
   CHANGELOG POPUP
========================================= */

export function showChangelog(

    versionData = {}

){

    const dialog =
    document.getElementById(
        "changelog-dialog"
    );

    const version =
    document.getElementById(
        "changelog-version"
    );

    const channel =
    document.getElementById(
        "changelog-channel"
    );

    const content =
    document.getElementById(
        "changelog-content"
    );

    if(

        !dialog ||

        !version ||

        !channel ||

        !content

    ){

        console.error(

            "Missing changelog popup HTML."

        );

        return;

    }

    version.textContent =

        versionData.version

        ?

        `ZombieOS ${versionData.version}`

        :

        "ZombieOS";

    channel.className =
    "changelog-channel";

    if(versionData.channel){

        channel.textContent =
        versionData.channel;

        channel.classList.add(

            versionData
            .channel
            .toLowerCase()

        );

    }

    else{

        channel.textContent =
        "";

    }

    const log =

        Array.isArray(

            versionData.changelog

        )

        ?

        versionData.changelog

        :

        [];

    if(

        log.length === 0

    ){

        content.innerHTML =

        `

        <div class="changelog-empty">

            No Change Logs Provided

        </div>

        `;

    }

    else{

        content.innerHTML =

        renderChangelog(
            log
        );

    }

    dialog.showModal();

}

/* =========================================
   CLOSE CHANGELOG
========================================= */

export function closeChangelog(){

    const dialog =
    document.getElementById(
        "changelog-dialog"
    );

    if(

        dialog?.open

    ){

        dialog.close();

    }

}

/* =========================================
   CHANGELOG RENDERER
========================================= */

function renderChangelog(

    changelog

){

    return changelog

        .map(

            renderLine

        )

        .join("");

}

/* =========================================
   LINE RENDERER
========================================= */

function renderLine(

    rawLine

){

    const line =

        String(
            rawLine ?? ""
        )
        .trim();

    if(
        line === ""
    ){

        return "<br>";

    }

    if(

        line.startsWith(
            "[TITLE]"
        )

    ){

        return `

<h1 class="change-title">

${formatInline(

line.substring(7).trim()

)}

</h1>

`;

    }

    if(

        line.startsWith(
            "[SUBTITLE]"
        )

    ){

        return `

<h2 class="change-subtitle">

${formatInline(

line.substring(10).trim()

)}

</h2>

`;

    }

    if(

        line.startsWith(
            "[HEADING]"
        )

    ){

        return `

<h3 class="change-heading">

${formatInline(

line.substring(9).trim()

)}

</h3>

`;

    }

    if(

        line.startsWith(
            "[BULLET]"
        )

    ){

        return renderBullet(

            line.substring(8).trim(),

            0

        );

    }

    const nested =

        line.match(

            /^\[BULLET-in(\d+)\](.*)$/i

        );

    if(

        nested

    ){

        return renderBullet(

            nested[2].trim(),

            Number(
                nested[1]
            )

        );

    }

    return renderTaggedLine(
        line
    );

}

/* =========================================
   TAGGED LINES
========================================= */

function renderTaggedLine(

    line

){

    const tags = {

        "[NEW]":[
            "new",
            "NEW"
        ],

        "[FIX]":[
            "fix",
            "FIX"
        ],

        "[REMOVE]":[
            "remove",
            "REMOVED"
        ],

        "[WARNING]":[
            "warning",
            "WARNING"
        ],

        "[IMPORTANT]":[
            "important",
            "IMPORTANT"
        ],

        "[BREAKING]":[
            "breaking",
            "BREAKING"
        ]

    };

    for(

        const tag
        in tags

    ){

        if(

            line.startsWith(
                tag
            )

        ){

            const info =
            tags[tag];

            return renderSpecial(

                info[0],

                info[1],

                line
                .substring(
                    tag.length
                )
                .trim()

            );

        }

    }

    return `

<p class="change-text">

${formatInline(line)}

</p>

`;

}

/* =========================================
   BULLETS
========================================= */

function renderBullet(

    text,

    level

){

    const indent =

        Math.max(

            0,

            Math.min(
                level,
                8
            )

        );

    return `

<div

class="change-bullet"

style="padding-left:${indent*28}px"

>

<span
class="change-bullet-dot"
>

•

</span>

<div
class="change-bullet-text"
>

${formatInline(text)}

</div>

</div>

`;

}

/* =========================================
   SPECIAL LINES
========================================= */

function renderSpecial(

    type,

    label,

    text

){

    return `

<div
class="change-special ${type}"
>

<span
class="change-special-label"
>

${label}

</span>

<div
class="change-special-text"
>

${formatInline(text)}

</div>

</div>

`;

}

/* =========================================
   INLINE FORMATTING
========================================= */

function formatInline(

    text

){

    let formatted =
    escapeHtml(
        text
    );

    /* [BOLD]text[/BOLD] */

    formatted =
    formatted.replace(

        /\[BOLD\]([\s\S]*?)\[\/BOLD\]/gi,

        "<strong>$1</strong>"

    );

    return formatted;

}

/* =========================================
   HTML ESCAPING
========================================= */

function escapeHtml(

    value

){

    return String(
        value ?? ""
    ).replace(

        /[&<>"']/g,

        (character)=>({

            "&":"&amp;",

            "<":"&lt;",

            ">":"&gt;",

            '"':"&quot;",

            "'":"&#039;"

        })[character]

    );

}

/* =========================================
   CHANGELOG EVENTS
========================================= */

document.addEventListener(

    "click",

    (event)=>{

        const dialog =
        document.getElementById(
            "changelog-dialog"
        );

        if(!dialog){

            return;

        }

        const closeButton =
        event.target.closest(
            "#changelog-close"
        );

        if(closeButton){

            closeChangelog();

            return;

        }

        if(

            event.target === dialog

        ){

            closeChangelog();

        }

    }

);

/* =========================================
   ESC KEY / DIALOG CLEANUP
========================================= */

document.addEventListener(

    "cancel",

    (event)=>{

        if(

            event.target?.id ===
            "changelog-dialog"

        ){

            event.preventDefault();

            closeChangelog();

        }

    },

    true

);

/* =========================================
   GLOBAL ACCESS

   Keeps older website files working while
   the site is being cleaned and migrated.
========================================= */

window.showPopup =
showPopup;

window.showChangelog =
showChangelog;

window.closeChangelog =
closeChangelog;