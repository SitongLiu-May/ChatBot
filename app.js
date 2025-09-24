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
    div.className = `msg ${sender}`;
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}
