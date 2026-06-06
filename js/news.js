// 宣告全域變數，方便我們在 gallery.js 統一控制兩邊的暫停/播放
let newsSwiperInstance;

function initNewsSwiper() {
    if (newsSwiperInstance) {
        newsSwiperInstance.destroy(true, true);
    }
    newsSwiperInstance = new Swiper('.newsSwiper', {
        loop: true,
        autoplay: { delay: 4000, disableOnInteraction: false },
        navigation: { nextEl: '.news-next', prevEl: '.news-prev' },
        pagination: { el: '.news-pagination', clickable: true },
    });
}

async function fetchJapanNews() {
    try {
        const rssUrl = "https://english.kyodonews.net/rss/news.xml";
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === "ok") {
            const newsContainer = document.getElementById("news-container");
            newsContainer.innerHTML = "";

            // 取 5 則新聞讓輪播比較豐富
            const newsItems = data.items.slice(0, 5);

            newsItems.forEach(item => {
                // 外層包裝成 swiper-slide
                const slide = document.createElement("div");
                slide.className = "swiper-slide";

                const newsCard = document.createElement("div");
                newsCard.className = "news-card";

                const title = document.createElement("h3");
                title.textContent = item.title;

                const description = document.createElement("p");
                description.textContent =
                    item.description && item.description.length > 80
                        ? item.description.substring(0, 80) + "..."
                        : (item.description || "無描述");

                const link = document.createElement("a");
                link.href = item.link;
                link.textContent = "閱讀更多";
                link.target = "_blank";

                const img = document.createElement("img");
                if (item.enclosure && item.enclosure.link) {
                    img.src = item.enclosure.link;
                    img.alt = item.title;
                } else {
                    img.src = "https://source.unsplash.com/400x250/?japan,news";
                    img.alt = "預設新聞圖片";
                }

                newsCard.appendChild(img);
                newsCard.appendChild(title);
                newsCard.appendChild(description);
                newsCard.appendChild(link);

                slide.appendChild(newsCard);
                newsContainer.appendChild(slide);
            });
            
            // ★ 新聞載入完畢後，啟動新聞輪播
            initNewsSwiper();
            
        } else {
            throw new Error("RSS 資料格式錯誤");
        }
    } catch (error) {
        console.error("抓取新聞時發生錯誤:", error);

        const newsContainer = document.getElementById("news-container");
        
        // 備用靜態資料 (加上 swiper-slide 外層，並替換為 maxresdefault.jpg 高清圖)
        newsContainer.innerHTML = `
            <div class="swiper-slide">
                <div class="news-card">
                    <img src="https://i.ytimg.com/vi/0gYoV9Byug4/maxresdefault.jpg" alt="工頭堅YT">
                    <h3>日本溫泉大解密！13分鐘認識日本名湯 日本溫泉飯店推薦</h3>
                    <p>溫泉，早已是日本文化的一部分，更是旅客規劃行程的重要元素與體驗...</p>
                    <a href="https://www.youtube.com/watch?v=0gYoV9Byug4&list=LL&index=23" target="_blank">
                        <div class="action">前往觀看此影片</div>
                    </a>
                </div>
            </div>

            <div class="swiper-slide">
                <div class="news-card">
                    <img src="https://i.ytimg.com/vi/Ic-XJlGkcGw/maxresdefault.jpg" alt="工頭堅YT">
                    <h3>日本各地玩什麼？ 20分鐘完整認識 日本旅遊地理 ｜日本旅遊</h3>
                    <p>2025</p>
                    <a href="https://youtu.be/Ic-XJlGkcGw?si=Dbl7sE8R7bpWMuxe" target="_blank">
                        <div class="action">前往觀看此影片</div>
                    </a>
                </div>
            </div>

            <div class="swiper-slide">
                <div class="news-card">
                    <img src="https://i.ytimg.com/vi/7t71LxGjVX8/maxresdefault.jpg" alt="Ken">
                    <h3>東京必吃，超濃巧克力泡芙！</h3>
                    <p>東京銀座 Patisserie Ten& #東京旅行東京銀座 Patisserie Ten...</p>
                    <a href="https://www.youtube.com/watch?v=7t71LxGjVX8&list=LL&index=71" target="_blank">
                        <div class="action">前往觀看此短片</div>
                    </a>
                </div>
            </div>

            <div class="swiper-slide">
                <div class="news-card">
                    <img src="https://i.ytimg.com/vi/JbYxFIz_dO0/maxresdefault.jpg" alt="冷水"> 
                    <h3>全網獨家！深入探訪日本收入最低的村莊</h3>
                    <p>山裡的生活究竟如何？聽聽當地老人的真實回答…深入探訪日本群馬縣南牧村...</p>
                    <a href="https://youtu.be/JbYxFIz_dO0?si=7SLTFdJRrGkaYc5u" target="_blank">
                        <div class="action">前往觀看此影片</div>
                    </a>
                </div>
            </div>

            <div class="swiper-slide">
                <div class="news-card">
                    <img src="https://i.ytimg.com/vi/VrS0F6Og1no/maxresdefault.jpg" alt="Ken">
                    <h3>我在日本體驗了自己的葬禮</h3>
                    <p>談戀愛 組樂隊 開演唱會，你敢信這是日本和尚在做的?...</p>
                    <a href="https://youtu.be/VrS0F6Og1no?si=kA-Vb6-tY3U8dEEw" target="_blank">
                        <div class="action">前往觀看此影片</div>
                    </a>
                </div>
            </div>
        `;
        
        // ★ 備用新聞載入完畢後，啟動新聞輪播
        initNewsSwiper();
    }
}

fetchJapanNews();
setInterval(fetchJapanNews, 1800000);