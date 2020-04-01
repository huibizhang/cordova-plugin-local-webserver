var data = {};
var filename = "wm.cordova.localwebserver.localstorage.json";

function loadDataFromFile(onSucesss) {
    var xhr = new XMLHttpRequest();
    var filePath = cordova.file.dataDirectory + filename;
    filePath = filePath.replace('file://', 'http://' + location.host + '/local-filesystem');
    xhr.open('get', filePath);
    xhr.onload = function () {
        try {
            data = JSON.parse(xhr.responseText);
        } catch (e) {
            data = {};
        }
        onSucesss();;
    };
    xhr.onerror = function () {
        data = {};
        onSucesss();
    };
    xhr.send();
}

function getFile(path, fileName, onSucesss, onError) {
    window.resolveLocalFileSystemURL(path, function (dirEntry) {
        var options = {
            create: true,
            exclusive: false
        };
        dirEntry.getFile(fileName, options, function (fileEntry) {
            onSucesss && onSucesss(fileEntry);
        }, onError);
    }, onError);
}

function saveDataToFile(onSucesss, onError) {
    onSucesss = onSucesss || function () { };
    onError = onError || function (e) {
        console.error('failed to save localstorage data to file. Due to %O', e);
    };
    getFile(cordova.file.dataDirectory, filename, function (fileEntry) {
        fileEntry.createWriter(function (fileWriter) {
            fileWriter.onwriteend = function () {
                onSucesss();
            };
            fileWriter.onerror = onError;
            fileWriter.write(JSON.stringify(data));
        });
    }, onError);
}

document.addEventListener("deviceready", function () {
    loadDataFromFile(function () {
        document.dispatchEvent(new CustomEvent('localStorageReady'));
        window.__isLocalStorageReady = true;
    }, function () {
        data = {};
        document.dispatchEvent(new CustomEvent('localStorageReady'));
        window.__isLocalStorageReady = true;
    });
}, false);

module.exports = {
    setItem: function (key, value) {
        data[key] = value;
        saveDataToFile();
    },
    getItem: function (key) {
        return data[key];
    },
    removeItem: function (key) {
        delete data[key];
        saveDataToFile();
    },
    toString: function () {
        console.log('localstorage %O', data);
        return JSON.stringify(data);
    }
};
