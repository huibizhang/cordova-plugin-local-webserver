(function() {
    var data = {};
    module.exports = {
        setItem: function(key, value) {
            console.log('setting ' + key + ' : ' + value);
            data[key] = value;
        },
        getItem: function(key) {
            console.log('getting ' + key );
            return data[key];
        },
        removeItem: function(key) {
            console.log('removing ' + key );
            delete data[key];
        }
    };
})();