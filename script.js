// --- 1. CONFIG & STATE ---
const YOUTUBE_API_KEY = "AIzaSyDU1MC8SVdTJxBYtB5nQastJD7h7D5jyzg";
let player;
let matrixInterval;

// --- 2. SIDEBAR LOGIC ---
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
if (menuBtn) {
    menuBtn.onclick = () => sidebar.classList.toggle("show");
}

document.querySelectorAll(".sidebar a").forEach(link => {
    link.onclick = () => {
        const target = link.dataset.page;
        document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
        if(document.getElementById(target)) document.getElementById(target).classList.add("active");
        sidebar.classList.remove("show");
    }
});

// --- 3. YOUTUBE PLAYER ---
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%', width: '100%', videoId: '',
        playerVars: { 'autoplay': 1, 'playsinline': 1, 'rel': 0 },
        events: { 'onStateChange': (e) => { if(e.data == 1) startMatrix(); } }
    });
}

// --- 4. MATRIX EFFECT ---
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');
let characters = "01010101STREAMFLOWMATRIXBYSOURAV";
let fontSize = 15;
let columns;
let drops = [];

function initMatrix() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = [];
    for (let i = 0; i < columns; i++) drops[i] = 1;
}

function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0F0"; // Green Matrix
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}

function startMatrix() {
    if (matrixInterval) clearInterval(matrixInterval);
    initMatrix();
    matrixInterval = setInterval(drawMatrix, 40);
}

// --- 5. SEARCH LOGIC ---
async function searchYT() {
    const query = document.getElementById("searchInput").value;
    if (!query) return;
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p>Searching...</p>";

    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${query}&type=video&key=${YOUTUBE_API_KEY}`);
        const data = await res.json();
        resultsDiv.innerHTML = "";
        
        data.items.forEach(item => {
            const div = document.createElement("div");
            div.className = "card";
            div.innerHTML = `<img src="${item.snippet.thumbnails.medium.url}"><div class="card-info">${item.snippet.title}</div>`;
            div.onclick = () => {
                player.loadVideoById(item.id.videoId);
                document.getElementById("videoOverlay").classList.add("active");
            };
            resultsDiv.appendChild(div);
        });
    } catch (e) { resultsDiv.innerHTML = "Error!"; }
}

document.getElementById("closeBtn").onclick = () => {
    document.getElementById("videoOverlay").classList.remove("active");
    clearInterval(matrixInterval);
    player.stopVideo();
};

window.addEventListener('resize', initMatrix);
