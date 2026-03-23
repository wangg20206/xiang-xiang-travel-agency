function csvToArray(csvText) {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0]
    .split(",")
    .map(h => h.trim().replace(/^"|"$/g, ""));

  return lines.slice(1).map(line => {
    const values = line.match(/(".*?"|[^",\n]+|(?<=,)(?=,)|(?<=,)$)/g) || [];
    const row = {};

    headers.forEach((header, index) => {
      row[header] = (values[index] || "").trim().replace(/^"|"$/g, "");
    });

    return row;
  });
}

function renderTours(data) {
  const container = document.getElementById("tour-list");
  if (!container) return;

  container.innerHTML = "";

  const visibleTours = data
    .filter(tour => String(tour.show).toUpperCase() === "TRUE")
    .sort((a, b) => Number(a.sort_order || 999) - Number(b.sort_order || 999));

  if (visibleTours.length === 0) {
    container.innerHTML = "<p>目前沒有可顯示的行程。</p>";
    return;
  }

  visibleTours.forEach(tour => {
    const card = document.createElement("div");
    card.className = "tour-card";

    card.innerHTML = `
      <img src="${tour.image}" alt="${tour.title}" class="tour-card-image">
      <div class="tour-card-body">
        <h3>${tour.title}</h3>
        <p class="tour-meta">${tour.days}｜${tour.price}</p>
        <p class="tour-description">${tour.description}</p>
        <a href="${tour.link}" class="tour-link">查看行程</a>
      </div>
    `;

    container.appendChild(card);
  });
}

async function loadToursFromSheet() {
  try {
    const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQdtSh_SFuCPFv3Yq3SuxoGzsFyNFv301WdLJjChgqXx1B7WKeNsYmX9RNClyRER-UaEPxoNDK5XHwA/pub?output=csv";
    const response = await fetch(sheetUrl);
    const csvText = await response.text();

    const tours = csvToArray(csvText);
    renderTours(tours);
  } catch (error) {
    console.error("載入 Google Sheet 失敗：", error);

    const container = document.getElementById("tour-list");
    if (container) {
      container.innerHTML = "<p>目前無法載入行程資料。</p>";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadToursFromSheet();
});