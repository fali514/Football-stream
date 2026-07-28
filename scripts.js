// Array of live sports channel source links (using free, legal open-source test stream URLs)
const channels = [
    {
        id: 1,
        title: "Live Football Stream (HD)",
        category: "Football",
        url: "https://mux.dev"
    },
    {
        id: 2,
        title: "World Tennis Open Championship",
        category: "Tennis",
        url: "https://longtailvideo.com"
    },
    {
        id: 3,
        title: "International Basketball League",
        category: "Basketball",
        url: "https://vodny.tv"
    }
];

const video = document.getElementById('video-player');
const matchTitle = document.getElementById('match-title');
const channelsGrid = document.getElementById('channels-grid');

// Play selected stream link using HTML5 or HLS.js
function loadStream(url, title) {
    matchTitle.innerText = title;

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            video.play();
        });
    } 
    // Native fallback support for browser engines like Safari iOS
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', function() {
            video.play();
        });
    }
}

// Generate the clickables items on dashboard UI
function renderChannels() {
    channelsGrid.innerHTML = '';
    channels.forEach(channel => {
        const card = document.createElement('div');
        card.classList.add('channel-card');
        card.innerHTML = `
            <h4>${channel.title}</h4>
            <p>${channel.category}</p>
        `;
        card.addEventListener('click', () => {
            loadStream(channel.url, channel.title);
        });
        channelsGrid.appendChild(card);
    });
}

// Interactive Live Chat simulation logic
const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

function appendMessage(user, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-msg');
    msgDiv.innerHTML = `<span class="username">${user}:</span> ${text}`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Send user manual typed messages
sendBtn.addEventListener('click', () => {
    if(chatInput.value.trim() !== "") {
        appendMessage("You", chatInput.value);
        chatInput.value = "";
    }
});

// Auto generate periodic artificial fan feedback messages
const randomComments = ["GOOOOAL!!!", "What a terrible referee call...", "Incredible play wow!!", "Who do you think wins?", "Unbelievable save!"];
const randomUsers = ["GoalHunter", "Striker99", "PitchKing", "FanaticFan", "VortexSport"];

setInterval(() => {
    const user = randomUsers[Math.floor(Math.random() * randomUsers.length)];
    const text = randomComments[Math.floor(Math.random() * randomComments.length)];
    appendMessage(user, text);
}, 4000);

// Initialize application on load
window.onload = () => {
    renderChannels();
    // Default fallback player loads first array item
    loadStream(channels[0].url, channels[0].title);
};
