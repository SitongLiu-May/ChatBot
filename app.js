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
    if (t.match(/^[A-Z0-9]{10,30}$/i)) return "tracking_candidate";
    if (["not received", "didn't get", "didnt get", "no package"].some(k => t.includes(k))) return "not_received";
    if (["wrong address", "moved", "address issue"].some(k => t.includes(k))) return "wrong_address";
    if (["contact", "carrier", "ups", "usps", "fedex"].some(k => t.includes(k))) return "contact_carrier";
    if (["reship"].some(k => t.includes(k))) return "reship";
    if (["refund"].some(k => t.includes(k))) return "refund";
    if (["investigate", "investigation", "open case"].some(k => t.includes(k))) return "investigate";
    return "unknown";
}

function validTrackingFormat(s) {
    return /^[A-Z0-9]{10,30}$/i.test(s);
}

function handleUserInput(raw, isChip = false) {
    const text = isChip ? raw : (raw || input.value.trim());
    if (!text) return;
    if (!isChip) {
        addMsg(text, "user");
    }

    const intent = isChip ? text : classifyIntent(text);

    // Off-topic input scenario
    if (intent === "off_topic") {
        addMsg("I’m focused on shipping help right now. Let’s get that package sorted first! :) ");
        addMsg("Would you like to track a lost package?");
        setChips(options.start);
        input.value = "";
        return;
    }

    if (state.step === "start") {
        if (intent === "lost") {
            state.step = "ask_tracking";
            addMsg("Got it. Please share your tracking number (10–30 letters/numbers, e.g., <span class='kbd'>1Z999AA10123456784</span>).");
            setChips([]);
        } else if (intent === "other") {
            addMsg("I can help with shipping, returns, and refunds. What do you need?");
            setChips([{ label: "Track a lost package", intent: "lost" }]);
        } else if (intent === "tracking_candidate") {
            if (validTrackingFormat(text)) {
                state.tracking = text.toUpperCase();
                state.step = "tracking_status";
                simulateStatus();
            } else {
                addMsg("Hmm, that tracking number doesn’t look right. It should be 10–30 letters/numbers only.");
                addMsg("Please re-enter your tracking number (no spaces or dashes).");
            }
        } else {
            addMsg("To get started, tell me you want to track a lost package or share your tracking number.");
            setChips(options.start);
        }
    } else if (state.step === "ask_tracking") {
        if (validTrackingFormat(text)) {
            state.tracking = text.toUpperCase();
            state.step = "tracking_status";
            simulateStatus();
        } else {
            addMsg("That doesn’t look like a valid tracking number. Use 10–30 letters/numbers (no spaces/dashes).");
            addMsg("Example: <span class='kbd'>1Z999AA10123456784</span>");
        }
    } else if (state.step === "tracking_status") {
        if (intent === "not_received") {
            state.step = "address_check";
            addMsg("Thanks for confirming. Is the shipping address correct on your order?");
            setChips([{ label: "Yes, it’s correct", intent: "address_ok" }, { label: "No, it’s wrong", intent: "wrong_address" }]);
        } else if (intent === "wrong_address") {
            addressWrongFlow();
        } else if (intent === "contact_carrier") {
            contactCarrier();
        } else {
            addMsg("You can choose: Not received, Wrong address, or Contact carrier.");
            setChips(options.afterTracking);
        }
    } else if (state.step === "address_check") {
        if (intent === "address_ok") {
            state.step = "resolution";
            addMsg("Understood. Since the carrier shows <b>Delivered</b> but you didn’t receive it, I can:");
            addMsg("• Open a trace with the carrier<br>• Offer a reshipment (if inventory is available)<br>• Process a refund");
            setChips(options.resolution);
        } else if (intent === "wrong_address") {
            addressWrongFlow();
        } else {
            addMsg("Please let me know if the address is correct.");
            setChips([{ label: "Yes, it’s correct", intent: "address_ok" }, { label: "No, it’s wrong", intent: "wrong_address" }]);
        }
    } else if (state.step === "resolution") {
        if (intent === "reship") {
            addMsg("I’ve queued a <b>free reshipment</b> to your verified address. You’ll receive a confirmation email shortly.");
            end();
        } else if (intent === "refund") {
            addMsg("I’ve submitted a <b>refund request</b>. You’ll see the credit in 3–5 business days after approval.");
            end();
        } else if (intent === "investigate") {
            addMsg("I’ve opened a <b>carrier investigation</b>. Expect an update within 24–48 hours.");
            end();
        } else {
            addMsg("Please pick one of the options to proceed.");
            setChips(options.resolution);
        }
    } else {
        addMsg("Let’s start over.");
        reset();
    }

    input.value = "";
}
