// ========================================
// 🚀 ROCKET POST
// Offline Messenger
// ========================================

// ========================================
// HTML ELEMENTS
// ========================================

const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messages = document.getElementById("messages");

const searchContact = document.getElementById("searchContact");
const newChatButton = document.getElementById("newChatButton");
const clearChatButton = document.getElementById("clearChatButton");

const currentUserSelect = document.getElementById("currentUser");
const contactList = document.getElementById("contactList");


// ========================================
// STORAGE KEYS
// ========================================

const CONTACTS_KEY = "rocketContacts";
const CONVERSATIONS_KEY = "rocketConversations";
const CURRENT_USER_KEY = "rocketCurrentUser";
const CURRENT_CONTACT_KEY = "rocketCurrentContact";


// ========================================
// DEFAULT CONTACTS
// ========================================

const DEFAULT_CONTACTS = [
    "Friend",
    "Alex",
    "Sam",
    "john"
];


// ========================================
// CURRENT USER
// ========================================

let currentUser =
    localStorage.getItem(CURRENT_USER_KEY) || "You";


// ========================================
// CURRENT CONTACT
// ========================================

let currentContact =
    localStorage.getItem(CURRENT_CONTACT_KEY) || "Friend";


// ========================================
// LOAD DATA
// ========================================

function loadJSON(key, fallback) {

    try {

        const saved = localStorage.getItem(key);

        if (!saved) {
            return Array.isArray(fallback)
                ? [...fallback]
                : {};
        }

        return JSON.parse(saved);

    } catch (error) {

        console.error("Storage error:", error);

        return Array.isArray(fallback)
            ? [...fallback]
            : {};

    }
}


// ========================================
// CONTACTS
// ========================================

let savedContacts = loadJSON(
    CONTACTS_KEY,
    DEFAULT_CONTACTS
);


// ========================================
// CONVERSATIONS
// ========================================

let conversations = loadJSON(
    CONVERSATIONS_KEY,
    {}
);


// ========================================
// SAVE CONTACTS
// ========================================

function saveContacts() {

    localStorage.setItem(
        CONTACTS_KEY,
        JSON.stringify(savedContacts)
    );

}


// ========================================
// SAVE CONVERSATIONS
// ========================================

function saveConversations() {

    localStorage.setItem(
        CONVERSATIONS_KEY,
        JSON.stringify(conversations)
    );

}


// ========================================
// SAVE CURRENT USER
// ========================================

function saveCurrentUser() {

    localStorage.setItem(
        CURRENT_USER_KEY,
        currentUser
    );

}


// ========================================
// SAVE CURRENT CONTACT
// ========================================

function saveCurrentContact() {

    localStorage.setItem(
        CURRENT_CONTACT_KEY,
        currentContact
    );

}


// ========================================
// REMOVE CURRENT USER FROM CONTACTS
// ========================================

function cleanContacts() {

    savedContacts = savedContacts.filter(function(name) {

        return name !== currentUser;

    });

}


// ========================================
// CONVERSATION KEY
// ========================================

function getConversationKey(user1, user2) {

    const users = [
        String(user1),
        String(user2)
    ];

    users.sort();

    return users[0] + "__" + users[1];

}


// ========================================
// CREATE CONVERSATION
// ========================================

function createConversationIfNeeded(user1, user2) {

    if (!user1 || !user2) {
        return;
    }

    const key = getConversationKey(
        user1,
        user2
    );

    if (!Array.isArray(conversations[key])) {

        conversations[key] = [];

        saveConversations();

    }

}


// ========================================
// GET CURRENT CHAT
// ========================================

function getCurrentChat() {

    if (!currentUser || !currentContact) {
        return [];
    }

    createConversationIfNeeded(
        currentUser,
        currentContact
    );

    const key = getConversationKey(
        currentUser,
        currentContact
    );

    return conversations[key];

}


// ========================================
// CURRENT TIME
// ========================================

function getCurrentTime() {

    const now = new Date();

    return now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

}


// ========================================
// DISPLAY MESSAGES
// ========================================

function displayMessages() {

    if (!messages) {
        return;
    }

    messages.innerHTML = "";

    if (!currentContact) {
        return;
    }

    const chat = getCurrentChat();

    chat.forEach(function(message) {

        const messageElement =
            document.createElement("div");

        if (message.sender === currentUser) {

            messageElement.className =
                "message sent";

        } else {

            messageElement.className =
                "message received";

        }


        const textElement =
            document.createElement("div");

        textElement.className =
            "message-text";

        textElement.textContent =
            message.text;


        const timeElement =
            document.createElement("small");

        timeElement.textContent =
            message.sender +
            " • " +
            message.time;


        messageElement.appendChild(
            textElement
        );

        messageElement.appendChild(
            timeElement
        );

        messages.appendChild(
            messageElement
        );

    });


    messages.scrollTop =
        messages.scrollHeight;

}


// ========================================
// SEND MESSAGE
// ========================================

function sendMessage() {

    const text =
        messageInput.value.trim();


    if (text === "") {

        return;

    }


    if (!currentContact) {

        alert("Please select a contact first.");

        return;

    }


    if (currentContact === currentUser) {

        alert("You cannot chat with yourself.");

        return;

    }


    const chat =
        getCurrentChat();


    chat.push({

        sender: currentUser,

        receiver: currentContact,

        text: text,

        time: getCurrentTime(),

        timestamp: Date.now()

    });


    saveConversations();


    messageInput.value = "";


    displayMessages();

    renderContacts();


    messageInput.focus();

}


// ========================================
// SEND BUTTON
// ========================================

if (sendButton) {

    sendButton.addEventListener(
        "click",
        sendMessage
    );

}


// ========================================
// ENTER KEY
// ========================================

if (messageInput) {

    messageInput.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                event.preventDefault();

                sendMessage();

            }

        }
    );

}


// ========================================
// LAST MESSAGE
// ========================================

function getLastMessage(contactName) {

    const key =
        getConversationKey(
            currentUser,
            contactName
        );

    const chat =
        conversations[key];


    if (
        !Array.isArray(chat) ||
        chat.length === 0
    ) {

        return null;

    }


    return chat[chat.length - 1];

}


// ========================================
// CONTACT PREVIEW
// ========================================

function getContactPreview(contactName) {

    const lastMessage =
        getLastMessage(contactName);


    if (!lastMessage) {

        return "No messages yet. Start a conversation!";

    }


    let preview =
        lastMessage.sender +
        ": " +
        lastMessage.text;


    if (preview.length > 30) {

        preview =
            preview.substring(0, 30) +
            "...";

    }


    return preview;

}


// ========================================
// RENDER CONTACTS
// ========================================

function renderContacts() {

    if (!contactList) {
        return;
    }

    contactList.innerHTML = "";


    savedContacts.forEach(function(name) {

        if (name === currentUser) {
            return;
        }


        const contact =
            document.createElement("div");

        contact.className = "contact";


        if (name === currentContact) {

            contact.classList.add("active");

        }


        contact.dataset.name = name;


        // Avatar

        const avatar =
            document.createElement("div");

        avatar.className = "avatar";

        avatar.textContent =
            name.charAt(0).toUpperCase();


        // Contact information

        const contactInfo =
            document.createElement("div");

        contactInfo.className =
            "contact-info";


        const strong =
            document.createElement("strong");

        strong.textContent = name;


        const preview =
            document.createElement("span");

        preview.textContent =
            getContactPreview(name);


        contactInfo.appendChild(strong);

        contactInfo.appendChild(preview);


        // Delete button

        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";

        deleteButton.className =
            "delete-contact";

        deleteButton.textContent = "🗑️";

        deleteButton.title =
            "Delete " + name;


        deleteButton.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                event.stopPropagation();

                deleteContact(name);

            }
        );


        // Build contact

        contact.appendChild(avatar);

        contact.appendChild(contactInfo);

        contact.appendChild(deleteButton);


        // Open chat

        contact.addEventListener(
            "click",
            function() {

                openContact(name);

            }
        );


        contactList.appendChild(contact);

    });


    applySearch();

}


// ========================================
// OPEN CONTACT
// ========================================

function openContact(name) {

    if (!name) {
        return;
    }


    if (name === currentUser) {

        alert("You cannot chat with yourself.");

        return;

    }


    currentContact = name;

    saveCurrentContact();


    createConversationIfNeeded(
        currentUser,
        currentContact
    );


    displayMessages();

    renderContacts();


    if (messageInput) {

        messageInput.focus();

    }

}


// ========================================
// DELETE CONTACT
// ========================================

function deleteContact(name) {

    const confirmed =
        confirm(
            "Delete " +
            name +
            " and all conversations with this contact?"
        );


    if (!confirmed) {
        return;
    }


    savedContacts =
        savedContacts.filter(function(contactName) {

            return contactName !== name;

        });


    saveContacts();


    // Delete conversations

    Object.keys(conversations).forEach(
        function(key) {

            const users =
                key.split("__");


            if (users.includes(name)) {

                delete conversations[key];

            }

        }
    );


    saveConversations();


    // Select another contact

    if (currentContact === name) {

        const nextContact =
            savedContacts.find(function(contactName) {

                return contactName !== currentUser;

            });


        currentContact =
            nextContact || "";


        saveCurrentContact();

    }


    renderContacts();

    displayMessages();

}


// ========================================
// SEARCH CONTACTS
// ========================================

function applySearch() {

    if (!searchContact) {
        return;
    }


    const searchText =
        searchContact.value
            .trim()
            .toLowerCase();


    document
        .querySelectorAll(".contact")
        .forEach(function(contact) {

            const name =
                contact.dataset.name
                    .toLowerCase();


            if (name.includes(searchText)) {

                contact.style.display = "flex";

            } else {

                contact.style.display = "none";

            }

        });

}


if (searchContact) {

    searchContact.addEventListener(
        "input",
        applySearch
    );

}


// ========================================
// NEW CHAT
// ========================================

if (newChatButton) {

    newChatButton.addEventListener(
        "click",
        function() {

            const enteredName =
                prompt("Enter contact name:");


            if (enteredName === null) {
                return;
            }


            const name =
                enteredName.trim();


            if (name === "") {

                alert(
                    "Please enter a contact name."
                );

                return;

            }


            if (name === currentUser) {

                alert(
                    "You cannot add yourself."
                );

                return;

            }


            const duplicate =
                savedContacts.some(
                    function(contactName) {

                        return (
                            contactName.toLowerCase() ===
                            name.toLowerCase()
                        );

                    }
                );


            if (duplicate) {

                alert(
                    "This contact already exists."
                );

                return;

            }


            savedContacts.push(name);

            saveContacts();


            createConversationIfNeeded(
                currentUser,
                name
            );


            currentContact = name;

            saveCurrentContact();


            renderContacts();

            displayMessages();


            messageInput.focus();

        }
    );

}


// ========================================
// CLEAR CHAT
// ========================================

if (clearChatButton) {

    clearChatButton.addEventListener(
        "click",
        function() {

            if (!currentContact) {
                return;
            }


            const chat =
                getCurrentChat();


            if (chat.length === 0) {

                alert(
                    "This chat is already empty."
                );

                return;

            }


            const confirmed =
                confirm(
                    "Clear chat with " +
                    currentContact +
                    "?"
                );


            if (!confirmed) {
                return;
            }


            const key =
                getConversationKey(
                    currentUser,
                    currentContact
                );


            conversations[key] = [];

            saveConversations();


            displayMessages();

            renderContacts();

        }
    );

}


// ========================================
// CURRENT USER
// ========================================

if (currentUserSelect) {

    currentUserSelect.value =
        currentUser;


    currentUserSelect.addEventListener(
        "change",
        function() {

            currentUser =
                currentUserSelect.value;


            saveCurrentUser();


            cleanContacts();


            DEFAULT_CONTACTS.forEach(
                function(name) {

                    if (
                        name !== currentUser &&
                        !savedContacts.includes(name)
                    ) {

                        savedContacts.push(name);

                    }

                }
            );


            if (
                !savedContacts.includes(currentContact) ||
                currentContact === currentUser
            ) {

                currentContact =
                    savedContacts.find(
                        function(name) {

                            return name !== currentUser;

                        }
                    ) || "";

            }


            saveContacts();

            saveCurrentContact();


            renderContacts();

            displayMessages();

        }
    );

}


// ========================================
// ABOUT US
// ========================================

const aboutButton =
    document.getElementById("aboutButton");

const aboutModal =
    document.getElementById("aboutModal");

const closeAbout =
    document.getElementById("closeAbout");


if (aboutButton && aboutModal) {

    aboutButton.addEventListener(
        "click",
        function() {

            aboutModal.style.display = "flex";

        }
    );

}


if (closeAbout && aboutModal) {

    closeAbout.addEventListener(
        "click",
        function() {

            aboutModal.style.display = "none";

        }
    );

}


if (aboutModal) {

    aboutModal.addEventListener(
        "click",
        function(event) {

            if (event.target === aboutModal) {

                aboutModal.style.display = "none";

            }

        }
    );

}


// ========================================
// INITIALIZE
// ========================================

DEFAULT_CONTACTS.forEach(
    function(name) {

        if (
            name !== currentUser &&
            !savedContacts.includes(name)
        ) {

            savedContacts.push(name);

        }

    }
);


cleanContacts();


if (
    !savedContacts.includes(currentContact) ||
    currentContact === currentUser
) {

    currentContact =
        savedContacts.find(
            function(name) {

                return name !== currentUser;

            }
        ) || "";

}


saveContacts();

saveCurrentContact();


if (currentContact) {

    createConversationIfNeeded(
        currentUser,
        currentContact
    );

}


renderContacts();

displayMessages();
