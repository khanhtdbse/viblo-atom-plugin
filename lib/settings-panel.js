(function() {
  var $,
    $$,
    CollapsibleSectionPanel,
    CompositeDisposable,
    SettingsPanel,
    TextEditorView,
    TokenUpdateView,
    _,
    ref,
    fs,
    Emitter,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;
  Emitter = require('atom').Emitter;
  ref = require('atom-space-pen-views'), $ = ref.$, $$ = ref.$$, TextEditorView = ref.TextEditorView;
  fs = require('fs-plus');
  _ = require('underscore-plus');
  TokenUpdateView = require('./token-update-view');

  CollapsibleSectionPanel = require('./collapsible-section-panel');

  module.exports = SettingsPanel = (function(superClass) {
    extend(SettingsPanel, superClass);

    function SettingsPanel() {
      this.emitter = new Emitter;
      return SettingsPanel.__super__.constructor.apply(this, arguments);
    }

    SettingsPanel.content = function() {
      return this.section({
        "class": 'section settings-panel'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'section-container'
          }, function() {
              _this.div({
                "class": "block section-heading icon icon-settings"
              }, 'Viblo Atom Plugin Settings');
              return _this.div({
                "class": 'section-body'
              }, function() {
                return _this.div({
                  "class": 'control-group'
                }, function() {
                  return _this.div({
                    "class": 'controls'
                  }, function() {
                      _this.label({
                        "class": 'control-label'
                      }, function() {
                        _this.div({
                          "class": 'setting-title'
                        }, 'To integrate with Viblo Sharing Platform you must to create new API token on Viblo Profile Page');
                        return _this.div({
                          "class": 'setting-description'
                        }, function() {
                          return _this.raw('Paste your private VIBLO API token here...');
                        });
                      });
                      return _this.div({
                        "class": 'controls'
                      }, function() {
                          return _this.div({
                            "class": 'editor-container'
                          }, function() {
                            _this.subview('apiToken', new TextEditorView({
                              mini: true,
                              attributes: {
                                id: 'viblo-atom-plugin.apiToken',
                                type: 'string'
                              }
                            }));
                          });
                      });
                  });
                });
              })
          });
        }
      })(this));
    };

    var saveApiToken = function(token, successCb, errorCb) {
      var homeDir, vibloDir;
      homeDir = fs.getHomeDirectory();
      vibloDir = homeDir + '/.viblo';
      fs.isDirectory(vibloDir, (function(_this) {
        return function(result) {
          if (!result) {
            fs.makeTreeSync(vibloDir);
          }
          if (result) {
            var tokenPath = vibloDir+'/api.token';
            var writeStream = fs.createWriteStream(tokenPath);
            writeStream.end(token);
            writeStream.on('finish', function() {
              return successCb();
            })
            writeStream.on('error', function(error) {
              errorCb();
              writeStream.close();
              try {
                if (fs.existsSync(tokenPath)) {
                  fs.unlinkSync(tokenPath);
                }
              } catch (error1) {}
              console.log(error);
            });
          }
        };
      })(this));
    }

    var loadApiToken = function(callback) {
      var homeDir, vibloDir;
      homeDir = fs.getHomeDirectory();
      vibloDir = homeDir + '/.viblo';
      var tokenPath = vibloDir+'/api.token';
      if (fs.isFileSync(tokenPath)) {
        fs.readFile(tokenPath, function(err, data) {
          if (!err) {
            callback(data);
          }
        });
      }
    }

    SettingsPanel.prototype.initialize = function() {
      this.disposables = new CompositeDisposable();

      this.disposables.add(this.apiToken.getModel().onDidStopChanging(
        (function(_this){
            return _.debounce(function() {
              var token = _this.apiToken.getModel().getText();
              var successCb = function() {
                var notification = atom.notifications.addSuccess('Viblo API token updated successfully!', {
                  description: 'You have to reload Atom to apply token changes',
                  dismissable: true,
                  buttons: [
                    {
                      text: 'Reload Atom',
                      onDidClick: function() {
                        atom.reload();
                      }
                    },
                    {
                      text: 'Cancel',
                      onDidClick: function() {
                        return notification.dismiss();
                      }
                    }
                  ]
                });
                _this.apiToken.getModel().setPlaceholderText(Array(token.length).join('*'));
              }

              var errorCb = function() {
                var notification = atom.notifications.addError('Viblo API token  was not updated due to an error!', {
                  dismissable: true,
                  buttons: [
                    {
                      text: 'Close',
                      onDidClick: function() {
                        _this.postManager.openPostOnViblo(result.data);
                        return notification.dismiss();
                      }
                    }
                  ]
                });
              }

              saveApiToken(token, successCb, errorCb);
            }, 1000)
        })(this)
      ));

      loadApiToken((function(_this){
        return function(token) {
          _this.apiToken.getModel().setPlaceholderText(Array(token.length).join('*'));
        }
      })(this));

    };

    SettingsPanel.prototype.dispose = function() {
      return this.disposables.dispose();
    };

    SettingsPanel.prototype.sortSettings = function(namespace, settings) {
      return sortSettings(namespace, settings);
    };

    SettingsPanel.prototype.observe = function(name, callback) {
      var params;
      params = {
        sources: [atom.config.getUserConfigPath()]
      };
      if (this.options.scopeName != null) {
        params.scope = [this.options.scopeName];
      }
      return this.disposables.add(atom.config.observe(name, params, callback));
    };

    SettingsPanel.prototype.isDefault = function(name) {
      var defaultValue, params, value;
      params = {
        sources: [atom.config.getUserConfigPath()]
      };
      if (this.options.scopeName != null) {
        params.scope = [this.options.scopeName];
      }
      defaultValue = this.getDefault(name);
      value = atom.config.get(name, params);
      return (value == null) || defaultValue === value;
    };

    SettingsPanel.prototype.getDefault = function(name) {
      var params;
      if (this.options.scopeName != null) {
        return atom.config.get(name);
      } else {
        params = {
          excludeSources: [atom.config.getUserConfigPath()]
        };
        if (this.options.scopeName != null) {
          params.scope = [this.options.scopeName];
        }
        return atom.config.get(name, params);
      }
    };

    SettingsPanel.prototype.set = function(name, value) {
      if (this.options.scopeName) {
        if (value === void 0) {
          return atom.config.unset(name, {
            scopeSelector: this.options.scopeName
          });
        } else {
          return atom.config.set(name, value, {
            scopeSelector: this.options.scopeName
          });
        }
      } else {
        return atom.config.set(name, value);
      }
    };

    SettingsPanel.prototype.bindSelectFields = function() {
      return this.find('select[id]').toArray().forEach((function(_this) {
        return function(select) {
          var name;
          select = $(select);
          name = select.attr('id');
          _this.observe(name, function(value) {
            return select.val(value);
          });
          return select.change(function() {
            return _this.set(name, select.val());
          });
        };
      })(this));
    };

    SettingsPanel.prototype.bindEditors = function() {
      return this.find('atom-text-editor[id]').views().forEach((function(_this) {
        return function(editorView) {
          var defaultValue, editor, editorElement, name, type;
          editor = editorView.getModel();
          editorElement = $(editorView.element);
          name = editorView.attr('id');
          type = editorView.attr('type');
          if (defaultValue = _this.valueToString(_this.getDefault(name))) {
            if (_this.options.scopeName != null) {
              editor.setPlaceholderText("Unscoped value: " + defaultValue);
            } else {
              editor.setPlaceholderText("Default: " + defaultValue);
            }
          }
          editorElement.on('focus', function() {
            var ref1;
            if (_this.isDefault(name)) {
              return editorView.setText((ref1 = _this.valueToString(_this.getDefault(name))) != null ? ref1 : '');
            }
          });
          editorElement.on('blur', function() {
            if (_this.isDefault(name)) {
              return editorView.setText('');
            }
          });
          _this.observe(name, function(value) {
            var ref1, stringValue;
            if (_this.isDefault(name)) {
              stringValue = '';
            } else {
              stringValue = (ref1 = _this.valueToString(value)) != null ? ref1 : '';
            }
            if (stringValue === editor.getText()) {
              return;
            }
            if (_.isEqual(value, _this.parseValue(type, editor.getText()))) {
              return;
            }
            return editorView.setText(stringValue);
          });
          return editor.onDidStopChanging(function() {
            return _this.set(name, _this.parseValue(type, editor.getText()));
          });
        };
      })(this));
    };

    SettingsPanel.prototype.valueToString = function(value) {
      if (_.isArray(value)) {
        return value.join(', ');
      } else {
        return value != null ? value.toString() : void 0;
      }
    };

    SettingsPanel.prototype.parseValue = function(type, value) {
      var arrayValue, floatValue, val;
      if (value === '') {
        value = void 0;
      } else if (type === 'number') {
        floatValue = parseFloat(value);
        if (!isNaN(floatValue)) {
          value = floatValue;
        }
      } else if (type === 'array') {
        arrayValue = (value || '').split(',');
        value = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = arrayValue.length; i < len; i++) {
            val = arrayValue[i];
            if (val) {
              results.push(val.trim());
            }
          }
          return results;
        })();
      }
      return value;
    };

    return SettingsPanel;

  })(CollapsibleSectionPanel);

}).call(this);
