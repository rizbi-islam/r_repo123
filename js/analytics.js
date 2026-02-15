class PortfolioAnalytics {
    constructor() {
        this.gaEnabled = false;
        this.gaMeasurementId = 'G-SKF50RZWN2';
        this.viewsKey = 'portfolio_views';
        this.clicksKey = 'portfolio_clicks_count';
        this.init();
    }

    init() {
        this.setupGA();
        this.incrementViewCount();
        this.sendPageView();
        this.trackClicks();
        this.displayCounts();
    }

    setupGA() {
        if (typeof gtag !== 'undefined') {
            this.gaEnabled = true;
            try {
                gtag('js', new Date());
                gtag('config', this.gaMeasurementId);
            } catch (e) {}
            console.log('Google Analytics (GA4) initialized with ID: ' + this.gaMeasurementId);
        }
    }

    incrementViewCount() {
        let views = this.getViews();
        views.total = (views.total || 0) + 1;
        views.lastVisit = new Date().toISOString();
        this.saveViews(views);
    }

    sendPageView() {
        if (this.gaEnabled && typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href
            });
        }
    }

    trackClicks() {
        document.addEventListener('click', (e) => {
            const target = e.target;

            if (target.closest('.project-card') || target.closest('.btn-qa')) {
                this.trackEvent('project_click', {
                    element: target.tagName,
                    text: target.textContent?.trim()
                });
            }

            if (target.matches('a[href^="mailto:"]') || target.closest('a[href^="mailto:"]')) {
                const emailLink = target.href ? target : target.closest('a[href^="mailto:"]');
                const email = (emailLink.href || '').replace('mailto:', '');
                this.trackEvent('email_click', { email });
            }

            if (target.matches('a[href$=".pdf"]') || target.textContent?.toLowerCase().includes('resume')) {
                this.trackEvent('resume_download');
            }
        });
    }

    trackEvent(eventName, data = {}) {
        // Increment click counter for engagement events
        if (eventName && (eventName.includes('click') || eventName === 'resume_download')) {
            let clicks = this.getClicksCount();
            clicks.total = (clicks.total || 0) + 1;
            clicks.last = new Date().toISOString();
            this.saveClicksCount(clicks);
            this.displayCounts();
        }

        // Send to GA4
        if (this.gaEnabled && typeof gtag !== 'undefined') {
            gtag('event', eventName, data);
        }
    }

    displayCounts() {
        const views = this.getViews();
        const clicks = this.getClicksCount();

        const viewEl = document.getElementById('view-count');
        if (viewEl) {
            viewEl.textContent = (views.total || 0).toString();
        }

        const clickEl = document.getElementById('click-count');
        if (clickEl) {
            clickEl.textContent = (clicks.total || 0).toString();
        }
    }

    getViews() {
        return JSON.parse(localStorage.getItem(this.viewsKey) || '{}');
    }

    saveViews(views) {
        localStorage.setItem(this.viewsKey, JSON.stringify(views));
    }

    getClicksCount() {
        return JSON.parse(localStorage.getItem(this.clicksKey) || '{}');
    }

    saveClicksCount(countObj) {
        localStorage.setItem(this.clicksKey, JSON.stringify(countObj));
    }

    // Admin helper
    getAnalyticsData() {
        return {
            views: this.getViews(),
            clicks: this.getClicksCount(),
            message: 'Views and clicks shown here are local browser counts. Full analytics are in Google Analytics (GA4: ' + this.gaMeasurementId + ')'
        };
    }
}

// Initialize analytics
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioAnalytics = new PortfolioAnalytics();
});