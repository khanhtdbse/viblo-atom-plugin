(function() {
  var $, $$$,
  CompositeDisposable, Directory,
  Emitter,
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



  EraserHelper = (function(superClass) {
    extend(EraserHelper, superClass);

    function EraserHelper() {
      return EraserHelper.__super__.constructor.apply(this, arguments);
    }

    EraserHelper.prototype.subscriptions = new CompositeDisposable;

    EraserHelper.prototype.trigger = function(e) {
      this.editor = atom.workspace.getActiveTextEditor();
      return this.editor.transact((function(_this) {
        return function() {
          console.log(_this.editor.getSelections());
          // return _this.editor.getSelections().forEach(function(selection) {
          //   var retainSelection, text;
          //   retainSelection = !selection.isEmpty();
          //   _this.normalizeSelection(selection);
          //   if (text = selection.getText()) {
          //     return _this.toggleStyle(selection, text, {
          //       select: retainSelection
          //     });
          //   } else {
          //     return _this.insertEmptyStyle(selection);
          //   }
          // });
        };
      })(this));
    };

    return EraserHelper;

  })(View);

  module.exports = EraserHelper;

}).call(this);
