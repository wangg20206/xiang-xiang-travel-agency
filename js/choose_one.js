document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".news-card").forEach(card => {
        card.addEventListener("click", event => {
            if (!event.target.classList.contains("btn")) {
                const href = card.getAttribute("data-href");
                if (href) {
                    window.location.href = href;
                }
            }
        });
    });
});