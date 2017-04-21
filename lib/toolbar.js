(function() {
  var CompositeDisposable;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    buttons: [
      {
        'icon': 'file',
        'label': 'Add New Post',
        'command': 'markdown-writer:new-post'
      }, {
        'icon': 'markdown',
        'label': 'Preview Markdown',
        'command': 'markdown-preview:toggle'
      }, {
        'type': 'separator'
      }, {
        'icon': 'tag',
        'label': 'Manage Tags',
        'command': 'markdown-writer:manage-post-tags'
      }, {
        'icon': 'label',
        'label': 'Manage Categories',
        'command': 'markdown-writer:manage-post-categories'
      }, {
        'type': 'separator'
      }, {
        'icon': 'link-variant',
        'label': 'Insert Link',
        'command': 'markdown-writer:insert-link'
      }, {
        'icon': 'image',
        'label': 'Insert Image',
        'command': 'markdown-writer:insert-image'
      }, {
        'type': 'separator'
      }, {
        'icon': 'format-bold',
        'label': 'Bold',
        'command': 'markdown-writer:toggle-bold-text'
      }, {
        'icon': 'format-italic',
        'label': 'Italic',
        'command': 'markdown-writer:toggle-italic-text'
      }, {
        'type': 'separator'
      }, {
        'icon': 'format-list-bulleted',
        'label': 'Unordered List',
        'command': 'markdown-writer:toggle-ul'
      }, {
        'icon': 'format-list-numbers',
        'label': 'Ordered List',
        'command': 'markdown-writer:toggle-ol'
      }, {
        'type': 'separator'
      }, {
        'icon': 'format-header-1',
        'label': 'Heading 1',
        'command': 'markdown-writer:toggle-h1'
      }, {
        'icon': 'format-header-2',
        'label': 'Heading 2',
        'command': 'markdown-writer:toggle-h2'
      }, {
        'icon': 'format-header-3',
        'label': 'Heading 3',
        'command': 'markdown-writer:toggle-h3'
      }, {
        'type': 'separator'
      }, {
        'icon': 'format-header-decrease',
        'label': 'Jump to Previous Heading',
        'command': 'markdown-writer:jump-to-previous-heading'
      }, {
        'icon': 'format-header-increase',
        'label': 'Jump to Next Heading',
        'command': 'markdown-writer:jump-to-next-heading'
      }, {
        'type': 'separator'
      }, {
        'icon': 'table',
        'label': 'Insert Table',
        'command': 'markdown-writer:insert-table'
      }, {
        'icon': 'table-edit',
        'label': 'Format Table',
        'command': 'markdown-writer:format-table'
      }
    ],
    consumeToolBar: function(toolBar) {
      this.toolBar = toolBar('tool-bar-markdown-writer');
      this.toolBar.onDidDestroy((function(_this) {
        return function() {
          return _this.toolBar = null;
        };
      })(this));
      return this.addButtons();
    },
    addButtons: function() {
      if (this.toolBar == null) {
        return;
      }
      return this.buttons.forEach((function(_this) {
        return function(button) {
          if (button['type'] === 'separator') {
            return _this.toolBar.addSpacer();
          } else {
            return _this.toolBar.addButton({
              icon: button['icon'],
              callback: button['command'],
              tooltip: button['label'],
              iconset: 'mdi'
            });
          }
        };
      })(this));
    },
    removeButtons: function() {
      var ref;
      return (ref = this.toolBar) != null ? ref.removeItems() : void 0;
    },
    updateToolbarVisible: function(visible) {
      return atom.config.set('tool-bar.visible', visible);
    },
    isToolbarVisible: function() {
      return atom.config.get('tool-bar.visible');
    },
    activate: function() {
      this.subscriptions = new CompositeDisposable();
      return this.subscriptions.add(atom.workspace.onDidStopChangingActivePaneItem((function(_this) {
        return function(item) {
          var visibility;
          visibility = atom.config.get('tool-bar-markdown-writer.visibility');
          if (_this.isMarkdown()) {
            _this.removeButtons();
            _this.addButtons();
            if (visibility === 'showToolbarOnMarkdown') {
              return _this.updateToolbarVisible(true);
            }
          } else if (_this.isToolbarVisible()) {
            if (visibility === 'showButtonsOnMarkdown') {
              return _this.removeButtons();
            } else if (visibility === 'showToolbarOnMarkdown') {
              return _this.updateToolbarVisible(false);
            }
          }
        };
      })(this)));
    },
    isMarkdown: function() {
      var editor, grammars;
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return false;
      }
      grammars = atom.config.get('tool-bar-markdown-writer.grammars');
      return grammars.indexOf(editor.getGrammar().scopeName) >= 0;
    },
    deactivate: function() {
      var ref;
      this.subscriptions.dispose();
      this.subscriptions = null;
      return (ref = this.toolBar) != null ? ref.removeItems() : void 0;
    }
  };

}).call(this);
