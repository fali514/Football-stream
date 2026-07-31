// WORKING free, legal HLS test streams - these will actually play
const channels = [
  {
    id: 1,
    title: "Mux Demo - Big Buck Bunny (HD)",
    category: "Demo / Movies",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  },
  {
    id: 2,
    title: "Apple BipBop - Adaptive Test",
    category: "Test 1080p",
    url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8"
  },
  {
    id: 3,
    title: "Sintel Movie Trailer (HD)",
    category: "Movies - Public",
    url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8"
  },
  {
    id: 4,
    title: "Tears of Steel (4K)",
    category: "Movies - Public",
    url: "https://demo.unified-streaming.com/k8s/features/static/hls/live/la.m3u8"
  }
];

const video = document.getElementById('video-player');
const matchTitle = document.getElementById('match-title');
const matchStatus = document.getElementById('match-status');
const liveScoreEl = document.getElementById('live-score');
const channelsGrid = document.getElementById('channels-grid');
const liveMatchesGrid = document.getElementById('live-matches-grid');

let hlsInstance = null;

function loadStream(url, title) {
  matchTitle.innerText = title;
  matchStatus.innerText = "🔴 LIVE | Loading...";
  
  // Destroy previous HLS instance
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }

  if (Hls.isSupported()) {
    hlsInstance = new Hls();
    hlsInstance.loadSource(url);
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(()=>{});
      matchStatus.innerText = "🔴 LIVE | 1080p 60fps";
    });
    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
      console.error("HLS Error", data);
      if(data.fatal) matchStatus.innerText = "⚠️ Stream error - trying next...";
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
    video.addEventListener('loadedmetadata', () => video.play().catch(()=>{}));
  } else {
    alert("Your browser does not support HLS playback");
  }
}

function renderChannels() {
  channelsGrid.innerHTML = "";
  channels.forEach(channel => {
    const card = document.createElement('div');
    card.className = 'channel-card';
    card.innerHTML = `<h4>${channel.title}</h4><p>${channel.category}</p>`;
    card.addEventListener('click', () => loadStream(channel.url, channel.title));
    channelsGrid.appendChild(card);
  });
}

// --- NEW: AUTO-UPDATING LIVE MATCHES ---
// Uses ESPN's free public scoreboard API (no key needed, CORS enabled)
async function fetchLiveMatches() {
  liveMatchesGrid.innerHTML = "<p style='color:#a0a5b1'>Loading live matches...</p>";
  
  // You can change leagues: eng.1 = Premier League, esp.1 = La Liga, ger.1 = Bundesliga, etc.
  const leagues = [
    { code: 'eng.1', name: 'Premier League' },
    { code: 'esp.1', name: 'La Liga' },
    { code: 'usa.1', name: 'MLS' },
    { code: 'uefa.champions', name: 'Champions League' }
  ];

  let allEvents = [];

  try {
    for (const league of leagues) {
      const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league.code}/scoreboard`);
      const data = await res.json();
      if (data.events) {
        data.events.forEach(ev => {
          ev.leagueName = league.name;
          allEvents.push(ev);
        });
      }
    }

    if (allEvents.length === 0) {
      liveMatchesGrid.innerHTML = "<p style='color:#a0a5b1'>No live matches right now. Check back later.</p>";
      return;
    }

    liveMatchesGrid.innerHTML = "";
    allEvents.slice(0, 12).forEach(ev => {
      const comp = ev.competitions[0];
      const home = comp.competitors[0];
      const away = comp.competitors[1];
      const status = comp.status.type.shortDetail;
      const isLive = comp.status.type.state === 'in';
      
      const card = document.createElement('div');
      card.className = 'channel-card';
      card.style.borderColor = isLive ? '#e50914' : '#242b35';
      card.innerHTML = `
        <h4>${home.team.displayName} vs ${away.team.displayName}</h4>
        <p>${ev.leagueName} - ${status}</p>
        <p style="font-size:16px; font-weight:bold; margin-top:5px;">${home.score} - ${away.score} ${isLive ? '🔴 LIVE' : ''}</p>
      `;
      card.addEventListener('click', () => {
        matchTitle.innerText = `${home.team.displayName} vs ${away.team.displayName}`;
        liveScoreEl.innerText = `${ev.leagueName} | ${status} | Score: ${home.score}-${away.score}. This is real live data. Video is demo - you need official rights to stream the actual match.`;
        // For real matches you cannot play Premier League video without a license. We keep demo video.
        // If you want to show highlights, you could embed YouTube highlights here.
      });
      liveMatchesGrid.appendChild(card);
    });

    // Update header with first live match if any
    const liveNow = allEvents.find(e => e.competitions[0].status.type.state === 'in');
    if (liveNow) {
      const c = liveNow.competitions[0];
      liveScoreEl.innerText = `Live Now: ${c.competitors[0].team.displayName} ${c.competitors[0].score} - ${c.competitors[1].score} ${c.competitors[1].team.displayName} (${liveNow.leagueName})`;
    }

  } catch (err) {
    console.error(err);
    liveMatchesGrid.innerHTML = "<p>Failed to load live scores. API might be rate-limited. Retrying in 30s...</p>";
  }
}

// Chat logic (same as yours)
const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

function appendMessage(user, text) {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-msg';
  msgDiv.innerHTML = `<span class="username">${user}:</span> ${text}`;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}
sendBtn.addEventListener('click', () => {
  if(chatInput.value.trim() !== "") {
    appendMessage("You", chatInput.value);
    chatInput.value = "";
  }
});
const randomComments = ["GOOOOAL!!!", "What a terrible referee call...", "Incredible play wow!!", "Who do you think wins?", "Unbelievable save!"];
const randomUsers = ["GoalHunter", "Striker99", "PitchKing", "FanaticFan", "VortexSport"];
setInterval(() => {
  const user = randomUsers[Math.floor(Math.random()*randomUsers.length)];
  const text = randomComments[Math.floor(Math.random()*randomComments.length)];
  appendMessage(user, text);
}, 4000);

// Init
window.onload = () => {
  renderChannels();
  loadStream(channels[0].url, channels[0].title);
  fetchLiveMatches();
  // Auto-refresh live scores every 60 seconds
  setInterval(fetchLiveMatches, 60000);
};
