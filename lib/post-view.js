(function() {
  var PostView, View, TextEditorView, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

    ref = require('atom-space-pen-views');
    View = ref.View;

  TextEditorView = ref.TextEditorView;

  module.exports = PostView = (function(superClass) {
    extend(PostView, superClass);

    function PostView() {
      return PostView.__super__.constructor.apply(this, arguments);
    }

    PostView.content = function() {
      return this.div({}, (function(_this){
        return function() {
            return _this.subview('postEditor', new TextEditorView());
        };
      })(this))
    };

    PostView.prototype.getTitle = function() {
      return this.post.title;
    };

    PostView.prototype.initialize = function(post) {
      this.post = post;
      this.postEditor.getModel().setText(post.contents);
      atom.commands.add(this.postEditor, {
        'viblo-view:toggle': function(event) {
          event.preventDefault();
          event.stopPropagation();
          return this.postEditor;
        }
      });
    };
    
    return PostView;

  })(View);

}).call(this);
