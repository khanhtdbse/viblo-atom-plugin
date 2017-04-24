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
            'command': 'markdown-writer:toggle-bold-text'
          }, {
            'icon': 'italic',
            'label': 'Italic',
            'command': 'markdown-writer:toggle-italic-text'
          }, {
            'icon': 'strikethrough',
            'label': 'Strikethrough',
            'command': 'markdown-writer:toggle-strikethrough-text'
          }, {
            'icon': 'header',
            'label': 'Heading',
            'command': 'markdown-writer:toggle-h1'
          }, {
            'type': 'separator'
          }, {
            'icon': 'code',
            'label': 'Code',
            'command': 'markdown-writer:toggle-codeblock-text'
          }, {
            'icon': 'quote-left',
            'label': 'Quote',
            'command': 'markdown-writer:toggle-blockquote'
          }, {
            'icon': 'list-unordered',
            'label': 'Generic List',
            'command': 'markdown-writer:toggle-ul'
          }, {
            'icon': 'list-ordered',
            'label': 'Numbered List',
            'command': 'markdown-writer:toggle-ol'
          }, {
            'icon': 'eraser',
            'label': 'Clean block',
            'command': 'markdown-toolbar:esase'
          }, {
            'type': 'separator'
          }, {
            'icon': 'link',
            'label': 'Insert Link',
            'command': 'markdown-writer:insert-link'
          }
          // , {
          //   'icon': 'chain-broken',
          //   'label': 'Unlink',
          //   'command': 'markdown-toolbar:unlink'
          // }
          , {
            'icon': 'file-image-o',
            'label': 'Insert Image',
            'command': 'viblo-view:image-helper'
          }, {
            'icon': 'table',
            'label': 'Insert Table',
            'command': 'markdown-toolbar:table'
          }
          // , {
          //   'icon': 'horizontal-rule',
          //   'label': 'Insert horizontal line',
          //   'command': 'markdown-toolbar:hr'
          // }
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
