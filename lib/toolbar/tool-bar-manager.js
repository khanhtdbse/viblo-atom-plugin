var ToolBarButtonView  = require('./tool-bar-button-view');
var ToolBarSpacerView = require('./tool-bar-spacer-view');
(function() {
  module.exports = ToolBarManager = (function() {
      function ToolBarManager(group, toolBarView) {
        this.group = group;
        this.toolBarView = toolBarView;
        this.buttons = [
          // {
          //   'icon': 'floppy-o',
          //   'label': 'Save post',
          //   'command': 'markdown-preview:save'
          // },
          {
          'icon': 'markdown',
            'label': 'Preview Markdown',
            'command': 'viblo-view:toggle-preview'
          }, {
            'icon': 'undo',
            'label': 'Undo',
            'command': 'core:undo'
          }, {
            'icon': 'repeat',
            'label': 'Redo',
            'command': 'core:redo'
          }, {
            'type': 'separator'
          }, {
            'icon': 'bold',
            'label': 'Bold',
            'command': 'markdown-toolbar:bold'
          }, {
            'icon': 'italic',
            'label': 'Italic',
            'command': 'markdown-toolbar:italic'
          }, {
            'icon': 'strikethrough',
            'label': 'Strikethrough',
            'command': 'markdown-toolbar:strikethrough'
          }, {
            'icon': 'header',
            'label': 'Heading',
            'command': 'markdown-toolbar:h1'
          }, {
            'type': 'separator'
          }, {
            'icon': 'code',
            'label': 'Code',
            'command': 'markdown-toolbar:code'
          }, {
            'icon': 'quote-left',
            'label': 'Quote',
            'command': 'markdown-toolbar:quote'
          }, {
            'icon': 'list-unordered',
            'label': 'Generic List',
            'command': 'markdown-toolbar:list-unordered'
          }, {
            'icon': 'list-ordered',
            'label': 'Numbered List',
            'command': 'markdown-toolbar:list-ordered'
          }, {
            'icon': 'eraser',
            'label': 'Clean block',
            'command': 'markdown-toolbar:esase'
          }, {
            'type': 'separator'
          }, {
            'icon': 'link',
            'label': 'Insert Link',
            'command': 'markdown-toolbar:link'
          }, {
            'icon': 'chain-broken',
            'label': 'Unlink',
            'command': 'markdown-toolbar:unlink'
          }, {
            'icon': 'file-image-o',
            'label': 'Insert Image',
            'command': 'viblo-view:image-helper'
          }, {
            'icon': 'table',
            'label': 'Insert Table',
            'command': 'markdown-toolbar:table'
          }, {
            'icon': 'horizontal-rule',
            'label': 'Insert horizontal line',
            'command': 'markdown-toolbar:hr'
          }
        ];
      }

      ToolBarManager.prototype.addButton = function(options) {
        const button = new ToolBarButtonView(options, this.group);
        this.toolBarView.addItem(button);
        return button;
      }

      ToolBarManager.prototype.addSpacer = function(options) {
        const spacer = new ToolBarSpacerView(options, this.group);
        this.toolBarView.addItem(spacer);
        return spacer;
      }

      ToolBarManager.prototype.removeItems = function() {
        if (this.toolBarView.items) {
          this.toolBarView.items
            .filter(function(item) {
              return item.group === this.group
            })
            .forEach(function(item) {
              return this.toolBarView.removeItem(item);
            });
        }
      }

      ToolBarManager.prototype.addButtons = function() {
        return this.buttons.forEach((function(_this) {
          return function(button) {
            if (button['type'] === 'separator') {
              return _this.addSpacer();
            } else {
              return _this.addButton({
                icon: button['icon'],
                callback: button['command'],
                tooltip: button['label'],
                iconset: 'icon'
              });
            }
          };
        })(this));
      }

      ToolBarManager.prototype.onDidDestroy = function(callback) {
        this.toolBarView.emitter.on('did-destroy', callback);
      }

      return ToolBarManager;
  })();
}).call(this);
