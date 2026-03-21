const YOUTUBE_API_KEY = "AIzaSyDU1MC8SVdTJxBYtB5nQastJD7h7D5jyzg";

let player;
let history = JSON.parse(localStorage.getItem("history")) || [];
let currentQueue = [];
let currentQueueIndex = -1;

// YouTube API load
let tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "1", width: "1", videoId: "",
    playerVars: { autoplay: 1 },
    events: {
      onStateChange: function(event) {
        // Song khatam ho to next auto play
        if (event.data === YT.PlayerState.ENDED) {
          playNext();
        }
      }
    }
  });

  // Page load pe suggestions show karo
  showSuggestions();
}

// Play next in queue
function playNext() {
  if (currentQueue.length === 0) return;
  currentQueueIndex = (currentQueueIndex + 1) % currentQueue.length;
  const next = currentQueue[currentQueueIndex];
  player.loadVideoById(next.videoId);
  document.getElementById("npTitle").innerText = next.title;
  document.getElementById("nowPlaying").classList.add("active");
  history.push({ title: next.title, artist: next.artist, time: Date.now() });
  localStorage.setItem("history", JSON.stringify(history));
}

// Play a song and set queue
function playSong(videoId, title, artist, queue) {
  if (queue) {
    currentQueue = queue;
    currentQueueIndex = queue.findIndex(q => q.videoId === videoId);
  }
  player.loadVideoById(videoId);
  document.getElementById("npTitle").innerText = title;
  document.getElementById("nowPlaying").classList.add("active");
  history.push({ title, artist, time: Date.now() });
  localStorage.setItem("history", JSON.stringify(history));
}

// History based suggestions
async function showSuggestions() {
  if (history.length < 3) {
    document.getElementById("results").innerHTML = `
      <p style="color:#333;font-size:13px;grid-column:1/-1;padding:20px 0">
        Search for songs above or ask VibeBot 👇
      </p>`;
    return;
  }

  // Top artists from history
  const artistCount = {};
  history.forEach(item => {
    artistCount[item.artist] = (artistCount[item.artist] || 0) + 1;
  });
  const topArtist = Object.entries(artistCount).sort((a,b) => b[1]-a[1])[0][0];
  const topSong = history[history.length - 1].title;

  const results = document.getElementById("results");
  results.innerHTML = `
    <p style="color:#555;font-size:11px;text-transform:uppercase;letter-spacing:1px;grid-column:1/-1;padding-bottom:4px">
      🎵 Based on your history
    </p>`;

  // Search based on top artist
  const query = `${topArtist} songs`;
  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=12&key=${YOUTUBE_API_KEY}`);
  const data = await res.json();

  if (!data.items) return;

  const queue = data.items.map(item => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle
  }));

  data.items.forEach((item, idx) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <img src="${item.snippet.thumbnails.medium.url}">
      <p>${item.snippet.title}</p>
    `;
    div.onclick = () => playSong(item.id.videoId, item.snippet.title, item.snippet.channelTitle, queue);
    results.appendChild(div);
  });
}

// Search YouTube
async function searchYT() {
  const q = document.getElementById("searchInput").value.trim();
  if (!q) return;

  const results = document.getElementById("results");
  results.innerHTML = `<p style="color:#444;font-size:13px;grid-column:1/-1">Searching...</p>`;

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&maxResults=12&key=${YOUTUBE_API_KEY}`);
  const data = await res.json();

  results.innerHTML = "";

  const queue = data.items.map(item => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle
  }));

  data.items.forEach((item, idx) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <img src="${item.snippet.thumbnails.medium.url}">
      <p>${item.snippet.title}</p>
    `;
    div.onclick = () => playSong(item.id.videoId, item.snippet.title, item.snippet.channelTitle, queue);
    results.appendChild(div);
  });
}

// Wrapped
function generateWrapped() {
  if (history.length < 5) { alert("Listen to more songs first!"); return; }
  location.href = "wrapped.html";
  }
