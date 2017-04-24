(function() {
  var $, $$$,
  CompositeDisposable, Directory,
  Emitter, utils,
  View, fs, path, ref, ref1,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom'),
  Emitter = ref.Emitter,
  CompositeDisposable = ref.CompositeDisposable;

  ref1 = require('atom-space-pen-views'),
  $ = ref1.$,
  $$$ = ref1.$$$,
  View = ref1.View;
  utils = require("./utils");

  var scopeSelectors = {
    code: ".raw",
    strikethrough: ".strike"
  };

  EraserHelper = (function(superClass) {
    extend(EraserHelper, superClass);

    function EraserHelper() {
    }

    EraserHelper.prototype.subscriptions = new CompositeDisposable;

    EraserHelper.prototype.trigger = function(e) {
      this.editor = atom.workspace.getActiveTextEditor();
      return this.editor.transact((function(_this) {
        return function() {
          return _this.editor.getSelections().forEach(function(selection) {
            var text = selection.getText();
            var retainSelection = !selection.isEmpty();
            _this.normalizeSelection(selection);
            text = text.replace(/^[ ]*([# ]+|\*|\-|[> ]+|[`*]+|[0-9]+(.|\)))[ ]*/gm, "");
            return selection.insertText(text, {
              select: retainSelection
            });
          });
        };
      })(this));
    };

    EraserHelper.prototype.normalizeSelection = function(selection) {
      var range, scopeSelector;
      scopeSelector = scopeSelectors[this.styleName];
      if (!scopeSelector) {
        return;
      }
      range = utils.getTextBufferRange(this.editor, scopeSelector, selection);
      return selection.setBufferRange(range);
    };

    return EraserHelper;

  })(View);

  module.exports = EraserHelper;

}).call(this);
