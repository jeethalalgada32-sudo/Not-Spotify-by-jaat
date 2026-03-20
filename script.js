const YOUTUBE_API_KEY = "AIzaSyDU1MC8SVdTJxBYtB5nQastJD7h7D5jyzg";
let player, net, matrixInterval;
let isMatrixOn = false;

// 1. Load AI Model
async function loadBodyPix() {
    net = await bodyPix.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 0.75,
        quantBytes: 2
    });
    console.log("AI Ready for Sourav's Site! 🔥"); //
}
loadBodyPix();

// 2. Sidebar Logic
document.getElementById("menuBtn").onclick = () => document.getElementById("sidebar").classList.toggle("show");

// 3. YouTube API Setup
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%', width: '100%', videoId: '',
        playerVars: { 'autoplay': 1, 'playsinline': 1 },
        events: { 'onStateChange': (e) => { if(e.data == 1 && isMatrixOn) startTracking(); } }
    });
}

// 4. AI Tracking Matrix Logic
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');
const chars = "01STREAMFLOWMATRIX";

async function startTracking() {
    if (!isMatrixOn || !player) return;

    const videoElement = document.querySelector('iframe');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    try {
        // AI Body Segmentation
        const segmentation = await net.segmentPerson(videoElement, {
            internalResolution: 'medium',
            segmentationThreshold: 0.7
        });

        // Clear and Draw Matrix on Body
        ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = "10px monospace";
        const step = 12;

        for (let y = 0; y < canvas.height; y += step) {
            for (let x = 0; x < canvas.width; x += step) {
                const index = y * canvas.width + x;
                if (segmentation.data[index] === 1) { // 1 = Body Pixel
                    ctx.fillStyle = "#00ff41";
                    const char = chars[Math.floor(Math.random() * chars.length)];
                    ctx.fillText(char, x, y);
                }
            }
        }
    } catch (e) { console.log("CORS/Loading issue..."); }

    if (isMatrixOn) requestAnimationFrame(startTracking);
}

// 5. Toggle & Search
document.getElementById("matrixToggle").onclick = function() {
    isMatrixOn = !isMatrixOn;
    this.classList.toggle('on');
    this.innerText = isMatrixOn ? "AI Matrix: ON" : "AI Matrix: OFF";
    canvas.style.display = isMatrixOn ? "block" : "none";
    if (isMatrixOn) startTracking();
};

async function searchYT() {
    const q = document.getElementById("searchInput").value;
    if (!q) return;
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&q=${q}&type=video&key=${YOUTUBE_API_KEY}`);
    const data = await res.json();
    const results = document.getElementById("results");
    results.innerHTML = "";
    data.items.forEach(item => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `<img src="${item.snippet.thumbnails.medium.url}"><div style="padding:10px; font-size:12px;">${item.snippet.title}</div>`;
        div.onclick = () => {
            player.loadVideoById(item.id.videoId);
            document.getElementById("videoOverlay").classList.add("active");
        };
        results.appendChild(div);
    });
}

document.getElementById("closeBtn").onclick = () => {
    document.getElementById("videoOverlay").classList.remove("active");
    isMatrixOn = false;
    player.stopVideo();
};
    
