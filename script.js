// const YOUTUBE_API_KEY = "YOUR_API_KEY_HERE";  // Daal dena apna, public mat karna!

let player;
let history = JSON.parse(localStorage.getItem("streamflow_history")) || [];

// YouTube API Ready
function onYouTubeIframeAPIReady() {
    player = new YT.Player("player", {
        height: "100%",
        width: "100%",
        videoId: "",
        playerVars: {
            autoplay: 1,
            modestbranding: 1,
            rel: 0
        }
    });
}

// Sidebar Toggle
const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");

menuBtn.onclick = () => sidebar.classList.toggle("show");

function closeSidebar() {
    sidebar.classList.remove("show");
}

document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
        closeSidebar();
    }
});

// Search YouTube
async function searchYT() {
    const query = document.getElementById("searchInput").value.trim();
    if (!query) return alert("Bhai kuch to type kar!");

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p>Loading...</p>";

    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=\( {encodeURIComponent(query)}&type=video&maxResults=12&key= \){YOUTUBE_API_KEY}`);
        const data = await res.json();

        if (!data.items) throw new Error("No results");

        resultsDiv.innerHTML = "";

        data.items.forEach(item => {
            if (!item.id?.videoId) return;

            const card = document.createElement("div");
            card.className = "card";

            card.innerHTML = `
                <img src="\( {item.snippet.thumbnails.medium.url}" alt=" \){item.snippet.title}">
                <p>${item.snippet.title}</p>
            `;

            card.onclick = () => playVideo(item.id.videoId, item.snippet.title, item.snippet.channelTitle);

            resultsDiv.appendChild(card);
        });
    } catch (err) {
        resultsDiv.innerHTML = "<p>Something went wrong... Try again!</p>";
        console.error(err);
    }
}

// Play Video + Save to History
function playVideo(videoId, title, artist) {
    document.getElementById("videoOverlay").classList.add("active");

    if (player && player.loadVideoById) {
        player.loadVideoById(videoId);
    }

    // Save to history
    history.push({
        title: title,
        artist: artist || "Unknown",
        timestamp: Date.now()
    });

    localStorage.setItem("streamflow_history", JSON.stringify(history));
}

// Close Player
document.getElementById("closeBtn").onclick = () => {
    document.getElementById("videoOverlay").classList.remove("active");
    if (player && player.pauseVideo) player.pauseVideo();
};

// Generate Wrapped
function generateWrapped() {
    if (history.length < 3) {
        alert("Bhai thoda aur gaane sun le! At least 3-5 chahiye full vibe ke liye 🔥");
        return;
    }

    // Song count
    const songCount = {};
    history.forEach(h => {
        const key = h.title;
        songCount[key] = (songCount[key] || 0) + 1;
    });

    const sortedSongs = Object.entries(songCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Artist count
    const artistCount = {};
    history.forEach(h => {
        const artist = h.artist;
        artistCount[artist] = (artistCount[artist] || 0) + 1;
    });

    const sortedArtists = Object.entries(artistCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const totalPlays = history.length;
    const approxMinutes = Math.round(totalPlays * 3.8); // avg YouTube song length
    const uniqueSongs = Object.keys(songCount).length;

    // Fun message
    const topArtist = sortedArtists[0]?.[0] || "Music";
    const funMessages = [
        `You're basically ${topArtist}'s official Delhi fanclub president! 😎`,
        `${topArtist} on repeat – no shame in that! 🔥`,
        `This year = ${topArtist} supremacy! 👑`,
        `Top song ${sortedSongs[0]?.[1]} times? Obsessed and proud 😂`
    ];
    const randomMsg = funMessages[Math.floor(Math.random() * funMessages.length)];

    // Build HTML
    const wrappedHTML = `
        <div class="wrapped-container">
            <h1>🎧 StreamFlow Wrapped 2026 ⚡</h1>
            <p style="font-size:1.3rem; opacity:0.9;">Your year in full volume – Delhi style!</p>

            <div class="stat">
                \( {totalPlays} plays • \~ \){approxMinutes} minutes of pure vibes
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); gap:20px;">
                <div class="top-list">
                    <h3>Top 5 Songs 🔥</h3>
                    <ol>
                        \( {sortedSongs.map(([title, count]) => `<li> \){title} – ${count} plays</li>`).join('')}
                    </ol>
                </div>

                <div class="top-list">
                    <h3>Top 5 Artists 🎤</h3>
                    <ol>
                        \( {sortedArtists.map(([artist, count]) => `<li> \){artist} – ${count} plays</li>`).join('')}
                    </ol>
                </div>
            </div>

            <p class="fun-msg">${randomMsg}</p>

            <button onclick="document.getElementById('results').innerHTML=''; document.getElementById('searchInput').focus();" 
                    style="padding:14px 40px; background:#000; border:2px solid #1db954; color:#1db954; font-weight:bold; border-radius:50px; cursor:pointer; margin-top:20px;">
                Back to Search →
            </button>
        </div>
    `;

    document.getElementById("results").innerHTML = wrappedHTML;
}

// Clear History
function clearHistory() {
    if (confirm("Sure bhai? Saara Wrapped data delete ho jayega!")) {
        history = [];
        localStorage.removeItem("streamflow_history");
        alert("History cleared! Fresh start 🔥");
    }
                            }
