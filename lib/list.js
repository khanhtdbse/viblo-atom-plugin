(function() {
  var Emitter, List, difference;

  Emitter = require('atom').Emitter;

  module.exports = List = (function() {
    function List(key1) {
      this.key = key1;
      this.items = [];
      this.emitter = new Emitter;
    }

    List.prototype.getItems = function() {
      return this.items;
    };

    List.prototype.filterItems = function(filterFn) {
      var i, item, len, ref, results;
      ref = this.items;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        if (filterFn(item)) {
          results.push(item);
        }
      }
      return results;
    };

    List.prototype.keyForItem = function(item) {
      return item[this.key];
    };

    List.prototype.setItems = function(items) {
      this.items = [];
      var i, item, j, len, len1, results, setToAdd, setToRemove;
      items = items.slice(0);
      setToAdd = difference(items, this.items, this.key);
      setToRemove = difference(this.items, items, this.key);
      this.items = items;
      for (i = 0, len = setToAdd.length; i < len; i++) {
        item = setToAdd[i];
        this.emitter.emit('did-add-item', item);
      }
      results = [];
      for (j = 0, len1 = setToRemove.length; j < len1; j++) {
        item = setToRemove[j];
        results.push(this.emitter.emit('did-remove-item', item));
      }
      return results;
    };

    List.prototype.onDidAddItem = function(callback) {
      return this.emitter.on('did-add-item', callback);
    };

    List.prototype.onDidRemoveItem = function(callback) {
      return this.emitter.on('did-remove-item', callback);
    };

    return List;

  })();

  difference = function(array1, array2, key) {
    var diff, i, item, j, k, len, len1, obj1, obj2, v;
    obj1 = {};
    for (i = 0, len = array1.length; i < len; i++) {
      item = array1[i];
      obj1[item[key]] = item;
    }
    obj2 = {};
    for (j = 0, len1 = array2.length; j < len1; j++) {
      item = array2[j];
      obj2[item[key]] = item;
    }
    diff = [];
    for (k in obj1) {
      v = obj1[k];
      if (obj2[k] == null) {
        diff.push(v);
      }
    }
    return diff;
  };

}).call(this);
