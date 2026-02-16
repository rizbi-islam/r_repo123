class PortfolioAnalytics {
    constructor() {
        this.gaEnabled = false;
        this.gaMeasurementId = null;
        this.viewsKey = 'portfolio_views';
        this.clicksKey = 'portfolio_clicks_count';
        this.loadConfigAndInit();
    }

    async loadConfigAndInit() {
        try {
            const res = await fetch('data/ga.json', { cache: 'no-store' });
            if (res.ok) {
                const cfg = await res.json();
                if (cfg && cfg.enabled && cfg.measurementId) {
                    this.gaMeasurementId = cfg.measurementId;
                    await this.loadGAScript(this.gaMeasurementId);
                }
            }
        } catch (e) {
            // Fail silently, analytics are optional
            console.warn('GA config load failed', e);
        }

        this.setupGA();
        this.incrementViewCount();
        this.sendPageView();
        this.trackClicks();
        this.displayCounts();
    }

    loadGAScript(id) {
        return new Promise((resolve) => {
            if (!id) return resolve();
            // If script already present, resolve
            if (document.querySelector('script[data-ga="' + id + '"]')) return resolve();
            const s = document.createElement('script');
            s.async = true;
            s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
            s.setAttribute('data-ga', id);
            s.onload = () => {
                try {
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){window.dataLayer.push(arguments);} // local wrapper
                    window.gtag = window.gtag || gtag;
                    window.gtag('js', new Date());
                    window.gtag('config', id);
                    this.gaEnabled = true;
                    console.log('GA script loaded for', id);
                } catch (e) {}
                resolve();
            };
            s.onerror = () => resolve();
            document.head.appendChild(s);
        });
    }

    setupGA() {
        if (typeof gtag !== 'undefined' && this.gaMeasurementId) {
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

document.addEventListener("DOMContentLoaded", () => {
    new PortfolioAnalytics();
});
