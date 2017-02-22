(function(){

  var locationUri = 'atom://viblo',
    uriRegex = /viblo\/([a-z]+)\/?([a-zA-Z0-9_-]+)?/i,
    settingsViewInstance, VibloPluginSettingsView;

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
    console.log(match, panelName, options);
    return settingsViewInstance.showPanel(panelName, options);
  };

  module.exports = {

    activate(state) {
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

      atom.commands.add('atom-workspace', {
        'viblo-view:open': function() {
          return atom.workspace.open(locationUri);
        },
        'viblo-view:posts': function() {
          return atom.workspace.open(locationUri + "/posts");
        },
        'viblo-view:drafts': function() {
          return atom.workspace.open(locationUri + "/drafts");
        },
        'viblo-view:settings': function() {
          return atom.workspace.open(locationUri + "/settings");
        }
      });
    },

    createSettingsView: function(params) {
      if (VibloPluginSettingsView == null) {
        VibloPluginSettingsView = require('./viblo-plugin-settings-view');
      }
      return settingsViewInstance = new VibloPluginSettingsView(params);
    },

  };
}).call(this);
