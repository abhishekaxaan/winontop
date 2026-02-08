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
        if (channel === 'add-url') {
            return [
                { id: '1', url: 'https://google.com', name: 'Google', width: 800, height: 600 },
                { id: '2', url: 'https://twitch.tv', width: 480, height: 720 },
                { ...data, id: Date.now().toString() }
            ];
        }
        return [];
    }
};

// Mock Require
window.require = (module) => {
    if (module === 'electron') return { ipcRenderer };
    return {};
};
