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

      var publishFormCb = (function(_this) {
          return function() {
            var contents;
            if (atom.workspace.getActivePaneItem().editor) {
              contents = atom.workspace.getActivePaneItem().editor.getText();
            } else if(atom.workspace.getActivePaneItem().file) {
              contents = atom.workspace.getActivePaneItem().file.cachedContents;
            }
            _this.showPublishForm(contents);
          };
      })(this);

      atom.commands.add(".markdown-preview", 'viblo-view:publish', publishFormCb);

      atom.commands.add('atom-workspace', 'viblo-view:settings', function() {
          return atom.workspace.open(locationUri + "/settings");
      });

      atom.commands.add('atom-workspace', 'viblo-view:posts', function() {
          return atom.workspace.open(locationUri + "/posts");
      });

      if (postManagerInstance == null) {
        postManagerInstance = new PostManager();
      }

      // return atom.commands.dispatch(atom.views.getView(atom.workspace), 'viblo-view:publish');


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
