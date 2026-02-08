// Mock IPC Renderer
const ipcRenderer = {
    invoke: async (channel, data) => {
        console.log(`IPC Invoke: ${channel}`, data);
        if (channel === 'get-urls') {
            return [
                { id: '1', url: 'https://google.com', name: 'Google', width: 800, height: 600 },
                { id: '2', url: 'https://twitch.tv', width: 480, height: 720 }
            ];
        }
        if (channel === 'get-startup') return false;
        if (channel === 'toggle-startup') return data;
        return [];
    }
};

// Mock Require
window.require = (module) => {
    if (module === 'electron') return { ipcRenderer };
    return {};
};
