(function() {
  var ListView;

  module.exports = ListView = (function() {
    function ListView(list, container, createView) {
      this.list = list;
      this.container = container;
      this.createView = createView;
      this.views = [];
      this.viewMap = {};
      this.list.onDidAddItem((function(_this) {
        return function(item) {
          return _this.addView(item);
        };
      })(this));
      this.list.onDidRemoveItem((function(_this) {
        return function(item) {
          return _this.removeView(item);
        };
      })(this));
      this.addViews();
    }

    ListView.prototype.getViews = function() {
      return this.views;
    };

    ListView.prototype.filterViews = function(filterFn) {
      var i, item, len, ref, results;
      ref = this.list.filterItems(filterFn);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        results.push(this.viewMap[this.list.keyForItem(item)]);
      }
      return results;
    };

    ListView.prototype.addViews = function() {
      var i, item, len, ref;
      ref = this.list.getItems();
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        this.addView(item);
      }
    };

    ListView.prototype.addView = function(item) {
      var view;
      view = this.createView(item);
      this.views.push(view);
      this.viewMap[this.list.keyForItem(item)] = view;
      return this.container.prepend(view);
    };

    ListView.prototype.removeView = function(item) {
      var index, key, view;
      key = this.list.keyForItem(item);
      view = this.viewMap[key];
      if (view != null) {
        index = this.views.indexOf(view);
        if (index > -1) {
          this.views.splice(index, 1);
        }
        delete this.viewMap[key];
        return view.remove();
      }
    };

    return ListView;

  })();

}).call(this);
