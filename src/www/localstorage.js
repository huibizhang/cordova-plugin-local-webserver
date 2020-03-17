(function () {

    var channel = require('cordova/channel');
    channel.createSticky('onLocalStorageReady');
    channel.waitForInitialization('onLocalStorageReady');
    var data = {};
    var filename = "wm.cordova.localwebserver.localstorage.json";

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

    function loadDataFromFile(onSucesss, onError) {
        onSucesss = onSucesss || function () { };
        onError = onError || function (e) {
            console.error('failed to load localstorage data from file. Due to %O', e);
        };
        getFile(cordova.file.dataDirectory, filename, function (fileEntry) {
            fileEntry.file(function (f) {
                var reader = new FileReader();
                reader.onloadend = function () {
                    try {
                        data = JSON.parse(this.result);
                    } catch (e) {
                        data = {};
                    }
                    onSucesss();
                };
                reader.readAsText(f);
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

    function waitForFileSystem(onSucesss, onError) {
        var i = 0,
            intervalId = setInterval(function () {
                if (cordova.file) {
                    onSucesss();
                    clearInterval(intervalId);
                } else if (i++ > 10) {
                    onError();
                    clearInterval(intervalId);
                }
            }, 1000);

    }
    waitForFileSystem(function () {
        loadDataFromFile(function () {
            channel.initializationComplete('onLocalStorageReady');
        }, function () {
            data = {};
            channel.initializationComplete('onLocalStorageReady');
        });
    }, function () {
        console.error('File system in not available.');
    });

    module.exports = {
        setItem: function (key, value) {
            console.log('setting ' + key + ' : ' + value);
            data[key] = value;
            saveDataToFile();
        },
        getItem: function (key) {
            console.log('getting ' + key);
            return data[key];
        },
        removeItem: function (key) {
            console.log('removing ' + key);
            delete data[key];
            saveDataToFile();
        }
    };
})();