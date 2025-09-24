//decision-tree chatbot for a "lost package" scenario
const chat = document.getElementById("chat");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const chips = document.getElementById("chips");

const state = {
    step: "start",
    tracking: null,
    addressConfirm: null,
    simulatedStatus: "delivered",
};
//giving options to user to 
const options = {
    start: [
        { label: "Track a lost package", intent: "lost" },
        { label: "Something else", intent: "other" },
    ],
    afterTracking: [
        { label: "Not received", intent: "not_received" },
        { label: "Wrong address", intent: "wrong_address" },
        { label: "Contact carrier", intent: "contact_carrier" },
    ],
    resolution: [
        { label: "Reship item", intent: "reship" },
        { label: "Refund me", intent: "refund" },
        { label: "Open investigation", intent: "investigate" },
    ],
};

function addMsg(text, sender = "bot") {
    const div = document.createElement("div");
    div.className = `msg ${sender}`;
    div.innerHTML = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function addSystem(text) {
    const div = document.createElement("div");
    div.className = "system";
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function setChips(list) {
    chips.innerHTML = "";
    (list || []).forEach(item => {
        const span = document.createElement("span");
        span.className = "chip";
        span.textContent = item.label;
        span.addEventListener("click", () => handleUserInput(item.intent, true));
        chips.appendChild(span);
    });
}

function greeting() {
    addMsg("Hi! I’m <b>Agent MayMay</b>. I can help you with a lost package.");
    addMsg("Do you want to track a lost package or something else?");
    setChips(options.start);
}
//finidng keyword
function classifyIntent(text) {
    const t = text.toLowerCase();
    if (["lost", "where", "package", "track", "missing"].some(k => t.includes(k))) return "lost";
    if (["joke", "song", "weather"].some(k => t.includes(k))) return "off_topic";
    if 



}
