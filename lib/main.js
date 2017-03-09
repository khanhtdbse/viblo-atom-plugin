(function(){

  var locationUri = 'atom://viblo',
    uriRegex = /viblo\/([a-z]+)\/?([a-zA-Z0-9_-]+)?/i,
    settingsViewInstance,
    VibloPluginSettingsView,
    fs,
    PostManager,
    postManagerInstance,
    CompositeDisposable;

  fs = require('fs-plus');
  $ = require('jquery');
  CompositeDisposable = require('atom').CompositeDisposable;

  PostManager = require('./post-manager');

  postManagerInstance = null;


  openPanel = function(settingsViewInstance, panelName, uri) {
    var detail, match, options, panel;
    match = uriRegex.exec(uri);
    panel = match != null ? match[1] : void 0;
    detail = match != null ? match[2] : void 0;
    options = {
      uri: uri
    };
    if (panel === "settings" && (detail != null)) {
      panelName = detail;
      options.pack = {
        name: detail
      };
      if (atom.packages.getLoadedPackage(detail)) {
        options.back = 'settings';
      }
    }
    return settingsViewInstance.showPanel(panelName, options);
  };

  module.exports = {
    provider: null,
    provide: function() {
      return [
        require('./category-provider')
      ]
    },

    activate: function() {
      atom.workspace.addOpener((function(_this) {
        return function(uri) {
          var match, panelName;
          if (uri.startsWith(locationUri)) {
            if (settingsViewInstance == null) {
              settingsViewInstance = _this.createSettingsView({
                uri: uri
              });
            }
            if (match = uriRegex.exec(uri)) {
              panelName = match[1];
              panelName = panelName[0].toUpperCase() + panelName.slice(1);
              openPanel(settingsViewInstance, panelName, uri);
            }
            return settingsViewInstance;
          }
        };
      })(this));

      var publishFromFileTreeCb = (function(_this) {
          return function(arg) {
            var editor, filePath, i, len, ref, target, contents;
            target = arg.target;
            filePath = target.dataset.path;
            if (!filePath) {
              return;
            }
            ref = atom.workspace.getTextEditors();
            for (i = 0, len = ref.length; i < len; i++) {
              editor = ref[i];
              console.log(editor);
              if (!(editor.getPath() === filePath)) {
                continue;
              }
              contents = editor.getText();
              _this.showPublishForm(contents);
              return;
            }
          };
      })(this);

      var publishFromEditor = (function(_this) {
          return function(arg) {
            var contents, editor;
            editor = atom.workspace.getActiveTextEditor();
            if (editor == null) {
              return;
            }
            contents = editor.getText();
            if (!contents) {
              return;
            }
            _this.showPublishForm(contents);
          };
      })(this);

      var publishFromMarkdownPreview = (function(_this) {
          return function(arg) {
            var contents, editor, file, activePane;
            activePane = atom.workspace.getActivePaneItem();
            file = activePane.file;
            if(file == null) {
              return;
            }
            contents = file.cachedContents;
            if (!contents) {
              return;
            }
            _this.showPublishForm(contents);
          };
      })(this);

      var publishFromWorkspace = (function(_this) {
          return function(event) {
            if (event.originalEvent == null) {
              return;
            }
            var code = event.originalEvent && event.originalEvent.code;
            if (code == 'Escape' && _this.modal) {
              _this.modal.hide();
            }
          };
      })(this);

      atom.commands.add("atom-workspace atom-text-editor[data-grammar*=\"gfm\"]", 'viblo-view:publish', publishFromEditor);
      atom.commands.add('.tree-view .file .name[data-name$=\\.md]', 'viblo-view:publish', publishFromFileTreeCb);
      atom.commands.add('.markdown-preview', 'viblo-view:publish', publishFromMarkdownPreview);
      atom.commands.add('atom-workspace', 'viblo-view:publish', publishFromWorkspace);

      atom.commands.add('atom-workspace', 'viblo-view:settings', function() {
          return atom.workspace.open(locationUri + "/settings");
      });

      atom.commands.add('atom-workspace', 'viblo-view:posts', function() {
          return atom.workspace.open(locationUri + "/posts");
      });

      if (postManagerInstance == null) {
        postManagerInstance = new PostManager();
      }
    },

    deactivate: function() {
      if (settingsViewInstance != null) {
        settingsViewInstance.dispose();
      }
      if (settingsViewInstance != null) {
        settingsViewInstance.remove();
      }
      settingsViewInstance = null;
      return postManagerInstance = null;
    },

    createSettingsView: function(params) {
      if (VibloPluginSettingsView == null) {
        VibloPluginSettingsView = require('./viblo-plugin-settings-view');
      }
      params.postManagerInstance = postManagerInstance;

      return settingsViewInstance = new VibloPluginSettingsView(params);
    },

    showPublishForm: function(markdownText) {
      var PublishForm;
      if (postManagerInstance == null) {
        postManagerInstance = new PostManager();
      }
      if (this.modal == null) {
        PublishForm = require('./publish-form');
        this.modal = new PublishForm(postManagerInstance);
      }
      this.modal.setContents(markdownText);
      return this.modal.show();
    },


  };
}).call(this);
