(function() {
  var ErrorView, View,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  View = require('atom-space-pen-views').View;

  module.exports = ErrorView = (function(superClass) {
    extend(ErrorView, superClass);

    function ErrorView() {
      return ErrorView.__super__.constructor.apply(this, arguments);
    }

    ErrorView.content = function() {
      return this.div({
        "class": 'error-message'
      }, (function(_this) {
        return function() {
          return _this.div({
            outlet: 'alert',
            "class": 'alert alert-danger alert-dismissable native-key-bindings',
            tabindex: -1
          }, function() {
            _this.button({
              outlet: 'close',
              "class": 'close icon icon-x'
            });
            _this.span({
              outlet: 'message',
              "class": 'native-key-bindings'
            });
          });
        };
      })(this));
    };

    ErrorView.prototype.initialize = function(arg) {
      var message;
      message = arg.message;
      this.message.text(message);
      this.close.on('click', (function(_this) {
        return function() {
          return _this.remove();
        };
      })(this));
    };

    return ErrorView;

  })(View);

}).call(this);
