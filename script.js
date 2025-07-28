async function askIslamicQuestion() {
  const question = document.getElementById("question").value.trim();
  const responseBox = document.getElementById("response");
  responseBox.innerText = "⏳ در حال بررسی سؤال شما...";

  const category = detectCategory(question);
  let responseText = "";

  try {
    switch (category) {
      case "quran":
        let res = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(question)}/all/fa`);
        let data = await res.json();
        if (data.data?.count > 0) {
          let verse = data.data.matches[0];
          responseText = `📖 آیه:\n${verse.text}\n📍 سوره: ${verse.surah.name}, آیه: ${verse.numberInSurah}`;
        }
        break;

      case "ahkam":
        responseText = `🧾 احکام اسلامی:\nنماز، روزه، زکات و...`; // ← اینجا می‌تونی API وصل کنی
        break;

      case "sharai":
        responseText = `⚖️ سؤال شرعی:\nدر حال دریافت فتوا...`; // ← جای اتصال به شیخ GPT
        break;

      default:
        responseText = "❓ نوع سؤال مشخص نشد.";
    }

    responseBox.innerText = responseText;
    saveToHistory(question, responseText);
  } catch (err) {
    responseBox.innerText = "❌ خطا در دریافت پاسخ.";
  }
}

function detectCategory(q) {
  q = q.toLowerCase();
  if (q.includes("قرآن") || q.includes("سوره") || q.includes("آیه")) return "quran";
  if (q.includes("نماز") || q.includes("روزه") || q.includes("زکات")) return "ahkam";
  if (q.includes("حرام") || q.includes("طلاق") || q.includes("فتوا")) return "sharai";
  return "general";
}

function speakAnswer() {
  const responseText = document.getElementById("response").innerText;
  let utter = new SpeechSynthesisUtterance(responseText);
  utter.lang = 'fa-IR';
  speechSynthesis.speak(utter);
}

async function translateAnswer() {
  const text = document.getElementById("response").innerText;
  let res = await fetch("https://libretranslate.de/translate", {
    method: "POST",
    body: JSON.stringify({ q: text, source: "fa", target: "en" }),
    headers: { "Content-Type": "application/json" }
  });
  let data = await res.json();
  document.getElementById("response").innerText = `🌐 ترجمه:\n${data.translatedText}`;
}

function saveToHistory(question, response) {
  let historyDiv = document.getElementById("history");
  let entry = document.createElement("div");
  entry.innerText = `❓ ${question}\n✅ ${response}`;
  entry.style.borderTop = "1px solid #ccc";
  entry.style.marginTop = "10px";
  historyDiv.appendChild(entry);

  let history = JSON.parse(localStorage.getItem("history")) || [];
  history.push({ question, response });
  localStorage.setItem("history", JSON.stringify(history));
}
