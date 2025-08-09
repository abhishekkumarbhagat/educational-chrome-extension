// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await loadSettings();
    await updateStats();
    setupEventListeners();
});

// Load settings from storage
async function loadSettings() {
    try {
        const result = await chrome.storage.sync.get({
            filterActive: true,
            categories: {
                academic: true,
                'online-courses': true,
                documentation: true,
                'news-educational': true,
                reference: true
            },
            customSites: [],
            stats: { blocked: 0, allowed: 0 }
        });

        // Set toggle state
        document.getElementById('filterToggle').checked = result.filterActive;

        // Set category checkboxes
        Object.keys(result.categories).forEach(category => {
            const checkbox = document.getElementById(category);
            if (checkbox) {
                checkbox.checked = result.categories[category];
            }
        });

        // Load custom sites
        loadCustomSites(result.customSites);

        // Update stats
        document.getElementById('blockedCount').textContent = result.stats.blocked;
        document.getElementById('allowedCount').textContent = result.stats.allowed;

    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Filter toggle
    document.getElementById('filterToggle').addEventListener('change', async (e) => {
        await chrome.storage.sync.set({ filterActive: e.target.checked });
        
        // Send message to content script to update filter state
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            chrome.tabs.sendMessage(tab.id, { 
                action: 'toggleFilter', 
                enabled: e.target.checked 
            });
        } catch (error) {
            console.error('Error sending toggle message:', error);
        }
    });

    // Category checkboxes
    ['academic', 'online-courses', 'documentation', 'news-educational', 'reference'].forEach(category => {
        const checkbox = document.getElementById(category);
        if (checkbox) {
            checkbox.addEventListener('change', async () => {
                const categories = await getCategoriesState();
                await chrome.storage.sync.set({ categories });
                
                // Update content script
                try {
                    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                    chrome.tabs.sendMessage(tab.id, { 
                        action: 'updateCategories', 
                        categories 
                    });
                } catch (error) {
                    console.error('Error updating categories:', error);
                }
            });
        }
    });

    // Add custom site
    document.getElementById('addSite').addEventListener('click', addCustomSite);
    document.getElementById('customSite').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addCustomSite();
        }
    });

    // Reset stats
    document.getElementById('resetStats').addEventListener('click', async () => {
        await chrome.storage.sync.set({ stats: { blocked: 0, allowed: 0 } });
        document.getElementById('blockedCount').textContent = '0';
        document.getElementById('allowedCount').textContent = '0';
    });
}

// Get current categories state
async function getCategoriesState() {
    const categories = {};
    ['academic', 'online-courses', 'documentation', 'news-educational', 'reference'].forEach(category => {
        const checkbox = document.getElementById(category);
        if (checkbox) {
            categories[category] = checkbox.checked;
        }
    });
    return categories;
}

// Add custom educational site
async function addCustomSite() {
    const input = document.getElementById('customSite');
    const domain = input.value.trim().toLowerCase();
    
    if (!domain) return;
    
    // Basic domain validation
    if (!isValidDomain(domain)) {
        alert('Please enter a valid domain (e.g., example.edu or subdomain.example.com)');
        return;
    }

    try {
        const result = await chrome.storage.sync.get({ customSites: [] });
        const customSites = result.customSites;
        
        if (!customSites.includes(domain)) {
            customSites.push(domain);
            await chrome.storage.sync.set({ customSites });
            loadCustomSites(customSites);
            input.value = '';
        } else {
            alert('This domain is already in your list');
        }
    } catch (error) {
        console.error('Error adding custom site:', error);
    }
}

// Load and display custom sites
function loadCustomSites(sites) {
    const container = document.getElementById('customSitesList');
    container.innerHTML = '';
    
    sites.forEach(site => {
        const siteItem = document.createElement('div');
        siteItem.className = 'custom-site-item';
        siteItem.innerHTML = `
            <span>${site}</span>
            <button class="remove-site" data-site="${site}">Remove</button>
        `;
        container.appendChild(siteItem);
    });

    // Add remove functionality
    container.addEventListener('click', async (e) => {
        if (e.target.classList.contains('remove-site')) {
            const siteToRemove = e.target.dataset.site;
            await removeCustomSite(siteToRemove);
        }
    });
}

// Remove custom site
async function removeCustomSite(domain) {
    try {
        const result = await chrome.storage.sync.get({ customSites: [] });
        const customSites = result.customSites.filter(site => site !== domain);
        await chrome.storage.sync.set({ customSites });
        loadCustomSites(customSites);
    } catch (error) {
        console.error('Error removing custom site:', error);
    }
}

// Update statistics from background script
async function updateStats() {
    try {
        const result = await chrome.storage.sync.get({ stats: { blocked: 0, allowed: 0 } });
        document.getElementById('blockedCount').textContent = result.stats.blocked;
        document.getElementById('allowedCount').textContent = result.stats.allowed;
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Simple domain validation
function isValidDomain(domain) {
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
    return domainRegex.test(domain) && domain.length <= 253;
}

// Listen for updates from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateStats') {
        document.getElementById('blockedCount').textContent = message.stats.blocked;
        document.getElementById('allowedCount').textContent = message.stats.allowed;
    }
}); 