"use strict";

const checklist = [...document.querySelectorAll(".purchase-checklist input")];
const progress = document.querySelector("#check-progress");
const storageKey = "pc-guide-purchase-check-v1";
let storageAvailable = true;

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
  if (Array.isArray(saved)) {
    for (const box of checklist) box.checked = saved.includes(box.name);
  }
} catch {
  storageAvailable = false;
}

function checkedNames() {
  return checklist.filter(box => box.checked).map(box => box.name);
}

function renderProgress() {
  progress.textContent = checkedNames().length + " / " + checklist.length + " 項目を確認済み";
  if (!storageAvailable) progress.textContent += "（このブラウザには保存できません）";
}

for (const box of checklist) {
  box.addEventListener("change", () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(checkedNames()));
      storageAvailable = true;
    } catch {
      storageAvailable = false;
    }
    renderProgress();
  });
}
progress.hidden = false;
renderProgress();
