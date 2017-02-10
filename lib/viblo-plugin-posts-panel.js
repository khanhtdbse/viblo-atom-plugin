(function(){
  var $, $$$, CompositeDisposable, VibloPluginPostsPanel, ScrollView, TextEditor, _, path, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('atom-space-pen-views'), $ = ref.$, $$$ = ref.$$$, ScrollView = ref.ScrollView;

  _ = require('underscore-plus');

  path = require('path');

  module.exports = VibloPluginPostsPanel = (function(superClass){
    extend(VibloPluginPostsPanel, superClass);

    function VibloPluginPostsPanel() {
      return VibloPluginPostsPanel.__super__.constructor.apply(this, arguments);
    }

    VibloPluginPostsPanel.prototype.initialize = function() {
      VibloPluginPostsPanel.__super__.initialize.apply(this, arguments);
      this.disposables = new CompositeDisposable();
      this.createEditor(this.postsPanel);
      this.handleEvents();
    }

    VibloPluginPostsPanel.content = function() {
      return this.div({
        "class": 'panels-item'
      }, (function(_this){
          return function() {
            return _this.section({
                outlet: "postsPanel",
                "class": 'posts-panel'
              }
              // , function() {
              //   _this.button({
              //     outlet: 'editPostButton',
              //     "class": 'btn btn-default'
              //   }, 'Edit post');
              //   return _this.div({
              //     outlet: 'editorContainer',
              //     "class": 'container editor-container hidden'
              //   }, function() {
              //     return _this.button({
              //       outlet: 'closeEditorButton',
              //       "class": 'btn btn-default'
              //     }, 'Close editor');
              //   });
              // }
            )
          }
        })(this))
    }

    VibloPluginPostsPanel.prototype.createEditor = function(container) {
      TextEditor = atom.workspace.buildTextEditor();
      TextEditorView = atom.views.getView(TextEditor);
      container.append(TextEditorView);
    }

    VibloPluginPostsPanel.prototype.handleEvents = function() {
      // this.editPostButton.on('click', (function(_this) {
      //   return function() {
      //     if (!TextEditor) {
              // TextEditor = atom.workspace.buildTextEditor();
              // TextEditor.insertText('# TITLE')
              // TextEditorView = atom.views.getView(TextEditor);
              // _this.editorContainer.append(TextEditorView)
      //       }
      //       _this.editorContainer.removeClass('hidden')
      //   };
      // })(this));
      // this.closeEditorButton.on('click', (function(_this) {
      //   return function() {
      //       _this.editorContainer.addClass('hidden')
      //   };
      // })(this));
    }



    VibloPluginPostsPanel.prototype.dispose = function() {
      TextEditor.dispose()
      return this.disposables.dispose();
    };

    return VibloPluginPostsPanel;

  })(ScrollView)

}).call(this);
