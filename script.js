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

// WRAPPED
function generateWrapped() {
    if (history.length < 2) {
        alert("Listen more songs!");
        return;
    }

    let songCount = {};
    history.forEach(h => {
        songCount[h.title] = (songCount[h.title] || 0) + 1;
    });

    let topSong = Object.keys(songCount).sort((a,b)=>songCount[b]-songCount[a])[0];

    document.getElementById("results").innerHTML = `
    <h1>🎧 Your Wrapped</h1>
    <p>Top Song: ${topSong}</p>
    <p>Total Plays: ${history.length}</p>
    `;
}

// CLOSE PLAYER
document.getElementById("closeBtn").onclick = () => {
    document.getElementById("videoOverlay").classList.remove("active");
};
