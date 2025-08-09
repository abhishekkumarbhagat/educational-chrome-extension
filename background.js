// Background Service Worker for Educational Content Filter
// Handles extension lifecycle, settings management, and communication

chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
        // Set default settings on first install
        await chrome.storage.sync.set({
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

        // Open welcome page
        chrome.tabs.create({
            url: chrome.runtime.getURL('welcome.html')
        });
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
    // This will open the popup, no additional action needed
});

// Listen for tab updates to refresh content scripts
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        try {
            // Get current settings
            const result = await chrome.storage.sync.get({
                filterActive: true,
                categories: {},
                customSites: []
            });

            // Send settings to content script
            chrome.tabs.sendMessage(tabId, {
                action: 'updateSettings',
                settings: result
            }).catch(() => {
                // Ignore errors (content script might not be ready)
            });
        } catch (error) {
            console.error('Error updating tab:', error);
        }
    }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'updateStats':
            // Broadcast stats update to popup if open
            chrome.runtime.sendMessage(message).catch(() => {
                // Ignore if popup is not open
            });
            break;

        case 'getSettings':
            // Send current settings to requesting script
            chrome.storage.sync.get().then(settings => {
                sendResponse(settings);
            });
            return true; // Keep message channel open for async response

        case 'reportBlocked':
            // Handle blocked site reporting
            updateBlockedStats();
            break;

        case 'reportAllowed':
            // Handle allowed site reporting
            updateAllowedStats();
            break;
    }
});

// Update blocked site statistics
async function updateBlockedStats() {
    try {
        const result = await chrome.storage.sync.get({ stats: { blocked: 0, allowed: 0 } });
        const stats = result.stats;
        stats.blocked++;
        await chrome.storage.sync.set({ stats });
        
        // Broadcast update
        chrome.runtime.sendMessage({
            action: 'updateStats',
            stats: stats
        }).catch(() => {});
    } catch (error) {
        console.error('Error updating blocked stats:', error);
    }
}

// Update allowed site statistics
async function updateAllowedStats() {
    try {
        const result = await chrome.storage.sync.get({ stats: { blocked: 0, allowed: 0 } });
        const stats = result.stats;
        stats.allowed++;
        await chrome.storage.sync.set({ stats });
        
        // Broadcast update
        chrome.runtime.sendMessage({
            action: 'updateStats',
            stats: stats
        }).catch(() => {});
    } catch (error) {
        console.error('Error updating allowed stats:', error);
    }
}

// Handle storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        // Broadcast settings changes to all tabs
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'settingsChanged',
                    changes: changes
                }).catch(() => {
                    // Ignore errors for tabs without content script
                });
            });
        });
    }
});

// Cleanup on extension shutdown
chrome.runtime.onSuspend.addListener(() => {
    console.log('Educational Content Filter: Extension suspended');
}); 