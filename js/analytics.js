class PortfolioAnalytics {
    constructor() {
        this.gaMeasurementId = 'G-SKF50RZWN2';
        this.waitForGA();
    }

    waitForGA() {
        const check = setInterval(() => {
            if (window.gtag) {
                clearInterval(check);
                this.initializeTracking();
            }
        }, 100);
    }

    initializeTracking() {
        console.log("GA4 ready");
        this.trackClicks();
        this.markUITracked();
    }

    trackClicks() {
        document.addEventListener("click", (e) => {
            const target = e.target.closest("a, .project-card, .btn-qa");
            if (!target) return;

            const eventData = {
                event_category: "engagement",
                event_label: target.textContent?.trim() || "unknown"
            };

            if (target.href?.includes("mailto:")) {
                gtag("event", "email_click", eventData);
            } else if (target.href?.includes(".pdf")) {
                gtag("event", "resume_download", eventData);
            } else {
                gtag("event", "click", eventData);
            }
        });
    }

    markUITracked() {
        const viewEl = document.getElementById("view-count");
        if (viewEl) viewEl.textContent = "GA4";

        const clickEl = document.getElementById("click-count");
        if (clickEl) clickEl.textContent = "GA4";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new PortfolioAnalytics();
});
