const input = document.querySelector("#tweet-link");
const output = document.querySelector("#gif-link");
const preview = document.querySelector("#gif-preview");
const previewEmpty = document.querySelector("#preview-empty");
const message = document.querySelector("#message");
const pasteButton = document.querySelector("#paste-button");
const copyLinkButton = document.querySelector("#copy-link-button");

const MAX_INPUT_LENGTH = 2048;
const POST_ID_PATTERN = /^\d{2,20}$/;
const USERNAME_PATTERN = /^[A-Za-z0-9_]{1,15}$/;
const EMPTY_OUTPUT_TEXT = "paste a valid post link first";

const validHosts = new Set([
  "x.com",
  "twitter.com",
  "mobile.twitter.com",
  "fxtwitter.com",
  "fixupx.com",
  "d.fxtwitter.com",
  "d.fixupx.com"
]);

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
  message.hidden = false;
}

function clearMessage() {
  message.textContent = "";
  message.className = "message";
  message.hidden = true;
}

function parsePostUrl(value) {
  const raw = value.trim();
  if (!raw) throw new Error("Paste a post link first.");
  if (raw.length > MAX_INPUT_LENGTH) throw new Error("That link is too long.");

  const match = raw.match(/^https?:\/\/[^\s<>"']+$/i);
  if (!match) throw new Error("That does not look like a valid link.");

  const rawUrl = match[0].toLowerCase();
  if (
    rawUrl.includes("\\") ||
    rawUrl.includes("%2e") ||
    rawUrl.includes("%2f") ||
    rawUrl.includes("%5c") ||
    /(^|\/)\.{1,2}(\/|$)/.test(rawUrl)
  ) {
    throw new Error("That link is not safe.");
  }

  let url;
  try {
    url = new URL(match[0]);
  } catch {
    throw new Error("That does not look like a valid link.");
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (!validHosts.has(host)) throw new Error("Paste an X/Twitter link.");

  const parts = url.pathname.split("/").filter(Boolean);
  const statusIndex = parts.findIndex((part) => part === "status" || part === "statuses");
  const postId = parts[statusIndex + 1] || "";
  const username = parts[statusIndex - 1] || "";

  if (statusIndex < 1 || !USERNAME_PATTERN.test(username) || !POST_ID_PATTERN.test(postId)) {
    throw new Error("Could not find a post in that link.");
  }

  return `https://d.fxtwitter.com/${username}/status/${postId}`;
}

function setOutput(link) {
  output.textContent = link;
  output.href = link;
  output.setAttribute("aria-disabled", "false");
  preview.src = link;
  preview.hidden = false;
  previewEmpty.hidden = true;
  copyLinkButton.disabled = false;
}

function clearOutput() {
  output.textContent = EMPTY_OUTPUT_TEXT;
  output.removeAttribute("href");
  output.setAttribute("aria-disabled", "true");
  preview.removeAttribute("src");
  preview.hidden = true;
  previewEmpty.hidden = false;
  copyLinkButton.disabled = true;
}

async function copyText(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.readOnly = true;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

async function pasteFromClipboard() {
  if (!navigator.clipboard?.readText || !window.isSecureContext) {
    input.focus();
    throw new Error("paste is blocked here. tap the field and paste.");
  }

  const text = await navigator.clipboard.readText();
  if (!text.trim()) throw new Error("Clipboard is empty.");
  if (text.length > MAX_INPUT_LENGTH) throw new Error("That link is too long.");

  input.value = text.trim();
  const link = parsePostUrl(input.value);
  setOutput(link);
}

function updateOutput() {
  clearMessage();

  try {
    const link = parsePostUrl(input.value);
    setOutput(link);
  } catch {
    clearOutput();
  }
}

pasteButton.addEventListener("click", async () => {
  clearMessage();

  try {
    await pasteFromClipboard();
    showMessage("pasted.", "success");
  } catch (error) {
    clearOutput();
    showMessage(error.message || "Could not paste from clipboard.", "error");
  }
});

copyLinkButton.addEventListener("click", async () => {
  try {
    const link = parsePostUrl(input.value);
    await copyText(link);
    setOutput(link);
    showMessage("copied.", "success");
  } catch (error) {
    clearOutput();
    showMessage(error.message || "Could not generate the GIF link.", "error");
  }
});

clearOutput();
input.addEventListener("input", updateOutput);
