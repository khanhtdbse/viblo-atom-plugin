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
      var title, url, createdAt;
      title = arg.title;
      url = arg.url;
      createdAt = moment(arg.created_at);

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
              _this.text('Save as: ');
              return _this.div({
                'class': 'btn-toolbar'
              }, function() {
                 _this.button({
                   type: 'button',
                   'class': 'btn icon icon-eye publish-button',
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
                   'class': 'btn icon viblo-unlocked draft-public-button',
                   outlet: 'draftPublicButton'
                 }, function() {
                   _this.span({
                     'class': 'loading loading-spinner-tiny inline-block'
                   })
                   return _this.raw('Draft Public')
                 });
              });
            });
          });


        };
      })(this));
    };

    PostCard.prototype.initialize = function(post, postManager) {
      this.post = post;
      this.postManager = postManager;
      this.disposables = new CompositeDisposable();

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
      })(this));

      this.subscribeToPostEvent('post-published post-saved-as-draft post-saved-as-draft-public', (function(_this) {
        return function(arg) {
            _this.publishButton.attr('disabled', false);
            _this.publishButton.removeClass('is-processing');

            _this.draftButton.attr('disabled', false);
            _this.draftButton.removeClass('is-processing');

            _this.draftPublicButton.attr('disabled', false);
            _this.draftPublicButton.removeClass('is-processing');
        };
      })(this));

      this.subscribeToPostEvent('post-publish-failed post-save-as-draft-failed post-save-as-draft-public-failed', (function(_this) {
        return function(arg) {
          _this.publishButton.attr('disabled', false);
          _this.publishButton.removeClass('is-processing');

          _this.draftButton.attr('disabled', false);
          _this.draftButton.removeClass('is-processing');

          _this.draftPublicButton.attr('disabled', false);
          _this.draftPublicButton.removeClass('is-processing');
        };
      })(this));

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


    PostCard.prototype.publish = function() {
      var publishPromise = this.postManager.publish(this.post);
      publishPromise.then((function(_this) {
        return function(result) {
          if (result.success) {
            var notification = atom.notifications.addSuccess('Congratulations!', {
              detail: 'Your post was successfully published',
              dismissable: true,
              buttons: [
                {
                  text: 'Check your post on Viblo',
                  onDidClick: function() {
                    _this.openPostOnViblo(result);
                    return notification.dismiss();
                  }
                }
              ]
            });

            _this.postManager.emitPostEvent('post-published', _this.post);
          } else {
            errorMessage = result.statusText;
            var notification = atom.notifications.addError('Request error', {
              description: 'Do you want to report about this issue?',
              detail: 'Error message:' +errorMessage,
              dismissable: true,
              buttons: [
                {
                  text: 'Report Issue',
                  onDidClick: function() {
                    // TODO: create issue on github
                    return notification.dismiss();
                  }
                },
                {
                  text: 'No, thanks',
                  onDidClick: function() {
                    return notification.dismiss();
                  }
                }
              ]
            });
            _this.postManager.emitPostEvent('post-publish-failed', _this.post);
          }
        }
      })(this));
    }

    PostCard.prototype.draft = function() {
      var draftPromise = this.postManager
        .draft(this.post, false);

      draftPromise.then((function(_this) {
        return function(result) {
          if (result.success) {
            var notification = atom.notifications.addSuccess('Congratulations!', {
              detail: 'Your post was successfully saved as Draft',
              dismissable: true
            });

            _this.postManager.emitPostEvent('post-saved-as-draft', _this.post);
          } else {
            errorMessage = result.statusText;
            var notification = atom.notifications.addError('Request error', {
              description: 'Do you want to report about this issue?',
              detail: 'Error message:' +errorMessage,
              dismissable: true,
              buttons: [
                {
                  text: 'Report Issue',
                  onDidClick: function() {
                    // TODO: create issue on github
                    return notification.dismiss();
                  }
                },
                {
                  text: 'No, thanks',
                  onDidClick: function() {
                    return notification.dismiss();
                  }
                }
              ]
            });
            _this.postManager.emitPostEvent('post-save-as-draft-failed', _this.post);
          }
        }
      })(this));
    }

    PostCard.prototype.draftPublic = function() {
      var draftPublicPromise = this.postManager
        .draft(this.post, true);

      draftPublicPromise.then((function(_this) {
        return function(result) {
          if (result.success) {
            var notification = atom.notifications.addSuccess('Congratulations!', {
              detail: 'Your post was successfully saved as Draft Public',
              dismissable: true
            });

            _this.postManager.emitPostEvent('post-saved-as-draft-public', _this.post);
          } else {
            errorMessage = result.statusText;
            var notification = atom.notifications.addError('Request error', {
              description: 'Do you want to report about this issue?',
              detail: 'Error message:' +errorMessage,
              dismissable: true,
              buttons: [
                {
                  text: 'Report Issue',
                  onDidClick: function() {
                    // TODO: create issue on github
                    return notification.dismiss();
                  }
                },
                {
                  text: 'No, thanks',
                  onDidClick: function() {
                    return notification.dismiss();
                  }
                }
              ]
            });
            _this.postManager.emitPostEvent('post-save-as-draft-public-failed', _this.post);
          }
        }
      })(this));
    };

    PostCard.prototype.handleButtonEvents = function() {
      this.on('click', (function(_this) {
        return function() {
          return atom.workspace.open(fs.getHomeDirectory() + '/.viblo/'+_this.post.slug+'.md', {
            searchAllPanes: true,
            activatePane: true
          });
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
