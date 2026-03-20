const YOUTUBE_API_KEY = "AIzaSyDU1MC8SVdTJxBYtB5nQastJD7h7D5jyzg";

let player;
let history = JSON.parse(localStorage.getItem("history")) || [];

// Load YouTube API
let tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

// Player Ready
function onYouTubeIframeAPIReady() {
    player = new YT.Player("player", {
        height: "100%",
        width: "100%",
        videoId: "",
        playerVars: { autoplay: 1 }
    });
}

// SEARCH
async function searchYT() {
    let q = document.getElementById("searchInput").value;
    let results = document.getElementById("results");

    results.innerHTML = "Loading...";

    let res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&maxResults=10&key=${YOUTUBE_API_KEY}`);
    let data = await res.json();

    results.innerHTML = "";

    data.items.forEach(item => {
        let div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
        <img src="${item.snippet.thumbnails.medium.url}">
        <p>${item.snippet.title}</p>
        `;

        div.onclick = () => {
            document.getElementById("videoOverlay").classList.add("active");

            if (player && player.loadVideoById) {
                player.loadVideoById(item.id.videoId);
            }

            history.push({
                title: item.snippet.title,
                artist: item.snippet.channelTitle
            });

            localStorage.setItem("history", JSON.stringify(history));
        };

        results.appendChild(div);
    });
}

// WRAPPED - Spotify style cool version
function generateWrapped() {
    if (history.length < 3) {  // Thoda zyada data chahiye cool stats ke liye
        alert("Bhai thoda aur gaane sun le! At least 3-5 songs chahiye full Wrapped ke liye 😅");
        return;
    }

    // 1. Song count (title based)
    let songCount = {};
    history.forEach(h => {
        const key = h.title;  // Ya unique banana ho to title + artist
        songCount[key] = (songCount[key] || 0) + 1;
    });

    // Top songs sorted
    let sortedSongs = Object.entries(songCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);  // Top 5

    // 2. Artist count
    let artistCount = {};
    history.forEach(h => {
        const artist = h.artist || "Unknown Artist";
        artistCount[artist] = (artistCount[artist] || 0) + 1;
    });

    let sortedArtists = Object.entries(artistCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // 3. Total stats
    const totalPlays = history.length;
    const approxMinutes = Math.round(totalPlays * 4);  // Average 4 min per song
    const uniqueSongs = Object.keys(songCount).length;
    const uniqueArtists = Object.keys(artistCount).length;

    // 4. Build cool HTML
    let wrappedHTML = `
        <div style="text-align:center; padding:20px; background: linear-gradient(135deg, #1db954, #191414); border-radius:15px; margin:10px;">
            <h1 style="font-size:3em; margin:0;">🎧 Your StreamFlow Wrapped ⚡</h1>
            <p style="font-size:1.3em; opacity:0.9;">Your year in beats – Delhi se full volume! 🔥</p>
            
            <div style="margin:30px 0;">
                <h2>Total Vibes</h2>
                <p style="font-size:2em;">\( {totalPlays} plays • \~ \){approxMinutes} minutes</p>
                <p>${uniqueSongs} unique songs • ${uniqueArtists} artists discovered</p>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px,1fr)); gap:20px; margin:30px 0;">
                <!-- Top Songs -->
                <div style="background:#222; padding:20px; border-radius:12px;">
                    <h3>Top 5 Songs 🔥</h3>
                    <ol style="text-align:left; padding-left:20px;">
                        \( {sortedSongs.map(([title, count]) => `<li> \){title} – ${count} plays</li>`).join('')}
                    </ol>
                </div>

                <!-- Top Artists -->
                <div style="background:#222; padding:20px; border-radius:12px;">
                    <h3>Top 5 Artists 🎤</h3>
                    <ol style="text-align:left; padding-left:20px;">
                        \( {sortedArtists.map(([artist, count]) => `<li> \){artist} – ${count} plays</li>`).join('')}
                    </ol>
                </div>
            </div>

            <p style="font-size:1.2em; margin-top:30px;">
                ${getFunMessage(sortedArtists[0]?.[0], sortedSongs[0]?.[1])}
            </p>

            <button onclick="document.getElementById('results').innerHTML=''; searchYT();" style="padding:12px 30px; background:#1db954; border:none; color:black; font-weight:bold; border-radius:30px; cursor:pointer; margin-top:20px;">
                Back to Search → 
            </button>
        </div>
    `;

    document.getElementById("results").innerHTML = wrappedHTML;
}

// Fun random message for extra coolness
function getFunMessage(topArtist, topPlays) {
    const messages = [
        `You're basically ${topArtist}'s #1 fan in Delhi! 😎`,
        `This year belonged to ${topArtist} – respect! 🔥`,
        `Top song played ${topPlays} times? Obsessed much? 😂💚`,
        `Your vibe: ${topArtist} on repeat – no regrets! 🎶`,
        `Delhi's hidden ${topArtist} stan spotted! 👀`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
    }

// CLOSE PLAYER
document.getElementById("closeBtn").onclick = () => {
    document.getElementById("videoOverlay").classList.remove("active");
};
