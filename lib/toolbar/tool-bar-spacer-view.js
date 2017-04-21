(function() {
  module.exports = ToolBarSpacerView = (function() {
    function ToolBarSpacerView(options, group) {
      this.element = document.createElement('hr');
      this.priority = options && options.priority;
      this.group = group;
      const classNames = ['tool-bar-spacer'];
      if (this.priority < 0) {
        classNames.push('tool-bar-item-align-end');
      }
      this.element.classList.add(...classNames);
    }

    ToolBarSpacerView.prototype.destroy = function() {
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      this.element = null;
    }

    return ToolBarSpacerView;
  })();
}).call(this);
