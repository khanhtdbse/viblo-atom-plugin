(function() {
  var TokenUpdateView, View,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  View = require('atom-space-pen-views').View;

  module.exports = TokenUpdateView = (function(superClass) {
    extend(TokenUpdateView, superClass);

    function TokenUpdateView() {
      return TokenUpdateView.__super__.constructor.apply(this, arguments);
    }

    TokenUpdateView.content = function() {
      return this.div({
        "class": 'success-message'
      }, (function(_this) {
        return function() {
          return _this.div({
            outlet: 'alert',
            "class": 'alert alert-success native-key-bindings',
            tabindex: -1
          }, function() {
            _this.span({
              outlet: 'message',
              "class": 'native-key-bindings'
            });
          });
        };
      })(this));
    };

    TokenUpdateView.prototype.initialize = function(arg) {
      var message, timeout;
      message = arg.message;
      timeout = arg.timeout;
      this.message.text(message);

      setTimeout((function(_this){
        return function() {
          _this.remove();
        }
      })(this), parseInt(timeout) > 0 ? timeout : 2000)
    };

    return TokenUpdateView;

  })(View);

}).call(this);
