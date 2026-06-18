export default function handler(req, res) {
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Talk to Sarah — Master Voice Automation</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #0f0c1e;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }
  .card {
    background: #fff;
    border-radius: 24px;
    padding: 2.5rem 2rem 2rem;
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
  }
  .badge {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #534AB7;
    background: #EEEDFE;
    padding: 4px 14px;
    border-radius: 99px;
  }
  h1 {
    font-size: 22px;
    font-weight: 600;
    color: #1a1a2e;
    text-align: center;
    line-height: 1.3;
  }
  p.sub {
    font-size: 14px;
    color: #888;
    text-align: center;
    line-height: 1.6;
    max-width: 300px;
  }
  .orb-wrap {
    position: relative;
    width: 110px;
    height: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0.5rem 0;
  }
  .orb {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: #534AB7;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
    transition: background 0.3s;
  }
  .orb.listening { background: #3C3489; }
  .orb.error { background: #c0392b; }
  .orb svg { width: 34px; height: 34px; fill: #fff; }
  .ring {
    position: absolute;
    border-radius: 50%;
    border: 2px solid #534AB7;
    opacity: 0;
  }
  .ring1 { width: 100px; height: 100px; }
  .ring2 { width: 116px; height: 116px; }
  .listening-active .ring1 { animation: pulse 1.8s ease-out infinite; }
  .listening-active .ring2 { animation: pulse 1.8s ease-out infinite 0.5s; }
  @keyframes pulse {
    0% { opacity: 0.7; transform: scale(0.85); }
    100% { opacity: 0; transform: scale(1.15); }
  }
  .waves { display: none; align-items: center; gap: 3px; height: 28px; }
  .waves.active { display: flex; }
  .bar {
    width: 3px;
    border-radius: 99px;
    background: #534AB7;
    animation: wave 1s ease-in-out infinite;
  }
  .bar:nth-child(1){height:8px;animation-delay:0s}
  .bar:nth-child(2){height:16px;animation-delay:.15s}
  .bar:nth-child(3){height:24px;animation-delay:.3s}
  .bar:nth-child(4){height:16px;animation-delay:.45s}
  .bar:nth-child(5){height:8px;animation-delay:.6s}
  @keyframes wave {
    0%,100%{transform:scaleY(0.5);opacity:0.5}
    50%{transform:scaleY(1);opacity:1}
  }
  .status {
    font-size: 13px;
    font-weight: 500;
    color: #534AB7;
    min-height: 20px;
    text-align: center;
  }
  .btn-start {
    width: 100%;
    padding: 15px;
    border-radius: 14px;
    border: none;
    background: #534AB7;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.2s, transform 0.1s;
  }
  .btn-start:hover { background: #3C3489; }
  .btn-start:active { transform: scale(0.98); }
  .btn-start:disabled { background: #AFA9EC; cursor: not-allowed; }
  .btn-end {
    width: 100%;
    padding: 13px;
    border-radius: 14px;
    border: 1.5px solid #E24B4A;
    background: transparent;
    color: #A32D2D;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    display: none;
  }
  .btn-end:hover { background: #FCEBEB; }
  .footer { font-size: 12px; color: #bbb; text-align: center; }
  .logo { font-size: 13px; font-weight: 700; color: #534AB7; letter-spacing: 0.02em; }
</style>
</head>
<body>
<div class="card">
  <div class="logo">Master Voice Automation</div>
  <span class="badge">Live AI Demo</span>
  <h1>Talk to Sarah, our AI receptionist</h1>
  <p class="sub">Sarah handles calls for home service businesses 24/7. Ask her about scheduling, pricing, or emergencies.</p>

  <div class="orb-wrap" id="orbWrap">
    <div class="orb" id="orb">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zm-1 3a1 1 0 0 1 2 0v8a1 1 0 0 1-2 0V4zM7 11a5 5 0 0 0 10 0h2a7 7 0 0 1-6 6.92V21h2v2H9v-2h2v-3.08A7 7 0 0 1 5 11h2z"/>
      </svg>
    </div>
    <div class="ring ring1"></div>
    <div class="ring ring2"></div>
  </div>

  <div class="waves" id="waves">
    <div class="bar"></div><div class="bar"></div><div class="bar"></div>
    <div class="bar"></div><div class="bar"></div>
  </div>

  <div class="status" id="status">Click below to start the demo</div>

  <button class="btn-start" id="btnStart" onclick="startCall()">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
    Start conversation
  </button>
  <button class="btn-end" id="btnEnd" onclick="endCall()">End call</button>

  <p class="footer">Microphone access required &nbsp;·&nbsp; Your info stays private</p>
</div>

<script type="module">
  import { RetellWebClient } from "https://esm.sh/retell-client-js-sdk@latest";

  const BACKEND = "https://retell-backend-rho.vercel.app";
  const AGENT_ID = "agent_4cf5ce74faa61c4a27f7661216";
  const client = new RetellWebClient();

  const orb = document.getElementById("orb");
  const orbWrap = document.getElementById("orbWrap");
  const status = document.getElementById("status");
  const btnStart = document.getElementById("btnStart");
  const btnEnd = document.getElementById("btnEnd");
  const waves = document.getElementById("waves");

  function setStatus(msg, state) {
    status.textContent = msg;
    orb.className = "orb" + (state ? " " + state : "");
    orbWrap.className = "orb-wrap" + (state === "listening" ? " listening-active" : "");
    waves.className = "waves" + (state === "listening" ? " active" : "");
  }

  client.on("call_started", () => {
    setStatus("Sarah is listening...", "listening");
    btnStart.style.display = "none";
    btnEnd.style.display = "block";
  });

  client.on("call_ended", () => {
    setStatus("Call ended — someone from our team will follow up!", "");
    btnStart.style.display = "block";
    btnStart.textContent = "Start again";
    btnStart.disabled = false;
    btnEnd.style.display = "none";
  });

  client.on("agent_start_talking", () => setStatus("Sarah is speaking...", "listening"));
  client.on("agent_stop_talking", () => setStatus("Sarah is listening...", "listening"));

  client.on("error", (err) => {
    console.error(err);
    setStatus("Something went wrong. Please try again.", "error");
    btnStart.disabled = false;
    btnStart.style.display = "block";
    btnEnd.style.display = "none";
  });

  window.startCall = async function() {
    btnStart.disabled = true;
    setStatus("Connecting to Sarah...", "");
    try {
      const res = await fetch(BACKEND + "/api/create-web-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_id: AGENT_ID }),
      });
      const data = await res.json();
      await client.startCall({ accessToken: data.access_token });
    } catch (e) {
      console.error(e);
      setStatus("Could not connect. Check your connection.", "error");
      btnStart.disabled = false;
    }
  };

  window.endCall = function() { client.stopCall(); };
</script>
</body>
</html>`);
}
