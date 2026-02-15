class PortfolioAnalytics {
    constructor() {
        this.gaEnabled = false;
        this.gaMeasurementId = 'G-SKF50RZWN2';
        this.init();
    }

    init() {
        this.setupGA();
        this.sendPageView();
        this.trackClicks();
        this.markUITracked();
    }

    setupGA() {
        if (typeof gtag !== 'undefined') {
            this.gaEnabled = true;
            try {
                gtag('js', new Date());
                gtag('config', this.gaMeasurementId);
            } catch (e) {}
            console.log('Google Analytics initialized');
        }
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
        if (this.gaEnabled && typeof gtag !== 'undefined') {
            gtag('event', eventName, data);
        }
    }

    markUITracked() {
        const viewEl = document.getElementById('view-count');
        if (viewEl) viewEl.textContent = 'Tracked';
        const clickEl = document.getElementById('click-count');
        if (clickEl) clickEl.textContent = 'Tracked';
    }

    // Admin helper
    getAnalyticsData() {
        return {
            message: 'Analytics are collected by Google Analytics (GA4). Use the GA console to view reports.'
        };
    }
}

// Initialize analytics
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioAnalytics = new PortfolioAnalytics();
});