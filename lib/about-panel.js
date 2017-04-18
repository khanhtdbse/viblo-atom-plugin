(function() {
  var CollapsibleSectionPanel,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,

  CollapsibleSectionPanel = require('./collapsible-section-panel');

  module.exports = AboutPanel = (function(superClass) {
    extend(AboutPanel, superClass);

    function AboutPanel() {
      return AboutPanel.__super__.constructor.apply(this, arguments);
    }

    AboutPanel.content = function() {
      return this.div({
        "class": 'panels-item about-panel'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'section'
          }, function() {
            _this.div({
              "class": 'section-container text-center'
            }, function() {
              _this.div({
                "class": 'section-heading icon'
              }, function() {
                _this.p({'class': 'icon-viblo'});
                _this.text('About Viblo');
              });
            });
            _this.p({}, function() {
              _this.text("Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.");
            })
          });
          _this.section({'class':'section'}, ' ');
        };
      })(this));
    };

    AboutPanel.prototype.initialize = function() {
    };

    return AboutPanel;

  })(CollapsibleSectionPanel);

}).call(this);
