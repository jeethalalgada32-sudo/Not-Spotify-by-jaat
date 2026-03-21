const YOUTUBE_API_KEY = "AIzaSyDU1MC8SVdTJxBYtB5nQastJD7h7D5jyzg";

let player;
let history = JSON.parse(localStorage.getItem("history")) || [];

// YouTube API load
let tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "1", width: "1", videoId: "",
    playerVars: { autoplay: 1 }
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

  data.items.forEach(item => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <img src="${item.snippet.thumbnails.medium.url}">
      <p>${item.snippet.title}</p>
    `;
    div.onclick = () => {
      player.loadVideoById(item.id.videoId);
      document.getElementById("npTitle").innerText = item.snippet.title;
      document.getElementById("nowPlaying").classList.add("active");
      history.push({ title: item.snippet.title, artist: item.snippet.channelTitle, time: Date.now() });
      localStorage.setItem("history", JSON.stringify(history));
    };
    results.appendChild(div);
  });
}

// Wrapped
function generateWrapped() {
  if (history.length < 5) { alert("Listen to more songs first!"); return; }
  // redirect to wrapped page
  location.href = "wrapped.html";
}
