
const contactsList = document.getElementById("contactsList");
const messagesBox = document.getElementById("messages");
const chatName = document.getElementById("chatName");
const chatStatus = document.getElementById("chatStatus");
const messageInput = document.getElementById("messageInput");
const messageForm = document.getElementById("messageForm");
const sendButton = document.getElementById("sendButton");

let contacts = JSON.parse(
    localStorage.getItem("messengerContacts") || "null"
) || [
    { id: 1, name: "Айбек" },
    { id: 2, name: "Алина" },
    { id: 3, name: "Бекзат" },
    { id: 4, name: "Нурбек" }
];

let chats = JSON.parse(
    localStorage.getItem("messengerChats") || "{}"
);

let activeContact = null;

function saveData() {
    localStorage.setItem(
        "messengerContacts",
        JSON.stringify(contacts)
    );

    localStorage.setItem(
        "messengerChats",
        JSON.stringify(chats)
    );
}

function getChat(id) {
    if (!chats[id]) {
        chats[id] = [];
    }

    return chats[id];
}

// Контакттарды көрсөтүү
function renderContacts() {
    contactsList.innerHTML = "";

    contacts.forEach(contact => {
        const div = document.createElement("div");
        div.className = "contact";

        if (activeContact === contact.id) {
            div.classList.add("active");
        }

        const name = document.createElement("strong");
        name.textContent = "👤 " + contact.name;

        const status = document.createElement("small");
        status.textContent = "● Чатка кирүү";

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Өчүрүү";
        deleteBtn.style.marginTop = "10px";
        deleteBtn.style.background = "#fee2e2";
        deleteBtn.style.color = "#dc2626";

        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteContact(contact.id);
        });

        div.append(name, status, deleteBtn);

        div.addEventListener("click", () => {
            openChat(contact.id);
        });

        contactsList.appendChild(div);
    });
}

// Чат ачуу
function openChat(id) {
    activeContact = id;

    const contact = contacts.find(c => c.id === id);

    if (!contact) return;

    chatName.textContent = "👤 " + contact.name;
    chatStatus.textContent = "● Онлайн · Симуляция";

    messageInput.disabled = false;
    sendButton.disabled = false;

    renderContacts();
    renderMessages();
}

// Билдирүүлөрдү көрсөтүү
function renderMessages() {
    messagesBox.innerHTML = "";

    if (activeContact === null) return;

    const history = getChat(activeContact);

    if (history.length === 0) {
        const welcome = document.createElement("div");
        welcome.className = "welcome";
        welcome.textContent = "Бул жерде сүйлөшүү башталат 💬";
        messagesBox.appendChild(welcome);
        return;
    }

    history.forEach(msg => {
        const div = document.createElement("div");

        div.className = "message " +
            (msg.type === "sent" ? "sent" : "received");

        const text = document.createElement("div");
        text.textContent = msg.text;

        const time = document.createElement("small");
        time.textContent = msg.time;

        div.append(text, time);
        messagesBox.appendChild(div);
    });

    messagesBox.scrollTop = messagesBox.scrollHeight;
}

// Билдирүү жөнөтүү
messageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const text = messageInput.value.trim();

    if (!text || activeContact === null) return;

    getChat(activeContact).push({
        text: text,
        type: "sent",
        time: getTime()
    });

    saveData();
    renderMessages();

    messageInput.value = "";

    simulateReply(activeContact);
});

// Убакыт
function getTime() {
    return new Date().toLocaleTimeString(
        "ky-KG",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

// Автоматтык жооп
function simulateReply(contactId) {

    const replies = [
        "Салам! Кандайсың? 😊",
        "Жакшы, рахмат! Сенчи?",
        "Түшүнүктүү 👍",
        "Макул, сүйлөшөбүз!",
        "Кызыктуу экен!",
        "Азыр бош эмесмин, кийин жазам.",
        "Рахмат! 😊",
        "Ооба, туура айтасың."
    ];

    setTimeout(() => {

        if (!contacts.some(c => c.id === contactId)) return;

        const randomReply =
            replies[Math.floor(Math.random() * replies.length)];

        getChat(contactId).push({
            text: randomReply,
            type: "received",
            time: getTime()
        });

        saveData();

        if (activeContact === contactId) {
            renderMessages();
        }

    }, 1200);
}

// Жаңы контакт кошуу
document.getElementById("addContact")
    .addEventListener("click", () => {

        const input = document.getElementById("contactName");
        const name = input.value.trim();

        if (!name) {
            alert("Контакттын атын жазыңыз!");
            return;
        }

        const exists = contacts.some(
            c => c.name.toLowerCase() === name.toLowerCase()
        );

        if (exists) {
            alert("Бул контакт мурунтан бар!");
            return;
        }

        const newContact = {
            id: Date.now(),
            name: name
        };

        contacts.push(newContact);

        input.value = "";

        saveData();
        renderContacts();
        openChat(newContact.id);
    });

// Enter менен контакт кошуу
document.getElementById("contactName")
    .addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            document.getElementById("addContact").click();
        }
    });

// Контакт өчүрүү
function deleteContact(id) {

    if (!confirm("Бул контактты өчүрөсүзбү?")) return;

    contacts = contacts.filter(c => c.id !== id);

    delete chats[id];

    if (activeContact === id) {
        activeContact = null;
        chatName.textContent = "Контакт тандаңыз";
        chatStatus.textContent = "Чат баштоо үчүн контакт тандаңыз";
        messageInput.disabled = true;
        sendButton.disabled = true;
        messagesBox.innerHTML = "";
    }

    saveData();
    renderContacts();
}

// Бардык кат алышууну тазалоо
document.getElementById("clearHistory")
    .addEventListener("click", () => {

        if (!confirm("Бардык кат алышуулар өчүрүлсүнбү?")) return;

        chats = {};

        saveData();

        renderMessages();

        alert("Кат алышуулардын тарыхы тазаланды!");
    });

// Баштапкы иштетүү
saveData();
renderContacts();
