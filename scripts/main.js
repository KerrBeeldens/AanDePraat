const form = document.querySelector(".input");
const messageInput = form.querySelector("#message-input");

const chatContainer = document.querySelector(".chat-container");

const messageBlocks = document.querySelectorAll(".message-block.send");
let currentMessageBlock = messageBlocks[messageBlocks.length - 1];

const players = document.querySelectorAll(".voice-message");
let activePlayer;
let pendingReplyIndex = -1;

const replyContext = document.getElementById("reply-context");
const replyContextText = document.getElementById("reply-context-text");
const replyContextCancel = document.getElementById("reply-context-cancel");

const summaryItems = Array.from(document.querySelectorAll(".summary-item"));
const checkedItems = new Set();

const todoDoneAudio = new Audio("resources/ping.mp3");
const victoryAudio = new Audio("resources/victory.mp3");

function playTodoDoneSound() {
  todoDoneAudio.currentTime = 0;
  todoDoneAudio.play();
}

function playVictorySound() {
  victoryAudio.currentTime = 0;
  victoryAudio.play();
}

players.forEach((player) => {
  const audio = player.querySelector("audio");
  audio.removeAttribute("controls");

  const playPauseBtn = player.querySelector(".play-pause");
  const stopBtn = player.querySelector(".stop");
  const rwdBtn = player.querySelector(".rwd");
  const fwdBtn = player.querySelector(".fwd");
  const speedBtn = player.querySelector(".speed");
  const timeLabel = player.querySelector(".time");

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
    timeLabel.textContent = `${minuteValue}:${secondValue}`;
  };
});

function togglePlayback(player, playPauseBtn) {
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
  speedBtn.textContent = newSpeed + "x";
  speedBtn.setAttribute("aria-label", `Afspeelsnelheid: ${newSpeed}x`);
  player.playbackRate = newSpeed;
}

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
  if (!messageText || messageText.trim() === "") return;

  let messageLines = messageText.split("\n");
  messageInput.value = "";

  const replyIndex = pendingReplyIndex;

  let messageSection = document.createElement("section");
  messageSection.className = "chat-message send";

  let header = document.createElement("header");

  let senderName = document.createElement("span");
  senderName.className = "sender-name";
  senderName.textContent = "Jij";

  let senderTime = document.createElement("span");
  senderTime.className = "sender-time";
  let now = new Date();
  senderTime.textContent = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");

  header.appendChild(senderName);
  header.appendChild(senderTime);
  messageSection.appendChild(header);

  if (replyIndex !== -1) {
    const repliedItem = summaryItems[replyIndex];
    const repliedText = repliedItem.querySelector("p").textContent;
    const repliedTitle = repliedItem.querySelector(".sender-name").textContent;

    const quote = document.createElement("blockquote");
    quote.className = "reply-quote";

    const quoteLabel = document.createElement("span");
    quoteLabel.className = "reply-quote-label";
    quoteLabel.textContent = repliedTitle;

    const quoteText = document.createElement("p");
    quoteText.textContent = repliedText;

    quote.appendChild(quoteLabel);
    quote.appendChild(quoteText);
    messageSection.appendChild(quote);
  }

  messageLines.forEach((line) => {
    let messagePara = document.createElement("p");
    messagePara.textContent = line;
    messageSection.appendChild(messagePara);
  });

  if (!currentMessageBlock) {
    currentMessageBlock = document.createElement("div");
    currentMessageBlock.className = "message-block send";
    chatContainer.appendChild(currentMessageBlock);
  }

  currentMessageBlock.appendChild(messageSection);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  if (replyIndex !== -1) {
    checkSummaryItem(replyIndex);
    clearReplyContext();
  }
}

function checkSummaryItem(index) {
  if (checkedItems.has(index)) return;
  checkedItems.add(index);

  const item = summaryItems[index];
  item.classList.add("checked");

  const replyBtn = item.querySelector(".reply-btn");
  if (replyBtn) {
    replyBtn.disabled = true;
    replyBtn.textContent = "✓ Beantwoord";
  }

  const allDone = checkedItems.size === summaryItems.length;

  if (allDone) {
    setTimeout(() => playVictorySound(), 400);
    onAllChecked();
  } else {
    playTodoDoneSound();
  }
}

function onAllChecked() {
  const allDoneBlock = document.createElement("div");
  allDoneBlock.className = "message-block receive";

  const profilePic = document.createElement("img");
  profilePic.src = "resources/aipfp.png";
  profilePic.alt = "";
  profilePic.className = "chat-profile-picture sender";

  const now = new Date();
  const timeStr = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");

  const allDoneMsg = document.createElement("section");
  allDoneMsg.className = "chat-message receive";
  allDoneMsg.setAttribute("aria-live", "polite");
  allDoneMsg.innerHTML = `
    <header>
      <h2 class="sender-name">AI Chatbot</h2>
      <time class="sender-time">${timeStr}</time>
    </header>
    <p>🎉 Je hebt alle vragen van Kerr beantwoord!</p>
  `;

  allDoneBlock.appendChild(profilePic);
  allDoneBlock.appendChild(allDoneMsg);
  chatContainer.appendChild(allDoneBlock);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

const originalVoiceTime = document.querySelector(".message-block.receive .chat-message.receive time.sender-time");

function setReplyContext(index) {
  const item = summaryItems[index];
  const titleEl = item.querySelector(".sender-name");
  const timeStr = originalVoiceTime ? originalVoiceTime.textContent : "";
  const label = timeStr ? `Spraakbericht - ${titleEl.textContent}` : titleEl.textContent;

  pendingReplyIndex = index;

  replyContextText.textContent = label;
  replyContext.classList.remove("hidden");

  messageInput.focus();
}

function clearReplyContext() {
  pendingReplyIndex = -1;
  replyContext.classList.add("hidden");
  replyContextText.textContent = "";
}

replyContextCancel.addEventListener("click", () => {
  clearReplyContext();
});

function wireReplyButtons() {
  summaryItems.forEach((item) => {
    const btn = item.querySelector(".reply-btn");
    const index = parseInt(item.dataset.summaryIndex, 10);
    btn.addEventListener("click", () => {
      setReplyContext(index);
    });
  });
}

const summaryButton = document.querySelector(".summary");
const aiSummaryBlock = document.querySelector("#ai-summary-block");

summaryButton.addEventListener("click", () => {
  aiSummaryBlock.classList.remove("hidden");

  const loaderMessage = aiSummaryBlock.querySelector(".loading-message");
  const summaryContent = aiSummaryBlock.querySelector(".summary-content");

  summaryButton.disabled = true;

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const firstSummary = aiSummaryBlock.querySelector(".first-summary");
  firstSummary.focus();

  setTimeout(() => {
    loaderMessage.classList.add("hidden");
    summaryContent.classList.remove("hidden");

    chatContainer.scrollTop = chatContainer.scrollHeight;

    firstSummary.focus();

    wireReplyButtons();
  }, 2000);
});
