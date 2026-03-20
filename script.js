const GEMINI_API_KEY = "AIzaSyC0KhWuivkNagpPhVhqqPKZJZZvnOc-DDI";
const YT_KEY = "AIzaSyDU1MC8SVdTJxBYtB5nQastJD7h7D5jyzg";
let player, isMatrixOn = false;

// 1. Gemini Vibe-Architect
async function askGemini() {
    const input = document.getElementById("searchInput").value;
    if (!input) return;

    try {
        const prompt = `User vibe: "${input}". 
        1. Suggest the best YouTube search term.
        2. Pick a hex color code that matches this vibe.
        Return in JSON format: {"search": "...", "color": "..."}`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await res.json();
        const aiResponse = JSON.parse(data.candidates[0].content.parts[0].text);

        // Apply Crazy AI Effects
        document.documentElement.style.setProperty('--accent', aiResponse.color);
        document.getElementById("searchInput").value = aiResponse.search;
        
        // Custom Matrix Color based on AI
        window.matrixColor = aiResponse.color; 
        
        searchYT();
    } catch (e) { searchYT(); }
}

// 2. Optimized YouTube Search
async function searchYT() {
    const q = document.getElementById("searchInput").value;
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${q}&type=video&key=${YT_KEY}`);
    const data = await res.json();
    const results = document.getElementById("results");
    results.innerHTML = "";

    data.items.forEach(item => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `<img src="${item.snippet.thumbnails.medium.url}"><div style="padding:15px; font-size:13px; font-weight:bold;">${item.snippet.title}</div>`;
        div.onclick = () => {
            player.loadVideoById(item.id.videoId);
            document.getElementById("videoOverlay").classList.add("active");
            document.getElementById("nowPlaying").innerText = "Now Vibing: " + item.snippet.title;
        };
        results.appendChild(div);
    });
}

// 3. Matrix Animation Update
function startMatrixEffect() {
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function draw() {
        if (!isMatrixOn) return;
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Gemini decides the color!
        ctx.fillStyle = window.matrixColor || "#00ff41"; 
        ctx.font = "15px monospace";

        for (let i = 0; i < 100; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            if (Math.random() > 0.95) ctx.fillText(Math.floor(Math.random()*10), x, y);
        }
        requestAnimationFrame(draw);
    }
    draw();
}
// (Rest of the YouTube player and UI logic remains same as previous code)
