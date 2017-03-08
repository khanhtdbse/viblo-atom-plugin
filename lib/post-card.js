(function() {
  // asdasdasd
  var CompositeDisposable,
  PostCard,
  View,
  marked,
  shell,
  renderer,
  moment,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  View = require('atom-space-pen-views').View;

  CompositeDisposable = require('atom').CompositeDisposable;

  shell = require('electron').shell;

  marked = null;

  moment = require('moment');

  module.exports = PostCard = (function(superClass) {
    extend(PostCard, superClass);

    function PostCard() {
      return PostCard.__super__.constructor.apply(this, arguments);
    }

    PostCard.content = function(arg) {
      var title, contents, url, status, createdAt;
      title = arg.title,
      url = arg.url,
      createdAt = moment(arg.created_at);
      contents = this.postPreview(arg.contents, function(error, html) {
        return html;
      });

      return this.div({
        "class": 'post-card col-lg-8'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'body'
          }, function() {
            _this.h4({}, function() {
              return _this.a({
                outlet: 'postTitle',
                'href': url,
                "class": 'post-title'
              }, title);
            });
            _this.div({
              outlet: 'postPreview',
              "class": 'post-preview'
            }, function() {
              return contents;
            });
          });


          return _this.div({
            "class": 'meta'
          }, function() {
            _this.div({
              outlet: 'metaUserContainer',
              "class": 'meta-user'
            }, function() {
              return _this.span("Created at: " + createdAt.format('lll'));
            });

            return _this.div({
              "class": 'meta-controls'
            }, function() {
              return _this.div({
                "class": 'btn-toolbar'
              }, function() {
                return _this.div({
                  outlet: 'postActionButtonGroup',
                  "class": 'btn-group'
                }, function() {
                  _this.button({
                    type: 'button',
                    "class": 'btn icon icon-pencil edit-button',
                    outlet: 'editButton'
                  }, 'Edit');
                  _this.button({
                    type: 'button',
                    "class": 'btn icon icon-trashcan delete-button',
                    outlet: 'deleteButton'
                  }, 'Delete');
                  _this.button({
                    type: 'button',
                    "class": 'btn icon icon-check publish-button',
                    outlet: 'publishButton'
                  }, 'Publish');
                  _this.button({
                    type: 'button',
                    "class": 'btn icon icon-x draft-button',
                    outlet: 'draftButton'
                  }, 'Draft');
                });
              });
            });
          });


        };
      })(this));
    };

    PostCard.prototype.initialize = function(post, postManager, options) {
      var ref;
      this.post = post;
      this.postManager = postManager;
      this.disposables = new CompositeDisposable();
      this.postTitle = this.post.title;
      this.postPreview = this.post.contents;

      this.handleButtonEvents();
    };


    PostCard.postPreview = function(contents, callback) {
      if (renderer == null) {
        renderer = require('./renderer');
      }
      return renderer.toHTML(contents, callback);
    }


    PostCard.prototype.handleButtonEvents = function() {
      this.deleteButton.on('click', (function(_this) {
        return function(event) {
          event.stopPropagation();
          return _this.hide();
        };
      })(this));
    };

    PostCard.prototype.dispose = function() {
      return this.disposables.dispose();
    };

    return PostCard;

  })(View);

}).call(this);
