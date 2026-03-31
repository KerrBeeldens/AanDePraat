const form = document.querySelector(".input");
const messageInput = form.querySelector("#message-input");

const chatContainer = document.querySelector(".chat-container");

const messageBlocks = document.querySelectorAll(".message-block.send");
const currentMessageBlock = messageBlocks[messageBlocks.length - 1];

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
