(function() {
  var CompositeDisposable,
  Emitter,
  PostCard,
  View,
  marked,
  renderer,
  moment,
  fs,
  postStatusesInstance,
  PostStatuses,
  markdownIt,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  View = require('atom-space-pen-views').View;
  Emitter = require('atom').Emitter;
  CompositeDisposable = require('atom').CompositeDisposable;
  fs = require('fs-plus');
  marked = null;

  PostStatuses = require('./post-statuses');
  postStatusesInstance = new PostStatuses();

  moment = require('moment');

  module.exports = PostCard = (function(superClass) {
    extend(PostCard, superClass);

    function PostCard() {
      this.emitter = new Emitter;
      return PostCard.__super__.constructor.apply(this, arguments);
    }

    PostCard.content = function(arg) {
      var title, contents, url, status, createdAt;
      title = arg.title;
      url = arg.url;

      createdAt = moment(arg.created_at);
      contents = this.postPreview(arg.contents, function(error, html) {
        return html;
      });

      return this.div({
        'class': 'post-card col-lg-8'
      }, (function(_this) {
        return function() {
          _this.div({
            'class': 'body'
          }, function() {
            _this.h4({}, function() {
              return _this.a({
                outlet: 'postTitle',
                'href': url,
                'class': 'post-title'
              }, title);
            });
            _this.div({
              outlet: 'postPreview',
              'class': 'post-preview'
            }, function() {
              return contents;
            });
          });


          return _this.div({
            'class': 'meta'
          }, function() {
            _this.div({
              outlet: 'metaUserContainer',
              'class': 'meta-user'
            }, function() {
              return _this.span('Created at: ' + createdAt.format('lll'));
            });

            return _this.div({
              'class': 'meta-controls'
            }, function() {
              return _this.div({
                'class': 'btn-toolbar'
              }, function() {
                 _this.button({
                   type: 'button',
                   'class': 'btn icon icon-book publish-button',
                   outlet: 'publishButton'
                 }, function() {
                   _this.span({
                     'class': 'loading loading-spinner-tiny inline-block'
                   })
                   return _this.raw('Public')
                 });
                 _this.button({
                   type: 'button',
                   'class': 'btn icon icon-lock draft-button',
                   outlet: 'draftButton'
                 }, function() {
                   _this.span({
                     'class': 'loading loading-spinner-tiny inline-block'
                   })
                   return _this.raw('Draft')
                 });

                 _this.button({
                   type: 'button',
                   'class': 'btn icon icon-eye draft-public-button',
                   outlet: 'draftPublicButton'
                 }, function() {
                   _this.span({
                     'class': 'loading loading-spinner-tiny inline-block'
                   })
                   return _this.raw('Draft Public')
                 });

                // return _this.div({
                //   outlet: 'postActionButtonGroup',
                //   'class': 'btn-group'
                // }, function() {
                //   _this.button({
                //     type: 'button',
                //     'class': 'btn icon icon-trashcan delete-button',
                //     outlet: 'deleteButton'
                //   }, 'Delete');
                // });
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
      this.postPreview = this.post.contents;

      if (postStatusesInstance.isDrafted(post)) {
        $(this.postTitle).attr('href', postManager.getClient().getServerHost() + '/posts/' + this.post.slug + '/edit');
      }

      if (postStatusesInstance.isPublic(this.post)) {
        this.publishButton.hide();
      }
      if (postStatusesInstance.isDraftPublic(this.post)) {
        this.draftPublicButton.hide();
      }
      if (postStatusesInstance.isDrafted(this.post)) {
        this.draftButton.hide();
      }

      this.handleButtonEvents();

      this.subscribeToPostEvent('post-publishing post-saving-as-draft post-saving-as-draft-public', (function(_this) {
        return function(arg) {
          _this.publishButton.attr('disabled', true);
          _this.publishButton.addClass('is-processing');

          _this.draftButton.attr('disabled', true);
          _this.draftButton.addClass('is-processing');

          _this.draftPublicButton.attr('disabled', true);
          _this.draftPublicButton.addClass('is-processing');
        };
      })(this))

      this.subscribeToPostEvent('post-published post-saved-as-draft post-saved-as-draft-public', (function(_this) {
        return function(arg) {
            // _this.publishButton.attr('disabled', false);
            // _this.publishButton.removeClass('is-processing');
            //
            // _this.draftButton.attr('disabled', false);
            // _this.draftButton.removeClass('is-processing');
            //
            // _this.draftPublicButton.attr('disabled', false);
            // _this.draftPublicButton.removeClass('is-processing');
        };
      })(this))

      this.subscribeToPostEvent('post-publish-failed post-save-as-draft-failed post-save-as-draft-public-failed', (function(_this) {
        return function(arg) {
          _this.publishButton.attr('disabled', false);
          _this.publishButton.removeClass('is-processing');

          _this.draftButton.attr('disabled', false);
          _this.draftButton.removeClass('is-processing');

          _this.draftPublicButton.attr('disabled', false);
          _this.draftPublicButton.removeClass('is-processing');
        };
      })(this))

    };

    PostCard.prototype.subscribeToPostEvent = function(event, callback) {
      return this.disposables.add(this.postManager.on(event, (function(_this) {
        return function(arg) {
          var error, post;
          post = arg.post, error = arg.error;
          if (post.post != null) {
            post = post.post;
          }
          if (typeof post.slug !== 'undefined' && post.slug === _this.post.slug) {
            return callback(post, error);
          }
        };
      })(this)));
    }


    PostCard.postPreview = function(contents, callback) {
      if (markdownIt == null) {
        markdownIt = require('./markdown/markdown-it-helper');
      }
      return markdownIt.render(contents);
    }

    PostCard.prototype.publish = function() {
      return this.postManager
        .publish(this.post);
    }

    PostCard.prototype.draft = function() {
      return this.postManager
        .draft(this.post, false);
    }

    PostCard.prototype.draftPublic = function() {
      return this.postManager
        .draft(this.post, true);
    }

    PostCard.prototype.handleButtonEvents = function() {
      this.on('click', (function(_this) {
        return function() {
          // this.emitter.emit('post-opening', {
          //   'post': fs.getHomeDirectory() + '/.viblo/'+_this.post.slug+'.md'
          // })
          return atom.workspace.open(fs.getHomeDirectory() + '/.viblo/'+_this.post.slug+'.md', {
            searchAllPanes: true,
            activatePane: true
          });
          // return atom.workspace.open('atom://viblo/edit/'+_this.post.slug, {
          //   searchAllPanes: true
          // })
        };
      })(this))

      this.publishButton.on('click', (function(_this) {
        return function(event) {
          event.stopPropagation();
          return _this.publish();
        };
      })(this));

      this.draftButton.on('click', (function(_this) {
        return function(event) {
          event.stopPropagation();
          return _this.draft();
        };
      })(this));

      this.draftPublicButton.on('click', (function(_this) {
        return function(event) {
          event.stopPropagation();
          return _this.draftPublic();
        };
      })(this));

    };

    PostCard.prototype.dispose = function() {
      return this.disposables.dispose();
    };

    return PostCard;

  })(View);

}).call(this);
