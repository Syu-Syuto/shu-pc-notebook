const form = document.querySelector("#search");
const input = document.querySelector("#query");
const results = document.querySelector("#results");
const status = document.querySelector("#status");
const matches = document.querySelector("#matches");

function normalize(text) {
  return text.normalize("NFKC").toLowerCase()
    .replace(/[ァ-ヶ]/g, kana => String.fromCharCode(kana.charCodeAt(0) - 96))
    .replace(/[‐‑–—−-]/g, "")
    .replace(/[、。！？!?・（）()]/g, " ").trim();
}

const entries = categories.flatMap(([, category, articles]) =>
  articles.map(([id, title, words]) => ({
    id, title, category, name: normalize(title), keywords: normalize(words).split(/\s+/)
  }))
);

function score(entry, phrase, terms) {
  if (entry.name === phrase) return 100;
  const compactPhrase = phrase.replace(/[+\s]/g, "");
  if (compactPhrase && entry.keywords.includes(compactPhrase)) return 25;
  let points = entry.name.includes(phrase) ? 14 : 0;
  for (const term of terms) {
    if (entry.name.includes(term)) points += 10;
    else if (entry.keywords.includes(term)) points += 7;
    else if (term.length >= 2 && entry.keywords.some(word => word.includes(term))) points += 3;
    else return 0;
  }
  return points + (entry.id === "onedrive" ? 1 : 0);
}

function render() {
  const phrase = normalize(input.value);
  results.hidden = !phrase;
  matches.replaceChildren();
  if (!phrase) return;
  const terms = [...new Set(phrase.split(/\s+/))];
  const ranked = entries.map(entry => [entry, score(entry, phrase, terms)])
    .filter(([, points]) => points > 0).sort((a, b) => b[1] - a[1]);
  status.textContent = ranked.length ? ranked.length + "件の記事" : "一致する記事がありません。短い言葉でもお試しください。";
  for (const [{ id, title, category }] of ranked) {
    const row = document.createElement("li");
    const link = document.createElement("a");
    link.href = publishedArticles[id] ?? "404.html?article=" + id;
    link.textContent = title;
    const label = document.createElement("small");
    label.textContent = category;
    row.append(link, label);
    matches.append(row);
  }
}
form.hidden = false;
input.addEventListener("input", event => { if (!event.isComposing) render(); });
input.addEventListener("compositionend", render);
form.addEventListener("submit", event => {
  event.preventDefault();
  render();
  if (!results.hidden) results.scrollIntoView({ block: "nearest" });
});
