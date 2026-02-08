const { ipcRenderer } = require('electron');

// Get params
const params = new URLSearchParams(window.location.search);
const url = params.get('url');
const id = params.get('id');

const container = document.getElementById('webview-container');
const toggleBtn = document.getElementById('toggle-clickthrough');
const closeBtn = document.getElementById('close-btn');

// Create Webview
const webview = document.createElement('webview');
webview.src = url;
webview.setAttribute('allowpopups', 'true');
// webview.setAttribute('disablewebsecurity', 'true'); // Optional, use with caution
container.appendChild(webview);

let clickThrough = false;

// Handle Click-Through
// Protocol:
// If ClickThrough is ON:
//   - We need to IGNORE mouse events on the webview part.
//   - But NOT on the handle part.
//   - Electron's `setIgnoreMouseEvents` affects the whole window.
//   - But we can use the `forward: true` trick with mousemove?
//   - Actually, a simpler way for "Click-through" where you don't interact with the site:
//     - Set ignoreMouseEvents(true, { forward: true }) 
//     - AND have an element on top that captures mouse?
//     - No, if we ignore, we ignore.
//     - The trick is:
//       element.addEventListener('mouseenter', () => setIgnore(false))
//       element.addEventListener('mouseleave', () => setIgnore(true))
//     - BUT this requires `forward: true` so that the `mouseenter` event actually fires on the element even if window is transparent/ignoring?
//     - Actually, if `ignoreMouseEvents(true)` is set, the browser process passes the event to OS.
//     - EXCEPT if `forward: true` is set, Electron checks if the mouse is over a visual part of the window?
//     - Common Electron pattern:
//       window.addEventListener('mousemove', event => {
//          let flag = event.target === document.documentElement; // if over transparent background
//          // Check if hovering over handle
//          if (event.target.closest('#drag-handle')) {
//             ipcRenderer.send('overlay-ignore-mouse', false);
//          } else {
//             if (clickThrough) {
//                ipcRenderer.send('overlay-ignore-mouse', true, { forward: true });
//             } else {
//                ipcRenderer.send('overlay-ignore-mouse', false);
//             }
//          }
//       });

// Let's implement the cleaner approach:
// We only enable the "complex" mouse ignore logic when ClickThrough is active.
// When ClickThrough is INACTIVE (default):
//   - Window accepts all mouse events. `ignoreMouseEvents(false)` (Default).
// When ClickThrough is ACTIVE:
//   - We want to click THROUGH the webview.
//   - But CLICK the handle.

toggleBtn.addEventListener('click', () => {
    clickThrough = !clickThrough;
    updateClickThroughState();
});

function updateClickThroughState() {
    if (clickThrough) {
        toggleBtn.textContent = "CT: ON";
        toggleBtn.classList.add('active');
        // Enable forwarding pattern: Ignore mouse by default, but forward events to catch mouseenter on handle
        ipcRenderer.send('overlay-ignore-mouse', true, { forward: true });
    } else {
        toggleBtn.textContent = "CT: OFF";
        toggleBtn.classList.remove('active');
        ipcRenderer.send('overlay-ignore-mouse', false);
    }
}

closeBtn.addEventListener('click', () => {
    window.close();
});

// Click-Through Logic
// We need to handle mouse events properly to:
// 1. Allow clicking the header controls even in click-through mode
// 2. Pass through clicks to content below when in click-through mode
// 3. Maintain auto-hide behavior via CSS

const dragHandle = document.getElementById('drag-handle');
const resizeGrip = document.getElementById('resize-grip');

// Track mouse position to handle click-through intelligently
window.addEventListener('mousemove', (e) => {
    if (!clickThrough) return; // Only manage in click-through mode

    // Check if mouse is over interactive elements
    const isOverHandle = e.target.closest('#drag-handle');
    const isOverGrip = e.target.closest('#resize-grip');

    if (isOverHandle || isOverGrip) {
        // Allow interaction with controls
        ipcRenderer.send('overlay-ignore-mouse', false);
    } else {
        // Pass through to content below
        ipcRenderer.send('overlay-ignore-mouse', true, { forward: true });
    }
});

// Invert Logic
const invertBtn = document.getElementById('toggle-invert');
let inverted = false;

invertBtn.addEventListener('click', () => {
    inverted = !inverted;
    const webview = document.querySelector('webview');
    // We apply filter to the container or webview.
    // Applying to container is safer.
    if (inverted) {
        container.classList.add('invert-colors');
        invertBtn.classList.add('active');
    } else {
        container.classList.remove('invert-colors');
        invertBtn.classList.remove('active');
    }
});

// IPC Mouse Tracking for robust Auto-Hide
ipcRenderer.on('overlay-hover-update', (event, isHovering) => {
    console.log('Hover update:', isHovering);
    if (isHovering) {
        document.body.classList.remove('hover-inactive');
    } else {
        document.body.classList.add('hover-inactive');
    }
});

// Initial auto-hide: Show header for 1 second, then hide
setTimeout(() => {
    // Check if mouse is still over the window
    // If not, add hover-inactive class to hide header
    if (!document.body.classList.contains('hover-inactive')) {
        // Only hide if mouse is not currently hovering
        const bounds = {
            x: window.screenX,
            y: window.screenY,
            width: window.outerWidth,
            height: window.outerHeight
        };
        // This will be handled by the polling, just set inactive for now
        document.body.classList.add('hover-inactive');
    }
}, 1000);
