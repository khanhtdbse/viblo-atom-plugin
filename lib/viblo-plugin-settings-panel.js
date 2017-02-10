(function() {
  var $,
    $$,
    CollapsibleSectionPanel,
    CompositeDisposable,
    VibloPluginSettingsPanel,
    TextEditorView,
    _,
    appendArray,
    appendCheckbox,
    appendColor,
    appendEditor,
    appendObject,
    appendOptions,
    appendSetting,
    getSettingDescription,
    getSettingTitle,
    isEditableArray,
    ref,
    sortSettings,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('atom-space-pen-views'), $ = ref.$, $$ = ref.$$, TextEditorView = ref.TextEditorView;

  _ = require('underscore-plus');

  CollapsibleSectionPanel = require('./collapsible-section-panel');

  getSettingDescription = require('./rich-description').getSettingDescription;

  module.exports = VibloPluginSettingsPanel = (function(superClass) {
    extend(VibloPluginSettingsPanel, superClass);

    function VibloPluginSettingsPanel() {
      return VibloPluginSettingsPanel.__super__.constructor.apply(this, arguments);
    }

    VibloPluginSettingsPanel.content = function() {
      return this.section({
        "class": 'section settings-panel'
      });
    };

    VibloPluginSettingsPanel.prototype.initialize = function(namespace, options1) {

      var i, len, name, scopedSettings, settings;
      this.options = options1 != null ? options1 : {};
      this.disposables = new CompositeDisposable();
      if (this.options.scopeName) {
        namespace = 'viblo';
        scopedSettings = [];
        settings = {};
        for (i = 0, len = scopedSettings.length; i < len; i++) {
          name = scopedSettings[i];
          settings[name] = atom.config.get(name, {
            scope: [this.options.scopeName]
          });
        }
      } else {
        settings = atom.config.get(namespace);
      }
      this.appendSettings(namespace, settings);
      this.bindInputFields();
      this.bindSelectFields();
      this.bindEditors();
      this.bindTooltips();
      return this.handleEvents();
    };

    VibloPluginSettingsPanel.prototype.dispose = function() {
      return this.disposables.dispose();
    };

    VibloPluginSettingsPanel.prototype.appendSettings = function(namespace, settings) {
      var icon, includeTitle, note, ref1, ref2, sortedSettings, title;
      if (_.isEmpty(settings)) {
        return;
      }
      title = this.options.title;
      includeTitle = (ref1 = this.options.includeTitle) != null ? ref1 : true;
      if (includeTitle) {
        if (title == null) {
          title = (_.undasherize(_.uncamelcase(namespace))) + " Settings";
        }
      } else {
        if (title == null) {
          title = "Viblo Settings";
        }
      }
      icon = (ref2 = this.options.icon) != null ? ref2 : 'gear';
      note = this.options.note;
      sortedSettings = this.sortSettings(namespace, settings);
      return this.append($$(function() {
        return this.div({
          "class": 'section-container'
        }, (function(_this) {
          return function() {
            _this.div({
              "class": "block section-heading icon icon-" + icon
            }, title);
            if (note) {
              _this.raw(note);
            }
            return _this.div({
              "class": 'section-body'
            }, function() {
              var i, len, name, results;
              results = [];
              for (i = 0, len = sortedSettings.length; i < len; i++) {
                name = sortedSettings[i];
                results.push(appendSetting.call(_this, namespace, name, settings[name]));
              }
              return results;
            });
          };
        })(this));
      }));
    };

    VibloPluginSettingsPanel.prototype.sortSettings = function(namespace, settings) {
      return sortSettings(namespace, settings);
    };

    VibloPluginSettingsPanel.prototype.bindInputFields = function() {
      return this.find('input[id]').toArray().forEach((function(_this) {
        return function(input) {
          var name, type;
          input = $(input);
          name = input.attr('id');
          type = input.attr('type');
          _this.observe(name, function(value) {
            var ref1;
            if (type === 'checkbox') {
              return input.prop('checked', value);
            } else {
              if (type === 'color') {
                value = (ref1 = value != null ? typeof value.toHexString === "function" ? value.toHexString() : void 0 : void 0) != null ? ref1 : value;
              }
              if (value) {
                return input.val(value);
              }
            }
          });
          return input.on('change', function() {
            var setNewValue, value;
            value = input.val();
            if (type === 'checkbox') {
              value = !!input.prop('checked');
            } else {
              value = _this.parseValue(type, value);
            }
            setNewValue = function() {
              return _this.set(name, value);
            };
            if (type === 'color') {
              clearTimeout(_this.colorDebounceTimeout);
              return _this.colorDebounceTimeout = setTimeout(setNewValue, 100);
            } else {
              return setNewValue();
            }
          });
        };
      })(this));
    };

    VibloPluginSettingsPanel.prototype.observe = function(name, callback) {
      var params;
      params = {
        sources: [atom.config.getUserConfigPath()]
      };
      if (this.options.scopeName != null) {
        params.scope = [this.options.scopeName];
      }
      return this.disposables.add(atom.config.observe(name, params, callback));
    };

    VibloPluginSettingsPanel.prototype.isDefault = function(name) {
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

    VibloPluginSettingsPanel.prototype.getDefault = function(name) {
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

    VibloPluginSettingsPanel.prototype.set = function(name, value) {
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

    VibloPluginSettingsPanel.prototype.bindSelectFields = function() {
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

    VibloPluginSettingsPanel.prototype.bindEditors = function() {
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

    VibloPluginSettingsPanel.prototype.bindTooltips = function() {
      return this.find('input[id], select[id], atom-text-editor[id]').views().forEach((function(_this) {
        return function(view) {
          var defaultValue;
          if (defaultValue = _this.valueToString(_this.getDefault(view.attr('id')))) {
            return _this.disposables.add(atom.tooltips.add(view, {
              title: 'Default: ' + defaultValue,
              delay: {
                show: 100
              },
              placement: 'auto left'
            }));
          }
        };
      })(this));
    };

    VibloPluginSettingsPanel.prototype.valueToString = function(value) {
      if (_.isArray(value)) {
        return value.join(', ');
      } else {
        return value != null ? value.toString() : void 0;
      }
    };

    VibloPluginSettingsPanel.prototype.parseValue = function(type, value) {
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

    return VibloPluginSettingsPanel;

  })(CollapsibleSectionPanel);

  isEditableArray = function(array) {
    var i, item, len;
    for (i = 0, len = array.length; i < len; i++) {
      item = array[i];
      if (!_.isString(item)) {
        return false;
      }
    }
    return true;
  };

  sortSettings = function(namespace, settings) {
    return _.chain(settings).keys().sortBy(function(name) {
      return name;
    }).sortBy(function(name) {
      var ref1;
      return (ref1 = atom.config.getSchema(namespace + "." + name)) != null ? ref1.order : void 0;
    }).value();
  };

  appendSetting = function(namespace, name, value) {
    return this.div({
      "class": 'control-group'
    }, (function(_this) {
      return function() {
        return _this.div({
          "class": 'controls'
        }, function() {
          var schema;
          schema = atom.config.getSchema(namespace + "." + name);
          if (schema != null ? schema["enum"] : void 0) {
            return appendOptions.call(_this, namespace, name, value);
          } else if ((schema != null ? schema.type : void 0) === 'color') {
            return appendColor.call(_this, namespace, name, value);
          } else if (_.isBoolean(value) || (schema != null ? schema.type : void 0) === 'boolean') {
            return appendCheckbox.call(_this, namespace, name, value);
          } else if (_.isArray(value) || (schema != null ? schema.type : void 0) === 'array') {
            if (isEditableArray(value)) {
              return appendArray.call(_this, namespace, name, value);
            }
          } else if (_.isObject(value) || (schema != null ? schema.type : void 0) === 'object') {
            return appendObject.call(_this, namespace, name, value);
          } else {
            return appendEditor.call(_this, namespace, name, value);
          }
        });
      };
    })(this));
  };

  getSettingTitle = function(keyPath, name) {
    var ref1, title;
    if (name == null) {
      name = '';
    }
    title = (ref1 = atom.config.getSchema(keyPath)) != null ? ref1.title : void 0;
    return title || _.uncamelcase(name).split('.').map(_.capitalize).join(' ');
  };

  appendOptions = function(namespace, name, value) {
    var description, keyPath, options, ref1, ref2, title;
    keyPath = namespace + "." + name;
    title = getSettingTitle(keyPath, name);
    description = getSettingDescription(keyPath);
    options = (ref1 = (ref2 = atom.config.getSchema(keyPath)) != null ? ref2["enum"] : void 0) != null ? ref1 : [];
    this.label({
      "class": 'control-label'
    }, (function(_this) {
      return function() {
        _this.div({
          "class": 'setting-title'
        }, title);
        return _this.div({
          "class": 'setting-description'
        }, function() {
          return _this.raw(description);
        });
      };
    })(this));
    return this.select({
      id: keyPath,
      "class": 'form-control'
    }, (function(_this) {
      return function() {
        var i, len, option, results;
        results = [];
        for (i = 0, len = options.length; i < len; i++) {
          option = options[i];
          if (option.hasOwnProperty('value')) {
            results.push(_this.option({
              value: option.value
            }, option.description));
          } else {
            results.push(_this.option({
              value: option
            }, option));
          }
        }
        return results;
      };
    })(this));
  };

  appendCheckbox = function(namespace, name, value) {
    var description, keyPath, title;
    keyPath = namespace + "." + name;
    title = getSettingTitle(keyPath, name);
    description = getSettingDescription(keyPath);
    return this.div({
      "class": 'checkbox'
    }, (function(_this) {
      return function() {
        _this.label({
          "for": keyPath
        }, function() {
          _this.input({
            id: keyPath,
            "class": 'input-checkbox',
            type: 'checkbox'
          });
          return _this.div({
            "class": 'setting-title'
          }, title);
        });
        return _this.div({
          "class": 'setting-description'
        }, function() {
          return _this.raw(description);
        });
      };
    })(this));
  };

  appendColor = function(namespace, name, value) {
    var description, keyPath, title;
    keyPath = namespace + "." + name;
    title = getSettingTitle(keyPath, name);
    description = getSettingDescription(keyPath);
    return this.div({
      "class": 'color'
    }, (function(_this) {
      return function() {
        _this.label({
          "for": keyPath
        }, function() {
          _this.input({
            id: keyPath,
            type: 'color'
          });
          return _this.div({
            "class": 'setting-title'
          }, title);
        });
        return _this.div({
          "class": 'setting-description'
        }, function() {
          return _this.raw(description);
        });
      };
    })(this));
  };

  appendEditor = function(namespace, name, value) {
    var description, keyPath, title, type;
    keyPath = namespace + "." + name;
    if (_.isNumber(value)) {
      type = 'number';
    } else {
      type = 'string';
    }
    title = getSettingTitle(keyPath, name);
    description = getSettingDescription(keyPath);
    this.label({
      "class": 'control-label'
    }, (function(_this) {
      return function() {
        _this.div({
          "class": 'setting-title'
        }, title);
        return _this.div({
          "class": 'setting-description'
        }, function() {
          return _this.raw(description);
        });
      };
    })(this));
    return this.div({
      "class": 'controls'
    }, (function(_this) {
      return function() {
        return _this.div({
          "class": 'editor-container'
        }, function() {
          return _this.subview(keyPath.replace(/\./g, ''), new TextEditorView({
            mini: true,
            attributes: {
              id: keyPath,
              type: type
            }
          }));
        });
      };
    })(this));
  };

  appendArray = function(namespace, name, value) {
    var description, keyPath, title;
    keyPath = namespace + "." + name;
    title = getSettingTitle(keyPath, name);
    description = getSettingDescription(keyPath);
    this.label({
      "class": 'control-label'
    }, (function(_this) {
      return function() {
        _this.div({
          "class": 'setting-title'
        }, title);
        return _this.div({
          "class": 'setting-description'
        }, function() {
          return _this.raw(description);
        });
      };
    })(this));
    return this.div({
      "class": 'controls'
    }, (function(_this) {
      return function() {
        return _this.div({
          "class": 'editor-container'
        }, function() {
          return _this.subview(keyPath.replace(/\./g, ''), new TextEditorView({
            mini: true,
            attributes: {
              id: keyPath,
              type: 'array'
            }
          }));
        });
      };
    })(this));
  };

  appendObject = function(namespace, name, value) {
    var isCollapsed, keyPath, schema, title;
    if (!_.keys(value).length) {
      return;
    }
    keyPath = namespace + "." + name;
    title = getSettingTitle(keyPath, name);
    schema = atom.config.getSchema(keyPath);
    isCollapsed = schema.collapsed === true;
    return this.section({
      "class": "sub-section" + (isCollapsed ? ' collapsed' : '')
    }, (function(_this) {
      return function() {
        _this.h3({
          "class": 'sub-section-heading has-items'
        }, function() {
          return _this.text(title);
        });
        return _this.div({
          "class": 'sub-section-body'
        }, function() {
          var i, key, len, results, sortedSettings;
          sortedSettings = sortSettings(keyPath, value);
          results = [];
          for (i = 0, len = sortedSettings.length; i < len; i++) {
            key = sortedSettings[i];
            results.push(appendSetting.call(_this, namespace, name + "." + key, value[key]));
          }
          return results;
        });
      };
    })(this));
  };

}).call(this);
