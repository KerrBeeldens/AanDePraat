const form = document.querySelector(".input");
const messageInput = form.querySelector("#message-input");

const chatContainer = document.querySelector(".chat-container");

const messageBlocks = document.querySelectorAll(".message-block.send");
let currentMessageBlock = messageBlocks[messageBlocks.length - 1];

const players = document.querySelectorAll(".voice-message");
let activePlayer;

// Setup players
players.forEach((player) => {
  // Remove all native controls
  const audio = player.querySelector("audio");
  audio.removeAttribute("controls");

  // Audio elements
  const playPauseBtn = player.querySelector(".play-pause");
  const stopBtn = player.querySelector(".stop");
  const rwdBtn = player.querySelector(".rwd");
  const fwdBtn = player.querySelector(".fwd");
  const speedBtn = player.querySelector(".speed");
  const timeLabel = player.querySelector(".time");

  // Button Event listeners
  playPauseBtn.addEventListener("click", () => {
    togglePlayback(audio, playPauseBtn);
    activePlayer = player;
  });

  stopBtn.addEventListener("click", () => {
    stop(audio, playPauseBtn);
    activePlayer = player;
  });

  rwdBtn.addEventListener("click", () => {
    rewind(audio);
    activePlayer = player;
  });

  fwdBtn.addEventListener("click", () => {
    forward(audio, playPauseBtn);
    activePlayer = player;
  });

  speedBtn.addEventListener("click", () => {
    cycleSpeed(audio, speedBtn);
  });

  audio.ontimeupdate = () => {
    const minutes = Math.floor(audio.currentTime / 60);
    const seconds = Math.floor(audio.currentTime - minutes * 60);
    const minuteValue = minutes < 10 ? `0${minutes}` : minutes;
    const secondValue = seconds < 10 ? `0${seconds}` : seconds;

    const mediaTime = `${minuteValue}:${secondValue}`;
    timeLabel.textContent = mediaTime;
  };

  // // When ANY element inside gets focus
  // player.addEventListener("focusin", (e) => {
  //   activePlayer = e.currentTarget;
  // });

  // // When ANY element inside is clicked
  // player.addEventListener("click", () => {
  //   activePlayer = player;
  // });
});

// Voice message controls
function togglePlayback(player, playPauseBtn) {
  // Stop all other players
  players.forEach((audio) => {
    if (audio.querySelector("audio") !== player) {
      stop(audio.querySelector("audio"), audio.querySelector(".play-pause"));
    }
  });

  if (player.paused) {
    player.play();
    playPauseBtn.textContent = "Pause";
  } else {
    player.pause();
    playPauseBtn.textContent = "Play";
  }
}

function stop(player, playPauseBtn) {
  player.pause();
  player.currentTime = 0;
  playPauseBtn.textContent = "Play";
}

function rewind(player) {
  player.currentTime -= 3;
}

function forward(player, playPauseBtn) {
  player.currentTime += 3;
  if (player.currentTime >= player.duration) {
    player.pause();
    player.currentTime = 0;
    playPauseBtn.textContent = "Play";
  }
}

function cycleSpeed(player, speedBtn) {
  let newSpeed;

  switch (speedBtn.textContent) {
    case "1x":
      newSpeed = 1.5;
      break;
    case "1.5x":
      newSpeed = 2;
      break;
    case "2x":
      newSpeed = 2.5;
      break;
    case "2.5x":
      newSpeed = 1;
      break;
  }

  speedBtn.textContent = newSpeed.toString() + "x";
  speedBtn.setAttribute("aria-label", `Afspeelsnelheid: ${newSpeed}x`);
  player.playbackRate = newSpeed;
}

// Keyboard shortcuts
document.body.addEventListener("keydown", (e) => {
  if (!activePlayer) return;
  const isModifier = e.ctrlKey || e.metaKey;
  if (!isModifier) return;

  const audio = activePlayer.querySelector("audio");
  const playPauseBtn = activePlayer.querySelector(".play-pause");
  const speedBtn = activePlayer.querySelector(".speed");

  switch (e.code) {
    case "Space":
      e.preventDefault();
      togglePlayback(audio, playPauseBtn);
      break;

    case "ArrowLeft":
      e.preventDefault();
      rewind(audio);
      break;

    case "ArrowRight":
      e.preventDefault();
      forward(audio, playPauseBtn);
      break;

    case "ArrowUp":
      e.preventDefault();
      cycleSpeed(audio, speedBtn);
      break;
  }
});

// Source - https://stackoverflow.com/q/8187512
// Posted by user1027620, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-30, License - CC BY-SA 3.0

messageInput.addEventListener("keydown", (e) => {
  if (e.keyCode == 13) {
    if (e.ctrlKey) {
      messageInput.value += "\n";
      return;
    }

    e.preventDefault();
    sendMessage();
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

function sendMessage() {
  let messageText = messageInput.value;

  // If the message is empty or only whitespace, do nothing
  if (!messageText || messageText.trim() === "") return;
  let messageLines = messageText.split("\n");

  messageInput.value = "";

  // Create the chat message element
  let messageSection = document.createElement("section");
  messageSection.className = "chat-message send";

  // Create the header
  let header = document.createElement("header");

  // Sender name
  let senderName = document.createElement("span");
  senderName.className = "sender-name";
  senderName.textContent = "Jij";

  // Local time
  let senderTime = document.createElement("span");
  senderTime.className = "sender-time";
  let now = new Date();
  senderTime.textContent = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");

  header.appendChild(senderName);
  header.appendChild(senderTime);
  messageSection.appendChild(header);

  // Create paragraphs for each line, preserving whitespaces
  messageLines.forEach((line) => {
    let messagePara = document.createElement("p");
    messagePara.textContent = line;
    messageSection.appendChild(messagePara);
  });

  // Create new message block if needed
  if (!currentMessageBlock) {
    currentMessageBlock = document.createElement("div");
    currentMessageBlock.className = "message-block";
    chatContainer.appendChild(currentMessageBlock);
  }

  // Append the section to the message block
  currentMessageBlock.appendChild(messageSection);

  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Fake AI generation delay
const summaryButton = document.querySelector(".summary");
const aiSummaryBlock = document.querySelector("#ai-summary-block");

summaryButton.addEventListener("click", () => {
  // Show block with loader
  aiSummaryBlock.classList.remove("hidden");

  const loaderMessage = aiSummaryBlock.querySelector(".loading-message");
  const summaryContent = aiSummaryBlock.querySelector(".summary-content");

  // Prevent double clicking
  summaryButton.disabled = true;

  // Scroll again after content appears
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Move keyboard focus to first summary
  const firstSummary = aiSummaryBlock.querySelector(".first-summary");
  firstSummary.focus();

  // Fake AI loading delay
  setTimeout(() => {
    loaderMessage.classList.add("hidden");
    summaryContent.classList.remove("hidden");

    // Scroll again after content appears
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Focus first summary
    const firstSummary = aiSummaryBlock.querySelector(".first-summary");
    firstSummary.focus();
  }, 2000);
});
