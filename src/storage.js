const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class Storage {
    constructor(opts) {
        // storage file path
        const userDataPath = (app || require('electron').remote.app).getPath('userData');
        this.path = path.join(userDataPath, opts.configName + '.json');
        
        this.data = parseDataFile(this.path, opts.defaults);
    }
    
    // get value
    get(key) {
        return this.data[key];
    }
    
    // set value
    set(key, val) {
        this.data[key] = val;
        // Wait, I should probably save the whole object or specific keys. 
        // The prompt says "Load saved URLs", "Display them immediately". 
        // The data structure is probably just an array of URLs or an object with an array.
        // Let's make it generic.
        try {
            fs.writeFileSync(this.path, JSON.stringify(this.data));
        } catch (error) {
            console.error("Error writing to config file", error);
        }
    }

    // specific method for URLs
    getUrls() {
        return this.data.urls || [];
    }

    addUrl(urlItem) {
        if (!this.data.urls) this.data.urls = [];
        this.data.urls.push(urlItem);
        this.save();
    }

    removeUrl(id) {
        if (!this.data.urls) return;
        this.data.urls = this.data.urls.filter(item => item.id !== id);
        this.save();
    }

    updateUrl(updatedItem) {
        if (!this.data.urls) return;
        const index = this.data.urls.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
            this.data.urls[index] = updatedItem;
            this.save();
        }
    }

    save() {
        try {
            fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error("Error saving config:", error);
        }
    }
}

function parseDataFile(filePath, defaults) {
    try {
        return JSON.parse(fs.readFileSync(filePath));
    } catch(error) {
        return defaults;
    }
}

module.exports = Storage;
