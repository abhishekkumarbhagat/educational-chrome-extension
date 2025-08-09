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

// Analyze current page and determine if it's educational
function analyzeAndFilterPage() {
    const currentDomain = window.location.hostname.toLowerCase();
    const currentUrl = window.location.href.toLowerCase();
    const pageTitle = document.title.toLowerCase();
    const pageContent = document.body ? document.body.innerText.toLowerCase() : '';

    let isEducational = false;
    let category = null;

    // Check custom sites first
    if (customSites.some(site => currentDomain.includes(site))) {
        isEducational = true;
        category = 'custom';
    }

    // Check against educational domains by category
    if (!isEducational) {
        for (const [cat, domains] of Object.entries(educationalDomains)) {
            if (categories[cat] && domains.some(domain => 
                currentDomain.includes(domain) || currentUrl.includes(domain)
            )) {
                isEducational = true;
                category = cat;
                break;
            }
        }
    }

    // Content-based analysis if domain check fails
    if (!isEducational) {
        const keywordCount = educationalKeywords.reduce((count, keyword) => {
            return count + (pageTitle.split(keyword).length - 1) + 
                   (pageContent.split(keyword).length - 1) / 100; // Weight content less than title
        }, 0);

        // If enough educational keywords found
        if (keywordCount >= 3) {
            isEducational = true;
            category = 'content-based';
        }
    }

    // Update statistics
    updateStats(isEducational);

    // Apply filter
    if (!isEducational && filterActive) {
        blockNonEducationalContent();
    } else if (isEducational) {
        // Ensure content is visible (in case filter was toggled)
        showEducationalContent();
    }
}

// Block non-educational content
function blockNonEducationalContent() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'educational-filter-overlay';
    overlay.innerHTML = `
        <div class="educational-filter-content">
            <div class="educational-filter-icon">🎓</div>
            <h2>Educational Content Only</h2>
            <p>This site has been filtered as it doesn't appear to contain educational content.</p>
            <p>Focus on learning with educational websites, courses, documentation, and research materials.</p>
            <div class="educational-filter-suggestions">
                <h3>Try these educational sites instead:</h3>
                <ul>
                    <li><a href="https://khanacademy.org" target="_blank">Khan Academy - Free online courses</a></li>
                    <li><a href="https://coursera.org" target="_blank">Coursera - University courses online</a></li>
                    <li><a href="https://stackoverflow.com" target="_blank">Stack Overflow - Programming help</a></li>
                    <li><a href="https://wikipedia.org" target="_blank">Wikipedia - Encyclopedia</a></li>
                </ul>
            </div>
            <button id="educational-filter-disable" class="educational-filter-btn">
                Disable Filter for This Session
            </button>
        </div>
    `;

    // Add styles
    const styles = `
        <style id="educational-filter-styles">
            #educational-filter-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .educational-filter-content {
                background: white;
                padding: 40px;
                border-radius: 20px;
                text-align: center;
                max-width: 500px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            }
            
            .educational-filter-icon {
                font-size: 60px;
                margin-bottom: 20px;
            }
            
            .educational-filter-content h2 {
                color: #333;
                margin-bottom: 15px;
                font-size: 28px;
            }
            
            .educational-filter-content p {
                color: #666;
                margin-bottom: 15px;
                line-height: 1.6;
            }
            
            .educational-filter-suggestions {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                text-align: left;
            }
            
            .educational-filter-suggestions h3 {
                color: #333;
                margin-bottom: 15px;
                font-size: 18px;
            }
            
            .educational-filter-suggestions ul {
                list-style: none;
                padding: 0;
            }
            
            .educational-filter-suggestions li {
                margin-bottom: 10px;
            }
            
            .educational-filter-suggestions a {
                color: #667eea;
                text-decoration: none;
                font-weight: 500;
            }
            
            .educational-filter-suggestions a:hover {
                text-decoration: underline;
            }
            
            .educational-filter-btn {
                background: #667eea;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                font-weight: 500;
                transition: background-color 0.2s;
            }
            
            .educational-filter-btn:hover {
                background: #5a67d8;
            }
        </style>
    `;

    // Add styles to head
    document.head.insertAdjacentHTML('beforeend', styles);
    
    // Add overlay to body
    document.body.appendChild(overlay);

    // Add click handler for disable button
    document.getElementById('educational-filter-disable').addEventListener('click', () => {
        filterActive = false;
        showEducationalContent();
    });
}

// Show educational content (remove overlay)
function showEducationalContent() {
    const overlay = document.getElementById('educational-filter-overlay');
    const styles = document.getElementById('educational-filter-styles');
    
    if (overlay) overlay.remove();
    if (styles) styles.remove();
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
                analyzeAndFilterPage();
            }
            break;
            
        case 'updateCustomSites':
            customSites = message.customSites;
            if (filterActive) {
                analyzeAndFilterPage();
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