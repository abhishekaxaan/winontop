const { ipcRenderer } = require('electron');

const urlInput = document.getElementById('urlInput');
const nameInput = document.getElementById('nameInput'); // New Input
const resolutionSelect = document.getElementById('resolutionSelect');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const addBtn = document.getElementById('addBtn');
const urlList = document.getElementById('urlList');

// View Toggle Logic
const viewGridBtn = document.getElementById('view-grid');
const viewListBtn = document.getElementById('view-list');

viewGridBtn.addEventListener('click', () => {
    urlList.classList.remove('list-view');
    viewGridBtn.classList.add('active');
    viewListBtn.classList.remove('active');
});

viewListBtn.addEventListener('click', () => {
    urlList.classList.add('list-view');
    viewListBtn.classList.add('active');
    viewGridBtn.classList.remove('active');
});

// Settings Button Logic (Modal)
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings');
const btnQuit = document.getElementById('btn-quit');
const btnAbout = document.getElementById('btn-about');

const chkStartup = document.getElementById('chk-startup');
const chkTheme = document.getElementById('chk-theme');

// Open Modal
settingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
});

// Close Modal
closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
});

settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
    }
});

// Startup Logic
chkStartup.addEventListener('change', async () => {
    const newState = chkStartup.checked;
    await ipcRenderer.invoke('toggle-startup', newState);
});

async function loadSettings() {
    const isStartup = await ipcRenderer.invoke('get-startup');
    chkStartup.checked = isStartup;

    // Load Theme Logic (Default Light)
    const savedTheme = localStorage.getItem('theme');

    // If 'dark', add class. If 'light' or null, do nothing (default).
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        chkTheme.checked = true;
    } else {
        document.body.classList.remove('dark-theme');
        chkTheme.checked = false;
    }
}

// Theme Logic
chkTheme.addEventListener('change', () => {
    const isDark = chkTheme.checked;

    if (isDark) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    }
});

// Menu Actions
btnQuit.addEventListener('click', async () => {
    try {
        await ipcRenderer.invoke('app-quit');
    } catch (err) {
        window.close();
    }
});

btnAbout.addEventListener('click', () => {
    alert('WinOnTop v1.0.0\nFOSS Overlay Utility');
});

// Resolution Presets
resolutionSelect.addEventListener('change', () => {
    const val = resolutionSelect.value;
    if (val === 'custom') return;
    const [w, h] = val.split('x');
    widthInput.value = w;
    heightInput.value = h;
});

// Load URLs on start
async function loadUrls() {
    const urls = await ipcRenderer.invoke('get-urls');
    // Reverse to show newest first
    renderList(urls.reverse());
}

// Helper to middle-truncate URL
function truncateUrl(url, maxLength = 40) {
    if (!url || url.length <= maxLength) return url;

    // Remove protocol for cleaner look
    let cleanUrl = url.replace(/^https?:\/\//, '');
    if (cleanUrl.length <= maxLength) return cleanUrl;

    const startLen = Math.ceil(maxLength * 0.6);
    const endLen = Math.floor(maxLength * 0.3);

    return cleanUrl.substring(0, startLen) + '...' + cleanUrl.substring(cleanUrl.length - endLen);
}

function renderList(urls) {
    urlList.innerHTML = '';

    if (urls.length === 0) {
        urlList.innerHTML = `
            <div class="empty-state">
                <p>No URLs added yet</p>
                <p style="font-size: 12px; margin-top: 8px;">Add a URL above to get started</p>
            </div>
        `;
        return;
    }

    const isListView = urlList.classList.contains('list-view');

    urls.forEach(item => {
        const li = document.createElement('li');
        li.className = 'url-item';

        // Display Logic
        const displayName = item.name || 'Untitled';
        // If name is present, show URL as secondary. If no name, URL is primary (and truncated).
        const primaryText = item.name ? item.name : truncateUrl(item.url, 50);
        const secondaryText = item.name ? truncateUrl(item.url, 60) : '';

        li.innerHTML = `
            <div class="url-info">
                <span class="url-text" title="${item.url}">${primaryText}</span>
                <span class="url-res" title="${item.url}">
                    ${secondaryText ? `<span style="margin-right: 8px; opacity: 0.8;">${secondaryText}</span>` : ''}
                    <span style="opacity: 0.6;">${item.width} x ${item.height}</span>
                </span>
            </div>
            <div class="url-actions">
                <button class="btn-open" onclick="openOverlay('${item.id}')">Open Overlay</button>
                <button class="btn-delete" onclick="deleteUrl('${item.id}')" title="Delete">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;
        urlList.appendChild(li);
    });
}

addBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) return alert('Please enter a URL');

    const name = nameInput.value.trim();
    const selectedRes = resolutionSelect.value;

    const resolutionPresets = {
        '480p': { width: 854, height: 480 },
        '720p': { width: 1280, height: 720 },
        '1080p': { width: 1920, height: 1080 },
        '1440p': { width: 2560, height: 1440 },
        'square': { width: 1080, height: 1080 },
        'portrait': { width: 1080, height: 1920 }
    };

    let width, height;

    if (selectedRes === 'custom') {
        const customWidth = prompt('Enter width:', '1920');
        if (!customWidth || isNaN(customWidth)) return;
        const customHeight = prompt('Enter height:', '1080');
        if (!customHeight || isNaN(customHeight)) return;
        width = parseInt(customWidth);
        height = parseInt(customHeight);
    } else {
        const preset = resolutionPresets[selectedRes];
        width = preset.width;
        height = preset.height;
    }

    // Basic validation
    if (!url.startsWith('http')) return alert('URL must start with http/https');

    const newItem = {
        id: Date.now().toString(),
        url,
        name,
        width,
        height
    };

    const updatedUrls = await ipcRenderer.invoke('add-url', newItem);
    renderList(updatedUrls);
    urlInput.value = '';
    nameInput.value = '';
    resolutionSelect.value = '1080p';
});

window.openOverlay = (id) => {
    ipcRenderer.invoke('open-overlay', id);
};

window.deleteUrl = async (id) => {
    if (confirm('Are you sure?')) {
        const updatedUrls = await ipcRenderer.invoke('delete-url', id);
        renderList(updatedUrls);
    }
};

window.editUrl = async (id) => {
    const urls = await ipcRenderer.invoke('get-urls');
    const item = urls.find(u => u.id === id);
    if (!item) return;

    // Resolution presets
    const presets = [
        { name: '480p (854x480)', width: 854, height: 480 },
        { name: '720p (1280x720)', width: 1280, height: 720 },
        { name: '1080p (1920x1080)', width: 1920, height: 1080 },
        { name: '1440p (2560x1440)', width: 2560, height: 1440 },
        { name: '4K (3840x2160)', width: 3840, height: 2160 },
        { name: 'Square (1080x1080)', width: 1080, height: 1080 },
        { name: 'Portrait (1080x1920)', width: 1080, height: 1920 },
        { name: 'Custom...', width: null, height: null }
    ];

    // Build options string for prompt
    let optionsText = `Current: ${item.width}x${item.height}\n\nSelect a preset:\n\n`;
    presets.forEach((preset, index) => {
        optionsText += `${index + 1}. ${preset.name}\n`;
    });

    const choice = prompt(optionsText + '\nEnter number (1-8):');
    if (!choice) return;

    const selectedIndex = parseInt(choice) - 1;
    if (selectedIndex < 0 || selectedIndex >= presets.length) {
        alert('Invalid selection');
        return;
    }

    const selected = presets[selectedIndex];
    let newWidth, newHeight;

    if (selected.width === null) {
        // Custom option
        newWidth = prompt(`Enter custom width (current: ${item.width}):`, item.width);
        if (!newWidth || isNaN(newWidth)) return;

        newHeight = prompt(`Enter custom height (current: ${item.height}):`, item.height);
        if (!newHeight || isNaN(newHeight)) return;

        newWidth = parseInt(newWidth);
        newHeight = parseInt(newHeight);
    } else {
        newWidth = selected.width;
        newHeight = selected.height;
    }

    await ipcRenderer.invoke('update-url-size', id, newWidth, newHeight);
    await loadUrls();
};

loadUrls();
loadSettings();
