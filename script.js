// --- CONFIG ---
const YOUTUBE_API_KEY = "AIzaSyDU1MC8SVdTJxBYtB5nQastJD7h7D5jyzg";
const GEMINI_API_KEY = "AIzaSyC0KhWuivkNagpPhVhqqPKZJZZvnOc-DDI";

let player;
let listenHistory = JSON.parse(localStorage.getItem('streamflow_history')) || [];

// --- YOUTUBE PLAYER ---
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: '',
        playerVars: {
            autoplay: 1,
            playsinline: 1
        },
        events: {
            onReady: () => {
                console.log("Player Ready ✅");
            }
        }
    });
}

// --- GEMINI SEARCH ---
async function askGemini() {
    const input = document.getElementById("searchInput").value.trim();
    if (!input) return;

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Suggest song for: ${input}` }] }]
            })
        });

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        document.getElementById("searchInput").value = text || input;
        searchYT();

    } catch {
        searchYT();
    }
}

// --- YOUTUBE SEARCH ---
async function searchYT() {
    const q = document.getElementById("searchInput").value;
    const resultsDiv = document.getElementById("results");

    resultsDiv.innerHTML = "Loading...";

    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${q}&type=video&key=${YOUTUBE_API_KEY}`);
        const data = await res.json();

        resultsDiv.innerHTML = "";

        data.items.forEach(item => {
            const div = document.createElement("div");
            div.className = "card";

            div.innerHTML = `
                <img src="${item.snippet.thumbnails.medium.url}">
                <p>${item.snippet.title}</p>
            `;

            div.onclick = () => {
                player.loadVideoById(item.id.videoId);
                document.getElementById("videoOverlay").classList.add("active");

                listenHistory.push({
                    title: item.snippet.title,
                    artist: item.snippet.channelTitle
                });

                localStorage.setItem('streamflow_history', JSON.stringify(listenHistory));
            };

            resultsDiv.appendChild(div);
        });

    } catch {
        resultsDiv.innerHTML = "Error loading songs";
    }
}

// --- RECAP ---
function generateRecap() {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = `
    <div class='welcome-box'>
        <h2>🔥 Your Recap</h2>
        <p>You love music and explore different vibes 🎧</p>
    </div>`;
}

// --- WRAPPED ---
function generateWrapped() {
    const history = JSON.parse(localStorage.getItem('streamflow_history')) || [];

    if (history.length < 3) {
        alert("Listen more songs!");
        return;
    }

    const songCount = {};
    const artistCount = {};

    history.forEach(item => {
        songCount[item.title] = (songCount[item.title] || 0) + 1;
        artistCount[item.artist] = (artistCount[item.artist] || 0) + 1;
    });

    const topSong = Object.keys(songCount).sort((a,b)=>songCount[b]-songCount[a])[0];
    const topArtist = Object.keys(artistCount).sort((a,b)=>artistCount[b]-artistCount[a])[0];

    document.getElementById("results").innerHTML = `
    <div class='welcome-box'>
        <h1>🎧 Your Wrapped</h1>
        <p><b>Top Song:</b> ${topSong}</p>
        <p><b>Top Artist:</b> ${topArtist}</p>
        <p><b>Total Plays:</b> ${history.length}</p>
    </div>`;
}

// --- CLOSE PLAYER ---
document.getElementById("closeBtn").onclick = () => {
    document.getElementById("videoOverlay").classList.remove("active");
};
