function scrollToDay(dayId, clickedBtn = null) {
  document.querySelectorAll("#day-nav button").forEach(btn => btn.classList.remove("active"));
  if (clickedBtn) clickedBtn.classList.add("active");

  const target = document.getElementById(dayId);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current);
      current = "";
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(current);
      if (row.some(cell => cell !== "")) rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  if (current !== "" || row.length) {
    row.push(current);
    if (row.some(cell => cell !== "")) rows.push(row);
  }

  return rows;
}

function csvRowsToObjects(rows) {
  if (!rows.length) return [];
  const header = rows[0].map(cell => (cell || "").trim());

  return rows
    .slice(1)
    .filter(row => row.some(cell => String(cell || "").trim() !== ""))
    .map(row => {
      const obj = {};
      header.forEach((key, index) => {
        obj[key] = (row[index] || "").trim();
      });
      return obj;
    });
}

function parseKeyValueCSV(rows) {
  if (!rows.length) return {};

  const header = rows[0].map(cell => cell.trim());
  const keyIndex = header.indexOf("key");
  const valueIndex = header.indexOf("value");

  if (keyIndex === -1 || valueIndex === -1) {
    console.error("頁面內容 sheet 缺少 key / value 欄位");
    return {};
  }

  const data = {};
  rows.slice(1).forEach(row => {
    const key = (row[keyIndex] || "").trim();
    const value = (row[valueIndex] || "").trim();
    if (key) data[key] = value;
  });

  return data;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || "";
}

function setImage(id, value) {
  const el = document.getElementById(id);
  if (el && value) el.src = value;
}

function setLink(id, value) {
  const el = document.getElementById(id);
  if (el && value) el.href = value;
}

function formatSheetHtml(value) {
  return String(value || "").replace(/\r?\n/g, "<br>");
}

function renderPageContent(data) {
  document.title = data.page_title || "想翔旅遊社";

  setText("hero-title-main", data.hero_title_main);
  setText("hero-title-highlight", data.hero_title_highlight);
  setText("hero-subtitle", data.hero_subtitle);
  setImage("hero-image", data.hero_image);

  setText("price-text", data.price_text);
  setText("people-info", data.people_info);
  setText("travel-type", data.travel_type);
  setText("depart-date", data.depart_date);
  setText("return-date", data.return_date);
  setText("city-info", data.city_info);
  setText("disclaimer", data.disclaimer);
  setLink("download-link", data.download_link);

  setText("flight-title", data.flight_title);
  setText("flight-notice", data.flight_notice);

  setText("outbound-airline", data.outbound_airline);
  setText("outbound-code", data.outbound_code);
  setText("outbound-date", data.outbound_date);
  setText("outbound-time1", data.outbound_time1);
  setText("outbound-from", data.outbound_from);
  setText("outbound-time2", data.outbound_time2);
  setText("outbound-to", data.outbound_to);

  setText("return-airline", data.return_airline);
  setText("return-code", data.return_code);
  setText("return-date2", data.return_date2);
  setText("return-time1", data.return_time1);
  setText("return-from", data.return_from);
  setText("return-time2", data.return_time2);
  setText("return-to", data.return_to);

  setText("summary-title", data.summary_title || "行程亮點");

  if (data.summary_intro_html) {
    const introEl = document.getElementById("summary-intro");
    if (introEl) introEl.innerHTML = formatSheetHtml(data.summary_intro_html);
  }
}

function getDetailBlocks(item) {
  const detailNumbers = Object.keys(item)
    .map(key => {
      const match = key.match(/^detail_(\d+)_title$/);
      return match ? Number(match[1]) : null;
    })
    .filter(num => num !== null)
    .sort((a, b) => a - b);

  return detailNumbers
    .map(num => ({
      title: item[`detail_${num}_title`] || "",
      text: item[`detail_${num}_text`] || ""
    }))
    .filter(detail => detail.title || detail.text);
}

function createImgTag(src, className, alt) {
  if (!src) return "";
  return `<img src="${src}" alt="${alt}" class="${className}">`;
}

function renderHighlights(items) {
  const container = document.getElementById("highlights-container");
  if (!container) return;

  const validItems = items
    .filter(item => (item.section_title || item.intro_title || item.main_img || item.side_img_1 || item.side_img_2).trim() !== "")
    .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0));

  if (!validItems.length) {
    container.innerHTML = `<div class="highlight-empty">目前 highlights 工作表還沒有可顯示的資料。</div>`;
    return;
  }

  container.innerHTML = validItems.map(item => {
    const extras = [item.extra_img_1, item.extra_img_2, item.extra_img_3, item.extra_img_4].filter(Boolean);
    const layoutClass = extras.length > 0 ? "layout-7" : "layout-3";
    const details = getDetailBlocks(item);
    const introTitle = item.intro_title ? `<strong>${item.intro_title}: </strong>` : "";
    const detailsHtml = details.length
      ? `
        <details>
          <summary>
            <span style="cursor: pointer;font-size: 15px;color: rgb(0, 38, 255);text-align: center;text-decoration: underline;">詳細介紹</span>
          </summary>
          ${details.map(detail => `
            <p class="journey-text">
              ${detail.title ? `<strong>${detail.title}</strong><br>` : ""}
              ${formatSheetHtml(detail.text)}
            </p>
          `).join("")}
        </details>
      `
      : "";

    return `
      <div class="highlight-section ${layoutClass}" id="${item.section_id || ""}">
        <div class="trip-header">
          <h2 style="font-size: 35px; color:rgb(0, 0, 0);">${item.section_title || ""}</h2>
        </div>

        <div class="highlight-media">
          <div class="highlight-media-top">
            <div class="highlight-main-wrap">
              ${createImgTag(item.main_img, "highlight-main-img", `${item.section_title || "主圖片"}`)}
            </div>
            <div class="highlight-side-stack">
              ${createImgTag(item.side_img_1, "highlight-side-img", `${item.section_title || "右上圖片"}`)}
              ${createImgTag(item.side_img_2, "highlight-side-img", `${item.section_title || "右下圖片"}`)}
            </div>
          </div>
          ${extras.length ? `
            <div class="highlight-extra-grid">
              ${extras.map((src, idx) => createImgTag(src, "highlight-extra-img", `${item.section_title || "額外圖片"} ${idx + 1}`)).join("")}
            </div>
          ` : ""}
        </div>

        <p class="journey-text">
          ${introTitle}${formatSheetHtml(item.intro_text)}
        </p>

        ${detailsHtml}
      </div>
    `;
  }).join("");
}

function loadPageContent() {
  fetch(CONTENT_CSV_URL)
    .then(res => res.text())
    .then(text => {
      const rows = parseCSV(text);
      const data = parseKeyValueCSV(rows);
      renderPageContent(data);
    })
    .catch(err => {
      console.error("讀取頁面內容 Google Sheet 失敗:", err);
    });
}

function loadHighlights() {
  fetch(HIGHLIGHTS_CSV_URL)
    .then(res => res.text())
    .then(text => {
      const rows = parseCSV(text);
      const items = csvRowsToObjects(rows);
      renderHighlights(items);
    })
    .catch(err => {
      console.error("讀取 highlights Google Sheet 失敗:", err);
      const container = document.getElementById("highlights-container");
      if (container) {
        container.innerHTML = `<div class="highlight-empty">行程亮點區塊載入失敗，請檢查 highlights 工作表是否已公開。</div>`;
      }
    });
}

function groupTrips(dataRows, colIndex) {
  const trips = [];
  let currentTrip = null;

  dataRows.forEach((row) => {
    const day = (row[colIndex.day] || "").trim();
    const dayLabel = (row[colIndex.day_label] || "").trim();
    const route = (row[colIndex.route] || "").trim();
    const breakfast = (row[colIndex.breakfast] || "").trim();
    const lunch = (row[colIndex.lunch] || "").trim();
    const dinner = (row[colIndex.dinner] || "").trim();
    const hotel = (row[colIndex.hotel] || "").trim();

    if (day) {
      currentTrip = {
        day,
        dayLabel: dayLabel || day.toUpperCase(),
        routes: [],
        breakfast: breakfast || "",
        lunch: lunch || "",
        dinner: dinner || "",
        hotel: hotel || ""
      };
      trips.push(currentTrip);
    }

    if (!currentTrip) return;

    if (route) currentTrip.routes.push(route);
    if (breakfast) currentTrip.breakfast = breakfast;
    if (lunch) currentTrip.lunch = lunch;
    if (dinner) currentTrip.dinner = dinner;
    if (hotel) currentTrip.hotel = hotel;
  });

  return trips;
}

function parseRowsToObjects(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map(h => h.trim());

  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = (row[i] || "").trim();
    });
    return obj;
  }).filter(item => item.title || item.text);
}

function renderSummaryItems(items) {
  const container = document.getElementById("summary-intro-list");
  if (!container) return;

  const sortedItems = items.sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0));

  container.innerHTML = sortedItems.map(item => `
    <div class="summary-item">
      <h3 class="summary-item-title">${item.title || ""}</h3>
      <p class="summary-item-text">${item.text || ""}</p>
    </div>
  `).join("");
}

function loadSummaryItems() {
  fetch(SUMMARY_ITEMS_CSV_URL)
    .then(res => res.text())
    .then(text => {
      const rows = parseCSV(text);
      const items = parseRowsToObjects(rows);
      renderSummaryItems(items);
    })
    .catch(err => {
      console.error("讀取 summary_items 失敗:", err);
    });
}

/* ===== 新增：每日行程詳細介紹 ===== */

function buildDayDetailMap(rows) {
  if (!rows || !rows.length) return {};

  const headers = rows[0].map(h => h.trim().toLowerCase());
  const idx = Object.fromEntries(headers.map((h, i) => [h, i]));

  const map = {};

  rows.slice(1).forEach(row => {
    const day = String(row[idx.day] || "").trim();
    if (!day) return;

    if (!map[day]) map[day] = [];

    map[day].push({
      day,
      sort: Number(row[idx.sort] || 999),
      type: String(row[idx.type] || "").trim().toLowerCase(),
      title: String(row[idx.title] || "").trim(),
      content: String(row[idx.content] || "").trim()
    });
  });

  Object.values(map).forEach(list => {
    list.sort((a, b) => a.sort - b.sort);
  });

  return map;
}

function formatDetailText(text = "") {
  return String(text || "").replace(/\r?\n/g, "<br>");
}

function renderDetailGroupBox(icon, items) {
  return `
    <div class="day-detail-box">
      <div class="day-detail-icon">${icon}</div>
      <div class="day-detail-box-content">
        ${items.map(item => `
          <div class="day-detail-line">
            ${item.title ? `<span class="day-detail-label">${item.title}</span>` : ""}
            <span class="day-detail-value">${formatDetailText(item.content)}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderDayDetails(day, detailMap) {
  const items = detailMap[String(day)] || [];
  if (!items.length) return "";

  const meals = items.filter(item => item.type === "meal");
  const hotels = items.filter(item => item.type === "hotel");
  const intro = items.find(item => item.type === "intro");
  const sections = items.filter(item => item.type === "section");

  return `
    <div class="day-detail-wrap">
      ${(meals.length || hotels.length) ? `
        <div class="day-detail-top">
          ${meals.length ? renderDetailGroupBox("🍴", meals) : ""}
          ${hotels.length ? renderDetailGroupBox("🏨", hotels) : ""}
        </div>
      ` : ""}

      ${intro ? `
        <div class="day-detail-intro">
          ${formatDetailText(intro.content)}
        </div>
      ` : ""}

      ${sections.map(sec => `
        <div class="day-detail-section">
          <h3 class="day-detail-section-title">${sec.title}</h3>
          <div class="day-detail-section-content">${formatDetailText(sec.content)}</div>
        </div>
      `).join("")}
    </div>
  `;
}

function loadDayDetails() {
  if (typeof DAY_DETAIL_CSV_URL === "undefined" || !DAY_DETAIL_CSV_URL) {
    return Promise.resolve({});
  }

  return fetch(DAY_DETAIL_CSV_URL)
    .then(res => res.text())
    .then(text => {
      const rows = parseCSV(text);
      return buildDayDetailMap(rows);
    })
    .catch(err => {
      console.error("讀取 day detail Google Sheet 失敗:", err);
      return {};
    });
}

function renderTrips(rows, detailMap = {}) {
  const nav = document.getElementById("day-nav");
  const container = document.getElementById("day-container");

  nav.innerHTML = "";
  container.innerHTML = "";

  if (!rows.length) {
    container.innerHTML = `
      <div style="max-width:960px;margin:30px auto;padding:20px;background:#fff;border:1px solid #ddd;border-radius:10px;">
        Google Sheet 沒有資料。
      </div>
    `;
    return;
  }

  const header = rows[0].map(cell => (cell || "").trim());
  const dataRows = rows.slice(1).filter(row => row.some(cell => cell && cell.trim() !== ""));

  const colIndex = {
    day: header.indexOf("day"),
    day_label: header.indexOf("day_label"),
    route: header.indexOf("route"),
    breakfast: header.indexOf("breakfast"),
    lunch: header.indexOf("lunch"),
    dinner: header.indexOf("dinner"),
    hotel: header.indexOf("hotel")
  };

  const missingColumns = Object.entries(colIndex)
    .filter(([key, value]) => value === -1)
    .map(([key]) => key);

  if (missingColumns.length > 0) {
    container.innerHTML = `
      <div style="max-width:960px;margin:30px auto;padding:20px;background:#fff;border:1px solid #ddd;border-radius:10px;">
        找不到這些欄位：${missingColumns.join(", ")}<br>
        請確認第一列欄名為：day、day_label、route、breakfast、lunch、dinner、hotel
      </div>
    `;
    return;
  }

  const trips = groupTrips(dataRows, colIndex);

  trips.forEach((trip, index) => {
    const routeText = trip.routes.join(" → ");

    const btn = document.createElement("button");
    btn.textContent = trip.dayLabel || `DAY ${index}`;
    if (index === 0) btn.classList.add("active");
    btn.addEventListener("click", () => scrollToDay(trip.day, btn));
    nav.appendChild(btn);

    const section = document.createElement("div");
    section.id = trip.day;
    section.className = "day-section";

    section.innerHTML = `
      <div class="day-description">
        ${trip.dayLabel}<br>
        ${routeText}
      </div>

      <div class="info-card">
        <div class="info-section">
          <div class="info-item">
            <div class="meal-group">
              <div class="icon">🍽️</div>
              <div class="meal-text">
                <div><span class="label">早餐</span>${trip.breakfast || "—"}</div>
                <div><span class="label">午餐</span>${trip.lunch || "—"}</div>
                <div><span class="label">晚餐</span>${trip.dinner || "—"}</div>
              </div>
            </div>
          </div>

          <div class="info-item">
            <div class="meal-group">
              <div class="icon">🏨</div>
              <div class="meal-text">
                <span class="label">飯店住宿</span>${trip.hotel || "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      ${renderDayDetails(trip.day, detailMap)}
    `;

    container.appendChild(section);
  });

  setupStickyNav();
}

function setupStickyNav() {
  const dayNav = document.getElementById("day-nav");
  if (!dayNav) return;

  const navOffsetTop = dayNav.offsetTop;

  window.addEventListener("scroll", () => {
    if (window.scrollY >= navOffsetTop) {
      dayNav.classList.add("fixed");
    } else {
      dayNav.classList.remove("fixed");
    }
  });
}

function loadTripData() {
  Promise.all([
    fetch(CSV_URL).then(res => res.text()),
    loadDayDetails()
  ])
    .then(([tripText, detailMap]) => {
      const rows = parseCSV(tripText);
      renderTrips(rows, detailMap);
    })
    .catch(err => {
      console.error("讀取 Google Sheet CSV 失敗:", err);
      document.getElementById("day-container").innerHTML = `
        <div style="max-width:960px;margin:30px auto;padding:20px;background:#fff;border:1px solid #ddd;border-radius:10px;">
          每日行程載入失敗，請檢查 CSV 連結是否公開。
        </div>
      `;
    });
}

document.addEventListener("DOMContentLoaded", function () {
  loadTripData();
  loadPageContent();
  loadHighlights();
  loadSummaryItems();

  fetch("header.html")
    .then(response => response.text())
    .then(data => document.getElementById("header-container").innerHTML = data)
    .catch(error => console.error("載入 header 失敗:", error));

  fetch("footer.html")
    .then(response => response.text())
    .then(data => document.getElementById("footer-container").innerHTML = data)
    .catch(error => console.error("載入 footer 失敗:", error));

  const backToTopBtn = document.getElementById("backToTopBtn");
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
});


