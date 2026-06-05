function fitCardTitles() {
    document.querySelectorAll(".news-card h3").forEach(title => {
        let fontSize = 22;
        title.style.fontSize = `${fontSize}px`;

        while (title.scrollWidth > title.clientWidth && fontSize > 11) {
            fontSize -= 0.5;
            title.style.fontSize = `${fontSize}px`;
        }
    });
}

function setupChoicePagination() {
    document.querySelectorAll(".news-container").forEach((container, containerIndex) => {
        const cards = [...container.querySelectorAll(".news-card")];
        if (!cards.length) return;

        container.nextElementSibling?.classList.contains("choice-pagination")
            && container.nextElementSibling.remove();

        const pagination = document.createElement("div");
        pagination.className = "choice-pagination";
        pagination.setAttribute("aria-label", "選擇卡片頁面");

        cards.forEach((card, index) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "choice-pagination-dot";
            dot.setAttribute("aria-label", `前往第 ${index + 1} 個選項`);
            if (index === 0) dot.classList.add("active");

            dot.addEventListener("click", () => {
                container.scrollTo({
                    left: card.offsetLeft - container.offsetLeft,
                    behavior: "smooth"
                });
            });

            pagination.appendChild(dot);
        });

        pagination.dataset.containerIndex = containerIndex;
        container.insertAdjacentElement("afterend", pagination);

        let frameId;
        container.addEventListener("scroll", () => {
            cancelAnimationFrame(frameId);
            frameId = requestAnimationFrame(() => {
                let activeIndex = 0;
                let closestDistance = Infinity;

                cards.forEach((card, index) => {
                    const distance = Math.abs(card.offsetLeft - container.offsetLeft - container.scrollLeft);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        activeIndex = index;
                    }
                });

                pagination.querySelectorAll(".choice-pagination-dot").forEach((dot, index) => {
                    dot.classList.toggle("active", index === activeIndex);
                });
            });
        }, { passive: true });
    });
}

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

        card.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                const href = card.getAttribute("data-href");
                if (href) {
                    window.location.href = href;
                }
            }
        });
    });

    fitCardTitles();
    setupChoicePagination();
});

window.addEventListener("resize", fitCardTitles);
