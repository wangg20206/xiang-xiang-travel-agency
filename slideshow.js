let slideIndex = 0;
let slides;
let slideInterval;

function showSlides() {
    slides = document.querySelectorAll(".slide");

    if (slides.length === 0) {
        console.log("找不到幻燈片，請檢查 HTML 結構！");
        return;
    }

    slides.forEach(slide => {
        slide.style.display = "none";
    });

    if (slideIndex >= slides.length) slideIndex = 0;
    if (slideIndex < 0) slideIndex = slides.length - 1;

    slides[slideIndex].style.display = "block";
}

function startSlideShow() {
    slideInterval = setInterval(() => {
        slideIndex++;
        showSlides();
    }, 5000);
}

function plusSlides(n) {
    clearInterval(slideInterval);
    slideIndex += n;
    showSlides();
    startSlideShow();
}

window.addEventListener("load", () => {
    showSlides();
    startSlideShow();
});