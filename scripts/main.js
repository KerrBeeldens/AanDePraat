const form = document.querySelector(".input");
const messageInput = form.querySelector("#message-input");

const chatContainer = document.querySelector(".chat-container");

const messageBlocks = document.querySelectorAll(".message-block.send");
let currentMessageBlock = messageBlocks[messageBlocks.length - 1];

// Audio elements
const playPauseBtn = document.querySelector(".play-pause");
const stopBtn = document.querySelector(".stop");
const rwdBtn = document.querySelector(".rwd");
const fwdBtn = document.querySelector(".fwd");
const speedBtn = document.querySelector(".speed")
const timeLabel = document.querySelector(".time");
const player = document.querySelector("audio");

// Remove all native controls
player.removeAttribute("controls");

playPauseBtn.addEventListener("click", () => {
  if (player.paused) {
    player.play();
    playPauseBtn.textContent = "Pause";
  } else {
    player.pause();
    playPauseBtn.textContent = "Play";
  }
});

messageInput.addEventListener("keydown", (e) => {
  // Ctrl + Space (or Cmd + Space alternative)
  if ((e.ctrlKey || e.metaKey) && e.code === "Space") {
    e.preventDefault();
    if (player.paused) {
      player.play();
      playPauseBtn.textContent = "Pause";
    } else {
      player.pause();
      playPauseBtn.textContent = "Play";
    }
  }
});

stopBtn.addEventListener("click", () => {
  player.pause();
  player.currentTime = 0;
  playPauseBtn.textContent = "Play";
});

rwdBtn.addEventListener("click", () => {
  player.currentTime -= 3;
});

fwdBtn.addEventListener("click", () => {
  player.currentTime += 3;
  if (player.currentTime >= player.duration || player.paused) {
    player.pause();
    player.currentTime = 0;
    playPauseBtn.textContent = "Play";
  }
});

player.ontimeupdate = () => {
  const minutes = Math.floor(player.currentTime / 60);
  const seconds = Math.floor(player.currentTime - minutes * 60);
  const minuteValue = minutes < 10 ? `0${minutes}` : minutes;
  const secondValue = seconds < 10 ? `0${seconds}` : seconds;

  const mediaTime = `${minuteValue}:${secondValue}`;
  timeLabel.textContent = mediaTime;
};

speedBtn.addEventListener("click", () => {
  let newSpeed;

  console.log(speedBtn.textContent);

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
  senderTime.textContent =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0");

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
