(function() {
  var CollapsibleSectionPanel, ScrollView,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ScrollView = require('atom-space-pen-views').ScrollView;

  module.exports = CollapsibleSectionPanel = (function(superClass) {
    extend(CollapsibleSectionPanel, superClass);

    function CollapsibleSectionPanel() {
      return CollapsibleSectionPanel.__super__.constructor.apply(this, arguments);
    }

    CollapsibleSectionPanel.prototype.handleEvents = function() {
      return this.on('click', '.sub-section .has-items', function(e) {
        return e.currentTarget.parentNode.classList.toggle('collapsed');
      });
    };

    CollapsibleSectionPanel.prototype.resetCollapsibleSections = function(headerSections) {
      var headerSection, i, len, results;
      results = [];
      for (i = 0, len = headerSections.length; i < len; i++) {
        headerSection = headerSections[i];
        results.push(this.resetCollapsibleSection(headerSection));
      }
      return results;
    };

    CollapsibleSectionPanel.prototype.resetCollapsibleSection = function(headerSection) {
      return headerSection.removeClass('has-items');
    };

    return CollapsibleSectionPanel;

  })(ScrollView);

}).call(this);
