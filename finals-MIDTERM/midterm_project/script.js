const searchBtn = document.getElementById("searchBtn");
const wordInput = document.getElementById("wordInput");
const clearInputBtn = document.getElementById("clearInputBtn");
const resultDiv = document.getElementById("resultCard");

// Word of the Day elements
const wotdBtn = document.getElementById("wotdBtn");
const wotdDisplay = document.getElementById("wotdDisplay");

// Search for a word using the Dictionary API
function searchWord(word = null, targetDiv = resultDiv) {
  const searchWord = word || wordInput.value.trim().toLowerCase();

  if (searchWord === "") {
    targetDiv.innerHTML = `<p>Please enter a word to search.</p>`;
    return;
  }

  targetDiv.innerHTML = `<p>⏳ Searching for "<b>${searchWord}</b>"...</p>`;

  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchWord}`)
    .then(response => response.json())
    .then(data => {
      if (!Array.isArray(data)) {
        targetDiv.innerHTML = `<p>No results found for "<b>${searchWord}</b>". Try another word.</p>`;
        return;
      }

      const entry = data[0];
      const phonetic = entry.phonetics.find(p => p.text)?.text || "";
      const audioUrl = entry.phonetics.find(p => p.audio)?.audio;
      const meanings = entry.meanings;

      let output = `
        <h3>${entry.word} <small>${phonetic}</small>
        ${audioUrl ? `<audio controls src="${audioUrl}"></audio>` : ""}</h3>
        <hr>
      `;

      meanings.forEach(m => {
        output += `<p><b>${m.partOfSpeech}</b></p>`;
        m.definitions.slice(0, 2).forEach((def, i) => {
          output += `<p>${i + 1}. ${def.definition}</p>`;
        });
        output += `<hr>`;
      });

      targetDiv.innerHTML = output;
    })
    .catch(error => {
      targetDiv.innerHTML = `<p>⚠️ Error fetching data. Please try again later.</p>`;
      console.error("Dictionary API Error:", error);
    });
}

// ===== Word of the Day Function =====
function getWordOfTheDay() {
  wotdDisplay.innerHTML = "✨ Fetching today's word...";

  // Primary: Wordnik API (Word of the Day)
  fetch("https://api.wordnik.com/v4/words.json/wordOfTheDay?api_key=YOUR_API_KEY")
    .then(res => res.json())
    .then(data => {
      const word = data.word;
      const meaning = data.definitions?.[0]?.text || "Meaning unavailable.";
      wotdDisplay.innerHTML = `<span class="wotd-word">${word}</span> — <span class="wotd-meaning">${meaning}</span>`;
    })
    .catch(() => {
      // Fallback: Local random word + Dictionary API
      const fallbackWords = ["serendipity", "eloquent", "tenacious", "ineffable", "ephemeral", "ambivalent", "benevolent"];
      const randomWord = fallbackWords[Math.floor(Math.random() * fallbackWords.length)];

      fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${randomWord}`)
        .then(res => res.json())
        .then(info => {
          const meaning = info[0]?.meanings[0]?.definitions[0]?.definition || "Meaning unavailable.";
          wotdDisplay.innerHTML = `<span class="wotd-word">${randomWord}</span> — <span class="wotd-meaning">${meaning}</span>`;
        })
        .catch(() => {
          wotdDisplay.innerHTML = "⚠️ Could not fetch Word of the Day.";
        });
    });
}


// Event Listeners
searchBtn.addEventListener("click", () => searchWord());
wordInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") searchWord();
});
clearInputBtn.addEventListener("click", () => {
  wordInput.value = "";
  wordInput.focus();
  resultDiv.innerHTML = "";
});
wotdBtn.addEventListener("click", getWordOfTheDay);
