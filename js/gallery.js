let gallerySwiper;

document.addEventListener("DOMContentLoaded", function() {
    // 1. 初始化右側：精彩回顧輪播
    gallerySwiper = new Swiper('.mySwiper', {
        loop: true,
        autoplay: { delay: 3000, disableOnInteraction: false },
        navigation: { nextEl: '.gallery-next', prevEl: '.gallery-prev' },
        pagination: { el: '.gallery-pagination', clickable: true },
    });

    // 2. 暫停/繼續 按鈕邏輯 (同步控制 newsSwiperInstance)
    const toggleBtn = document.getElementById('toggle-btn');
    let isPlaying = true;

    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            if (isPlaying) {
                // 暫停兩邊輪播
                gallerySwiper.autoplay.stop();
                if (window.newsSwiperInstance) window.newsSwiperInstance.autoplay.stop();
                toggleBtn.innerHTML = '▶ 繼續輪播';
                isPlaying = false;
            } else {
                // 繼續兩邊輪播
                gallerySwiper.autoplay.start();
                if (window.newsSwiperInstance) window.newsSwiperInstance.autoplay.start();
                toggleBtn.innerHTML = '⏸ 暫停輪播';
                isPlaying = true;
            }
        });
    }
});