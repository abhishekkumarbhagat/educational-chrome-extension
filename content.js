// Educational content filter - Content Script
// This script runs on every webpage to analyze and filter content

let filterActive = true;
let categories = {};
let customSites = [];

// Educational domains and patterns
const educationalDomains = {
    academic: [
        '.edu', '.ac.', 'scholar.google', 'researchgate.net', 'academia.edu',
        'jstor.org', 'pubmed.ncbi.nlm.nih.gov', 'arxiv.org', 'ieee.org',
        'springer.com', 'nature.com', 'sciencedirect.com', 'mit.edu',
        'stanford.edu', 'harvard.edu', 'cambridge.org', 'oxford.ac.uk'
    ],
    'online-courses': [
        'coursera.org', 'edx.org', 'udacity.com', 'khanacademy.org',
        'udemy.com', 'lynda.com', 'pluralsight.com', 'skillshare.com',
        'masterclass.com', 'codecademy.com', 'treehouse.com', 'brilliant.org',
        'futurelearn.com', 'canvas.net', 'alison.com'
    ],
    documentation: [
        'developer.mozilla.org', 'stackoverflow.com', 'github.com', 'gitlab.com',
        'docs.', 'documentation.', 'api.', 'guides.', 'tutorial.',
        'w3schools.com', 'freecodecamp.org', 'tutorialspoint.com',
        'geeksforgeeks.org', 'devdocs.io'
    ],
    'news-educational': [
        'scientificamerican.com', 'nationalgeographic.com', 'smithsonianmag.com',
        'newscientist.com', 'science.org', 'nature.com', 'livescience.com',
        'howstuffworks.com', 'ted.com', 'bbc.com/future', 'vox.com/science'
    ],
    reference: [
        'wikipedia.org', 'britannica.com', 'dictionary.com', 'merriam-webster.com',
        'thesaurus.com', 'translate.google.com', 'wolfram.com',
        'mathworld.wolfram.com', 'reference.com', 'encyclopedia.com'
    ]
};

// Educational keywords for content analysis
const educationalKeywords = [
    'education', 'learning', 'tutorial', 'course', 'lesson', 'study',
    'research', 'academic', 'science', 'university', 'college', 'school',
    'knowledge', 'teach', 'learn', 'student', 'professor', 'lecture',
    'documentation', 'guide', 'how-to', 'explanation', 'theory',
    'analysis', 'methodology', 'experiment', 'data', 'statistics'
];

// Non-educational content patterns to filter
const nonEducationalPatterns = [
    'entertainment', 'celebrity', 'gossip', 'sports', 'gaming', 'viral',
    'trending', 'fashion', 'lifestyle', 'shopping', 'deals', 'sale',
    'advertisement', 'promotion', 'social media', 'influencer', 'memes'
];

// Initialize the content script
async function initialize() {
    try {
        // Load settings from storage
        const result = await chrome.storage.sync.get({
            filterActive: true,
            categories: {
                academic: true,
                'online-courses': true,
                documentation: true,
                'news-educational': true,
                reference: true
            },
            customSites: []
        });

        filterActive = result.filterActive;
        categories = result.categories;
        customSites = result.customSites;

        // Apply filter if active
        if (filterActive) {
            analyzeAndFilterPage();
        }

    } catch (error) {
        console.error('Error initializing educational filter:', error);
    }
}

// Analyze current page and determine filtering approach
function analyzeAndFilterPage() {
    const currentDomain = window.location.hostname.toLowerCase();
    const currentUrl = window.location.href.toLowerCase();
    
    let isEducationalSite = false;

    // Check if this is a known educational site
    if (customSites.some(site => currentDomain.includes(site))) {
        isEducationalSite = true;
    }

    if (!isEducationalSite) {
        for (const [cat, domains] of Object.entries(educationalDomains)) {
            if (categories[cat] && domains.some(domain => 
                currentDomain.includes(domain) || currentUrl.includes(domain)
            )) {
                isEducationalSite = true;
                break;
            }
        }
    }

    // Update statistics
    updateStats(isEducationalSite);

    if (isEducationalSite) {
        // On educational sites, highlight educational content
        highlightEducationalContent();
    } else {
        // On non-educational sites, filter content or show focused mode
        const educationalContentFound = filterNonEducationalContent();
        
        if (!educationalContentFound) {
            // Only show overlay if no educational content is found
            showEducationalFocusMode();
        }
    }
}

// Filter out non-educational content and highlight educational content
function filterNonEducationalContent() {
    let educationalContentFound = false;
    
    // Get all text-containing elements
    const elements = document.querySelectorAll('p, div, article, section, h1, h2, h3, h4, h5, h6, span, a');
    
    elements.forEach(element => {
        if (element.offsetHeight === 0 || element.offsetWidth === 0) return; // Skip hidden elements
        
        const text = element.textContent.toLowerCase();
        const isEducational = analyzeElementContent(text);
        
        if (isEducational) {
            educationalContentFound = true;
            // Highlight educational content
            element.classList.add('educational-content-highlight');
        } else if (containsNonEducationalContent(text)) {
            // Dim or hide non-educational content
            element.classList.add('educational-filter-dimmed');
        }
    });

    return educationalContentFound;
}

// Analyze if element content is educational
function analyzeElementContent(text) {
    if (text.length < 20) return false; // Skip very short text
    
    let educationalScore = 0;
    let nonEducationalScore = 0;
    
    // Check for educational keywords
    educationalKeywords.forEach(keyword => {
        const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
        educationalScore += matches;
    });
    
    // Check for non-educational patterns
    nonEducationalPatterns.forEach(pattern => {
        const matches = (text.match(new RegExp(pattern, 'g')) || []).length;
        nonEducationalScore += matches;
    });
    
    // Content is educational if it has more educational keywords and fewer non-educational ones
    return educationalScore >= 2 && educationalScore > nonEducationalScore;
}

// Check if content contains non-educational patterns
function containsNonEducationalContent(text) {
    if (text.length < 20) return false;
    
    return nonEducationalPatterns.some(pattern => 
        text.includes(pattern) && !educationalKeywords.some(keyword => text.includes(keyword))
    );
}

// Highlight educational content on educational sites
function highlightEducationalContent() {
    const elements = document.querySelectorAll('article, .post, .content, main, section');
    
    elements.forEach(element => {
        const text = element.textContent.toLowerCase();
        if (analyzeElementContent(text)) {
            element.classList.add('educational-badge');
        }
    });
}

// Show educational focus mode (less aggressive than full block)
function showEducationalFocusMode() {
    // Remove any existing overlays
    const existingOverlay = document.getElementById('educational-filter-overlay');
    if (existingOverlay) return; // Don't show multiple overlays
    
    // Create a less intrusive notification
    const notification = document.createElement('div');
    notification.id = 'educational-focus-notification';
    notification.innerHTML = `
        <div class="educational-focus-content">
            <span class="educational-focus-icon">🎓</span>
            <span class="educational-focus-text">Educational Focus Mode Active</span>
            <button id="educational-focus-disable" class="educational-focus-btn">Disable</button>
        </div>
    `;

    // Add styles for the notification
    const styles = `
        <style id="educational-focus-styles">
            #educational-focus-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 15px 20px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                align-items: center;
                gap: 10px;
                max-width: 350px;
                animation: slideIn 0.3s ease-out;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .educational-focus-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .educational-focus-icon {
                font-size: 20px;
            }
            
            .educational-focus-text {
                font-size: 14px;
                font-weight: 500;
            }
            
            .educational-focus-btn {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.3);
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                transition: background-color 0.2s;
            }
            
            .educational-focus-btn:hover {
                background: rgba(255, 255, 255, 0.3);
            }
        </style>
    `;

    // Add styles to head
    document.head.insertAdjacentHTML('beforeend', styles);
    
    // Add notification to body
    document.body.appendChild(notification);

    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.remove();
        }
    }, 5000);

    // Add click handler for disable button
    document.getElementById('educational-focus-disable').addEventListener('click', () => {
        filterActive = false;
        notification.remove();
        showEducationalContent();
    });
    
    // Apply focus mode styling to the page
    document.body.classList.add('educational-focus-mode');
}

// Show educational content (remove overlays and restore content)
function showEducationalContent() {
    const notification = document.getElementById('educational-focus-notification');
    const overlay = document.getElementById('educational-filter-overlay');
    const focusStyles = document.getElementById('educational-focus-styles');
    const overlayStyles = document.getElementById('educational-filter-styles');
    
    if (notification) notification.remove();
    if (overlay) overlay.remove();
    if (focusStyles) focusStyles.remove();
    if (overlayStyles) overlayStyles.remove();
    
    // Remove all filter classes
    document.querySelectorAll('.educational-filter-dimmed, .educational-content-highlight, .educational-badge').forEach(el => {
        el.classList.remove('educational-filter-dimmed', 'educational-content-highlight', 'educational-badge');
    });
    
    document.body.classList.remove('educational-focus-mode');
}

// Update statistics
async function updateStats(isEducational) {
    try {
        const result = await chrome.storage.sync.get({ stats: { blocked: 0, allowed: 0 } });
        const stats = result.stats;

        if (isEducational) {
            stats.allowed++;
        } else {
            stats.blocked++;
        }

        await chrome.storage.sync.set({ stats });

        // Send update to popup if open
        chrome.runtime.sendMessage({
            action: 'updateStats',
            stats: stats
        });

    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'toggleFilter':
            filterActive = message.enabled;
            if (filterActive) {
                analyzeAndFilterPage();
            } else {
                showEducationalContent();
            }
            break;
            
        case 'updateCategories':
            categories = message.categories;
            if (filterActive) {
                showEducationalContent(); // Clear existing filters
                setTimeout(() => analyzeAndFilterPage(), 100); // Reapply with new categories
            }
            break;
            
        case 'updateCustomSites':
            customSites = message.customSites;
            if (filterActive) {
                showEducationalContent(); // Clear existing filters
                setTimeout(() => analyzeAndFilterPage(), 100); // Reapply with new sites
            }
            break;
    }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// Re-analyze content when page changes (for single-page applications)
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        if (filterActive) {
            showEducationalContent(); // Clear existing
            setTimeout(() => analyzeAndFilterPage(), 500); // Reanalyze new content
        }
    }
}).observe(document, { subtree: true, childList: true }); 