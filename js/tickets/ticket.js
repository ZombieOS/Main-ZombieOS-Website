import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

import {
getAuth,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
getFirestore,
doc,
getDoc,
setDoc,
onSnapshot
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
apiKey:"AIzaSyDG0hSabeqYdGgSISOgvSnkOwATXDLiV9g",
authDomain:"zombieos.firebaseapp.com",
projectId:"zombieos",
storageBucket:"zombieos.firebasestorage.app",
messagingSenderId:"577624378484",
appId:"1:577624378484:web:3e88e693724bde8e89d521"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function $(id){
return document.getElementById(id);
}

const params = new URLSearchParams(window.location.search);
const ticketId = params.get("id");

const ticketTitle = $("ticket-title");
const ticketMeta = $("ticket-meta");
const ticketStatus = $("ticket-status");
const ticketMessages = $("ticket-messages");
const replyBox = $("ticket-reply");
const sendButton = $("send-reply-button");
const staffCommands = $("staff-commands");
const claimButton = $("claim-ticket");
const typingIndicator = $("typing-indicator");
const imageUpload = $("ticket-image-upload");
const tabName = $("tab-title");
const uploadLimitText = $("upload-limit-text");
const uploadTierBadge = $("upload-tier-badge");
const popupLayer = $("zos-popup-layer");

if(tabName && ticketId){
tabName.textContent = "Ticket - " + ticketId + " - ZombieOS";
}

/* POPUPS */

function showPopup(title,message,type){
const popup = document.createElement("div");
popup.className = "zos-popup " + (type || "info");

popup.innerHTML =
"<h3>" + escapeHTML(title) + "</h3>" +
"<p>" + escapeHTML(message) + "</p>";

popupLayer.appendChild(popup);

setTimeout(function(){
popup.remove();
},4000);
}

/* MOBILE NAV */

const mobileToggle = $("mobile-navbar-toggle");
const navbar = $("dashboard-navbar");

let navbarVisible = true;

if(mobileToggle && navbar){

mobileToggle.onclick = function(){

navbarVisible = !navbarVisible;

if(navbarVisible){
navbar.classList.remove("hidden");
mobileToggle.textContent = "Hide Menu";
}else{
navbar.classList.add("hidden");
mobileToggle.textContent = "Show Menu";
}

};

}

/* HELPERS */

function hasStaffBadge(userData){
const badges = userData.badges || [];

for(let i = 0; i < badges.length; i++){
if(String(badges[i]).toUpperCase() === "STAFF"){
return true;
}
}

return false;
}

function getSubscriptionTier(userData){
const rawTier =
userData.subscriptionTier ||
userData.subscription ||
"FREE";

const tier = String(rawTier).toUpperCase();

if(tier === "BASIC" || tier === "ZOS+ BASIC"){
return "BASIC";
}

if(tier === "ZOS+" || tier === "ZOSPLUS" || tier === "PLUS"){
return "ZOSPLUS";
}

return "FREE";
}

function getUploadLimit(userData){
const tier = getSubscriptionTier(userData);

if(tier === "BASIC"){
return 4 * 1024 * 1024;
}

if(tier === "ZOSPLUS"){
return 8 * 1024 * 1024;
}

return 2 * 1024 * 1024;
}

function formatBytes(bytes){
const mb = bytes / 1024 / 1024;
return mb + " MB";
}

function setupUploadLimitUI(userData){
const tier = getSubscriptionTier(userData);
const limit = getUploadLimit(userData);

uploadLimitText.textContent = formatBytes(limit);

if(tier === "BASIC"){
uploadTierBadge.style.display = "inline-flex";
uploadTierBadge.textContent = "BASIC";
}else if(tier === "ZOSPLUS"){
uploadTierBadge.style.display = "inline-flex";
uploadTierBadge.textContent = "ZOS+";
}else{
uploadTierBadge.style.display = "none";
uploadTierBadge.textContent = "";
}
}

function userUses24HourTime(){
const test = new Intl.DateTimeFormat(undefined,{hour:"numeric"}).format(new Date(2026,0,1,13,0));
return test.indexOf("13") !== -1;
}

function formatTime(timestamp){
const date = new Date(timestamp);
const uses24 = userUses24HourTime();

return date.toLocaleTimeString([],{
hour:"numeric",
minute:"2-digit",
hour12:!uses24
});
}

function formatDiscordDate(timestamp){
const date = new Date(timestamp);
const now = new Date();

const today = new Date(now.getFullYear(),now.getMonth(),now.getDate());
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

const messageDay = new Date(date.getFullYear(),date.getMonth(),date.getDate());
const time = formatTime(timestamp);

if(messageDay.getTime() === today.getTime()){
return "Today at " + time;
}

if(messageDay.getTime() === yesterday.getTime()){
return "Yesterday at " + time;
}

return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + ", at " + time;
}

function escapeHTML(text){
return String(text || "")
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#039;");
}

function getBadgeHTML(role){
if(role === "BOT"){
return '<span class="ticket-badge bot-badge">BOT</span>';
}

if(role === "SUPPORT"){
return '<span class="ticket-badge support-badge">SUPPORT</span>';
}

if(role === "SYSTEM"){
return '<span class="ticket-badge system-badge">SYSTEM</span>';
}

return "";
}

function getAvatarForMessage(msg,currentUserData){
if(msg.role === "BOT" || msg.role === "SYSTEM"){
return "/images/favicon.png";
}

if(msg.avatarBase64){
return msg.avatarBase64;
}

return currentUserData.avatarBase64 || "/images/default-avatar.png";
}

function getAIResponse(prompt){
const normalized = prompt.toLowerCase().replace(/[^\w\s+]/g,"");

if(
normalized.indexOf("password") !== -1 ||
normalized.indexOf("forgot") !== -1 ||
normalized.indexOf("reset") !== -1 ||
normalized.indexOf("login") !== -1 ||
normalized.indexOf("sign in") !== -1 ||
normalized.indexOf("signin") !== -1
){
return 'You can reset your password from the login page using the "Forgot Password" option or from Dashboard Settings if you are already signed in.';
}

if(
normalized.indexOf("zos+") !== -1 ||
normalized.indexOf("zos plus") !== -1 ||
normalized.indexOf("buy") !== -1 ||
normalized.indexOf("purchase") !== -1 ||
normalized.indexOf("payment") !== -1 ||
normalized.indexOf("checkout") !== -1 ||
normalized.indexOf("stripe") !== -1 ||
normalized.indexOf("card") !== -1 ||
normalized.indexOf("money") !== -1
){
return "If you cannot purchase ZOS+, your card vendor may not currently support Stripe or there may not be enough funds available on the payment method.";
}

if(
normalized.indexOf("child") !== -1 ||
normalized.indexOf("kid") !== -1 ||
normalized.indexOf("parent") !== -1 ||
normalized.indexOf("family") !== -1
){
return "There are tutorials for almost everything on the official ZombieOS YouTube channel, including child account setup tutorials.";
}

return "I'm sorry, I could not find an answer for that question yet.";
}

function fileToBase64(file){
return new Promise(function(resolve,reject){
const reader = new FileReader();

reader.onload = function(event){
resolve(event.target.result);
};

reader.onerror = function(){
reject("Image upload failed.");
};

reader.readAsDataURL(file);
});
}

/* AUTH */

onAuthStateChanged(auth,async function(user){

if(!user){
window.location.href = "/login";
return;
}

if(!ticketId){
showPopup("Missing Ticket","No ticket ID was provided.","error");
window.location.href = "/tickets";
return;
}

const userRef = doc(db,"users",user.uid);
const userSnap = await getDoc(userRef);

if(!userSnap.exists()){
showPopup("Profile Missing","Your user profile could not be loaded.","error");
return;
}

const userData = userSnap.data();
const username = userData.username || user.displayName || "Unknown User";
const isStaff = hasStaffBadge(userData);

setupUploadLimitUI(userData);

const ticketRef = doc(db,"tickets",ticketId);

let currentTicket = null;
let selectedImageBase64 = "";
let typingTimeout = null;

/* IMAGE UPLOAD */

if(imageUpload){

imageUpload.onchange = async function(){

const file = imageUpload.files[0];

if(!file){
return;
}

const uploadLimit = getUploadLimit(userData);

if(file.size > uploadLimit){
showPopup(
"Upload Failed",
"This image exceeds your " + formatBytes(uploadLimit) + " upload limit.",
"error"
);

imageUpload.value = "";
return;
}

try{
selectedImageBase64 = await fileToBase64(file);
showPopup("Image Added","Send your message to post the image.","success");
}catch(error){
showPopup("Upload Failed","Image could not be processed.","error");
}

};

}

/* TYPING */

function updateTyping(isTyping){

if(!currentTicket){
return;
}

const typing = JSON.parse(JSON.stringify(currentTicket.typing || {}));

if(isTyping){
typing[user.uid] = username;
}else{
delete typing[user.uid];
}

setDoc(ticketRef,{typing:typing},{merge:true});

}

if(replyBox){

replyBox.addEventListener("input",function(){

updateTyping(true);

if(typingTimeout){
clearTimeout(typingTimeout);
}

typingTimeout = setTimeout(function(){
updateTyping(false);
},3000);

});

replyBox.addEventListener("keydown",function(event){

if(event.key === "Enter" && !event.shiftKey){
event.preventDefault();
sendMessage();
}

});

}

/* REALTIME */

onSnapshot(ticketRef,function(snapshot){

if(!snapshot.exists()){
ticketTitle.textContent = "Ticket not found";
return;
}

const ticket = snapshot.data();
currentTicket = ticket;

/* ACCESS */

let allowed = false;
const participants = ticket.participants || [];

for(let i = 0; i < participants.length; i++){
if(participants[i] === user.uid){
allowed = true;
}
}

if(isStaff){
allowed = true;
}

if(!allowed){
showPopup("No Access","You are not part of this ticket.","error");
window.location.href = "/tickets";
return;
}

/* STAFF UI */

if(isStaff && staffCommands){
staffCommands.style.display = "block";

if(ticket.claimed){
claimButton.textContent = "Unclaim Ticket";
}else{
claimButton.textContent = "Claim Ticket";
}
}

/* HEADER */

ticketTitle.textContent = ticket.title || "Untitled Ticket";

ticketMeta.textContent =
"Ticket " + (ticket.ticketId || ticketId) +
" • " + (ticket.category || "Other") +
" • Created " + formatDiscordDate(ticket.createdAt || Date.now());

ticketStatus.textContent = ticket.status || "OPEN";

/* TYPING INDICATOR */

const typing = ticket.typing || {};
let typingNames = [];

for(const uid in typing){
if(uid !== user.uid){
typingNames.push(typing[uid]);
}
}

if(typingNames.length > 0){
typingIndicator.innerHTML = "<span>" + escapeHTML(typingNames.join(", ")) + " is typing</span>";
}else{
typingIndicator.innerHTML = "";
}

/* MESSAGES */

ticketMessages.innerHTML = "";

const messages = ticket.messages || [];
let lastRenderableSender = "";

for(let i = 0; i < messages.length; i++){

const msg = messages[i];
const senderKey = (msg.uid || msg.author || "") + "|" + (msg.role || "USER");

const compact =
senderKey === lastRenderableSender &&
msg.role !== "SYSTEM" &&
msg.role !== "BOT";

const row = document.createElement("div");
row.className = compact ? "ticket-message-row compact" : "ticket-message-row";

const badgeHTML = getBadgeHTML(msg.role);
const time = formatDiscordDate(msg.timestamp || Date.now());

if(compact){

row.innerHTML =
'<div class="ticket-avatar-spacer"></div>' +
'<div class="ticket-message-body">' +
'<div class="ticket-message-content">' + escapeHTML(msg.message || "") + '</div>' +
(msg.imageBase64 ? '<img class="ticket-message-image" src="' + msg.imageBase64 + '">' : "") +
'</div>';

}else{

row.innerHTML =
'<img class="ticket-avatar" src="' + getAvatarForMessage(msg,userData) + '">' +
'<div class="ticket-message-body">' +
'<div class="ticket-message-header">' +
'<span class="ticket-author">' + escapeHTML(msg.author || "Unknown") + '</span>' +
badgeHTML +
'<span class="ticket-message-time">' + time + '</span>' +
'</div>' +
'<div class="ticket-message-content">' + escapeHTML(msg.message || "") + '</div>' +
(msg.imageBase64 ? '<img class="ticket-message-image" src="' + msg.imageBase64 + '">' : "") +
'</div>';

}

ticketMessages.appendChild(row);

if(msg.role === "SYSTEM" || msg.role === "BOT"){
lastRenderableSender = "";
}else{
lastRenderableSender = senderKey;
}

}

ticketMessages.scrollTop = ticketMessages.scrollHeight;

});

/* SEND MESSAGE */

async function sendMessage(){

const text = replyBox.value.trim();

if(!text && !selectedImageBase64){
return;
}

const ticketSnap = await getDoc(ticketRef);
const ticket = ticketSnap.data();
const messages = ticket.messages || [];
const role = isStaff ? "SUPPORT" : "USER";

messages.push({
author:username,
uid:user.uid,
avatarBase64:userData.avatarBase64 || "",
message:text,
imageBase64:selectedImageBase64,
timestamp:Date.now(),
role:role
});

if(text.toLowerCase().indexOf("!ai") === 0){

const prompt = text.replace("!ai","").trim();

messages.push({
author:"ZOS AI",
uid:"zos-ai",
message:getAIResponse(prompt),
timestamp:Date.now(),
role:"BOT"
});

}

const typing = ticket.typing || {};
delete typing[user.uid];

await setDoc(ticketRef,{
messages:messages,
typing:typing,
updatedAt:Date.now()
},{merge:true});

replyBox.value = "";
selectedImageBase64 = "";

if(imageUpload){
imageUpload.value = "";
}

}

sendButton.onclick = sendMessage;

/* STAFF COMMANDS */

if(isStaff) {

claimButton.onclick = async function(){

const ticketSnap = await getDoc(ticketRef);
const ticket = ticketSnap.data();
const messages = ticket.messages || [];

if(ticket.claimed){

messages.push({
author:"ZOS SYSTEM",
uid:"zos-system",
message:username + " has unclaimed this ticket.",
timestamp:Date.now(),
role:"SYSTEM"
});

await setDoc(ticketRef,{
claimed:false,
claimedBy:"",
messages:messages
},{merge:true});

}else{

messages.push({
author:"ZOS SYSTEM",
uid:"zos-system",
message:username + " has claimed this ticket.",
timestamp:Date.now(),
role:"SYSTEM"
});

await setDoc(ticketRef,{
claimed:true,
claimedBy:username,
messages:messages
},{merge:true});

}

};

$("close-ticket").onclick = async function(){

const reason = prompt("Reason for closing?");

if(!reason){
return;
}

const ticketSnap = await getDoc(ticketRef);
const ticket = ticketSnap.data();
const messages = ticket.messages || [];

messages.push({
author:"ZOS SYSTEM",
uid:"zos-system",
message:username + " has closed this ticket for: " + reason,
timestamp:Date.now(),
role:"SYSTEM"
});

const deleteAfter = Date.now() + 30 * 24 * 60 * 60 * 1000;

await setDoc(ticketRef,{
status:"CLOSED",
closedAt:Date.now(),
deleteAfter:deleteAfter,
messages:messages
},{merge:true});

};

$("reopen-ticket").onclick = async function(){

const ticketSnap = await getDoc(ticketRef);
const ticket = ticketSnap.data();
const messages = ticket.messages || [];

messages.push({
author:"ZOS SYSTEM",
uid:"zos-system",
message:username + " has reopened this ticket.",
timestamp:Date.now(),
role:"SYSTEM"
});

await setDoc(ticketRef,{
status:"OPEN",
closedAt:null,
deleteAfter:null,
messages:messages
},{merge:true});

};

$("priority-10").onclick = async function() {

    const priority = prompt(
        "Enter priority (1-10):"
    );

    if(!priority){
        return;
    }

    const priorityNumber = Number(priority);

    if(
        isNaN(priorityNumber) ||
        priorityNumber < 1 ||
        priorityNumber > 10
    ){
        alert("Priority must be between 1 and 10.");
        return;
    }

    const ticketSnap = await getDoc(ticketRef);
    const ticket = ticketSnap.data();

    const messages =
        ticket.messages || [];

    messages.push({
        author:"ZOS SYSTEM",
        uid:"zos-system",
        message:
            username +
            " has changed this ticket priority to " +
            priorityNumber +
            ".",
        timestamp:Date.now(),
        role:"SYSTEM"
    });

    await setDoc(ticketRef,{
        priority:priorityNumber,
        messages:messages
    },{merge:true});

};
}
})