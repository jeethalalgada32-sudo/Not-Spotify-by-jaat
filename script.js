const YOUTUBE_API_KEY = "AIzaSyDU1MC8SVdTJxBYtB5nQastJD7h7D5jyzg";

let player;
let history = JSON.parse(localStorage.getItem("history")) || [];

// Load YouTube API
let tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

// Player
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
                artist: item.snippet.channelTitle,
                time: Date.now()
            });

            localStorage.setItem("history", JSON.stringify(history));
        };

        results.appendChild(div);
    });
}

// 🔥 SMART WRAPPED
function generateWrapped() {
    if (history.length < 5) {
        alert("Listen more songs!");
        return;
    }

    let songCount = {};
    let artistCount = {};
    let repeatSong = "";
    let maxRepeat = 0;

    let night = 0, day = 0;

    history.forEach(item => {
        songCount[item.title] = (songCount[item.title] || 0) + 1;
        artistCount[item.artist] = (artistCount[item.artist] || 0) + 1;

        if (songCount[item.title] > maxRepeat) {
            maxRepeat = songCount[item.title];
            repeatSong = item.title;
        }

        let hour = new Date(item.time).getHours();
        if (hour >= 22 || hour < 5) night++;
        else day++;
    });

    let topSong = Object.keys(songCount).sort((a,b)=>songCount[b]-songCount[a])[0];
    let topArtist = Object.keys(artistCount).sort((a,b)=>artistCount[b]-artistCount[a])[0];

    let personality = "";

    if (maxRepeat >= 4) {
        personality = "🔁 Loop Lover – you replay your favorite song again and again.";
    } else if (night > day) {
        personality = "🌙 Night Listener – late night music is your thing.";
    } else if (Object.keys(songCount).length > history.length / 2) {
        personality = "🔥 Explorer – you love discovering new songs.";
    } else {
        personality = "🎧 Balanced Listener.";
    }

    document.getElementById("results").innerHTML = `
    <div class="wrapped-box">
        <h1>🎧 Your Wrapped</h1>

        <p><b>🔥 Top Song:</b> ${topSong}</p>
        <p><b>🎤 Top Artist:</b> ${topArtist}</p>
        <p><b>🔁 Most Replayed:</b> ${repeatSong} (${maxRepeat}x)</p>
        <p><b>📊 Total Plays:</b> ${history.length}</p>

        <hr>

        <p><b>🧠 Personality:</b> ${personality}</p>
    </div>
    `;
}

// CLOSE PLAYER
document.getElementById("closeBtn").onclick = () => {
    document.getElementById("videoOverlay").classList.remove("active");
};
