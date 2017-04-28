(function () {
  var BufferedProcess,
    VibloAPI,
    CompositeDisposable,
    Emitter,
    PostManager,
    PostStatuses,
    postStatusesInstance,
    _,
    createJsonParseError,
    createProcessError,
    handleProcessErrors,
    ref,
    fs,
    shell,
    semver,
    bind = function (fn, me) {
      return function () {
        return fn.apply(me, arguments);
      };
    };

  _ = require('underscore-plus');
  PostStatuses = require('./post-statuses');
  postStatusesInstance = new PostStatuses();
  ref = require('atom'),
    BufferedProcess = ref.BufferedProcess,
    CompositeDisposable = ref.CompositeDisposable,
    Emitter = ref.Emitter;

  shell = require('electron').shell;
  semver = require('semver');
  fs = require('fs-plus');

  VibloAPI = require('./viblo-api');

  module.exports = PostManager = (function () {
    function PostManager() {
      this.postPromises = [];
      this.emitter = new Emitter;
    }

    PostManager.prototype.getClient = function () {
      return this.apiClient != null ? this.apiClient : this.apiClient = new VibloAPI(this);
    };

    PostManager.prototype.getPublished = function () {
      return this.getClient().request('GET', '/posts/list/published')
    }

    PostManager.prototype.getDrafts = function () {
      return this.getClient().request('GET', '/posts/list/drafts')
    }

    PostManager.prototype.getDraftPublished = function () {
      return this.getClient().request('GET', '/posts/list/publicDrafts')
    }

    PostManager.prototype.openPostOnViblo = function (post) {
      var client = this.getClient();
      var url = '';
      if (typeof post.url !== 'undefined') {
        url = post.url;
      } else if (typeof post.user !== 'undefined') {
        url = client.getServerHost() + '/'  + post.user.username + '/posts/' + post.slug;
      } else if (typeof post.data !== 'undefined') {
        url = client.getServerHost() + '/'  + post.data.username + '/posts/' + post.data.slug;
      } else if (typeof post.username !== 'undefined' && typeof post.slug !== 'undefined') {
        url = client.getServerHost() + '/'  + post.username + '/posts/' + post.slug;
      }

      return shell.openExternal(url);
    };

    PostManager.prototype.savePostToFile = function(post, sync = true) {
      var vibloDir = fs.getHomeDirectory() + '/.viblo';
      fs.isDirectory(vibloDir, (function(_this) {
        return function(result) {
          if (result) {
            var postPath = vibloDir+'/'+ post.slug + '.md';
            var postMetaPath = vibloDir+'/'+ post.slug + '.meta';
            var postWriteStream = fs.createWriteStream(postPath);
            postWriteStream.write(post.contents);
            postWriteStream.on('error', function(error) {
              postWriteStream.close();
              try {
                if (fs.existsSync(postPath)) {
                  fs.unlinkSync(postPath);
                }
              } catch (error1) {}
              console.log(error);
            })

            var postMetaWriteStream = fs.createWriteStream(postMetaPath);
            postMetaWriteStream.write(JSON.stringify(post));
            postMetaWriteStream.end();
            postMetaWriteStream.on('finish', function() {
                _this.emitter.emit('did-saved-to-file', {post, sync})
            })
            postMetaWriteStream.on('error', function(error) {
              postMetaWriteStream.close();
              try {
                if (fs.existsSync(postMetaPath)) {
                  fs.unlinkSync(postMetaPath);
                }
              } catch (error1) {}
              console.log(error);
            });
          }
        };
      })(this))
    }

    PostManager.prototype.emitPostEvent = function (eventName, post, error) {
      return this.emitter.emit(eventName, {
        post: post,
        error: error
      });
    };

    PostManager.prototype.on = function (selectors, callback) {
      var i, len, ref1, selector, subscriptions;
      subscriptions = new CompositeDisposable;
      ref1 = selectors.split(' ');
      for (i = 0, len = ref1.length; i < len; i++) {
        selector = ref1[i];
        subscriptions.add(this.emitter.on(selector, callback));
      }

      return subscriptions;
    };

    PostManager.prototype.getPublishPostURL = function() {
      return this.getClient().getApiURL() + '/publish/post';
    }

    PostManager.prototype.getAutosavePostURL = function() {
      return this.getClient().getApiURL() + '/publish/post/autosave';
    },


    PostManager.prototype.save = function(post) {
       if (typeof post.slug !== 'undefined') {
          switch (post.status) {
            case postStatusesInstance.STATUS_PUBLIC:
                return this.publish(post);
              break;
            case postStatusesInstance.STATUS_DRAFT_PUBLIC:
                return this.draft(post, true);
              break;
            case postStatusesInstance.STATUS_DRAFT:
                return this.draft(post, false);
              break;
          }
       }
    }


    PostManager.prototype.publishDraft = function(post) {
      var _this = this;
      _this.emitPostEvent('post-publishing', post);

      _.map(post, function(value, key) {
        if(!post[key]) {
          delete post[key];
        }
      });
      var publishDraftPromise = new Promise(function(resolve) {
        var url;
        url = API_URL + '/publish/'+post.slug+'/publish';
        return $.ajax(url, {
          beforeSend: function(xhr, settings) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + _this.getClient().getApiKey());
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('X-Http-Source', 'atom');
          },
          data: post,
          method: 'PUT',
          success: function(response) {
            return resolve(response);
          },
          error: (function(_resolve){
            return function(response) {
              _this.handleErrorResponse(response, _resolve);
            }
          })(resolve)
        });
      });

      return publishDraftPromise;
    }

    PostManager.prototype.publish = function(post) {
      var _this = this;
      post.publicDraft = true;
      post.status = postStatusesInstance.STATUS_PUBLIC;

      _this.emitPostEvent('post-publishing', post);
      _.map(post, function(value, key) {
        if(!post[key]) {
          delete post[key];
        }
      });
      var publishPromise = new Promise(function(resolve) {
        var url;
        url = _this.getPublishPostURL();
        return $.ajax(url, {
          beforeSend: function(xhr, settings) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + _this.getClient().getApiKey());
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('X-Http-Source', 'atom');
          },
          data: post,
          method: 'POST',
          success: function(response) {
            return resolve(response);
          },
          error: (function(_resolve){
            return function(response) {
              _this.handleErrorResponse(response, _resolve);
            }
          })(resolve)
        });
      });

      return publishPromise;
    }

    PostManager.prototype.onDidSavedToFile = function(callback) {
      return this.emitter.on('did-saved-to-file', callback);
    }

    PostManager.prototype.draft = function(post, isDraftPublic = false) {
      var _this = this;
      post.publicDraft = isDraftPublic ? 1 : 0;
      _this.emitPostEvent('post-saving-as-draft' + (isDraftPublic ? '-public' : ''), post);
      _.map(post, function(value, key) {
        if(!post[key]) {
          delete post[key];
        }
      });
      var draftPromise = new Promise(function(resolve) {
        var url;
        url = _this.getAutosavePostURL();
        return $.ajax(url, {
          beforeSend: function(xhr, settings) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + _this.getClient().getApiKey());
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('X-Http-Source', 'atom');
          },
          data: post,
          method: 'POST',
          success: function(response) {
            return resolve(response);
          },
          error: (function(_resolve){
            return function(response) {
              _this.emitPostEvent('post-save-as-draft' + (isDraftPublic ? '-public' : '') + '-failed', post);
              _this.handleErrorResponse(response, _resolve);
            }
          })(resolve)
        });
      });

      return draftPromise;
    }

    PostManager.prototype.handleErrorResponse = (function(_this){
      return function(response, callback) {
        if (response.status !== 200 && typeof response.responseJSON !== 'undefined') {
          this.emitPostEvent('post-publish-failed', {message:response.responseJSON});
          return callback({
            success: false,
            errors: response.responseJSON
          });
        }
        this.emitPostEvent('post-publish-failed', {message:response.statusText});
        return callback({
          success: false,
          error: response.statusText
        });
      }
    })(this)


    return PostManager;

  })();

  createJsonParseError = function (message, parseError, stdout) {
    var error;
    error = new Error(message);
    error.stdout = '';
    error.stderr = parseError.message + ': ' + stdout;
    return error;
  };

  createProcessError = function (message, processError) {
    var error;
    error = new Error(message);
    error.stdout = '';
    error.stderr = processError.message;
    return error;
  };

  handleProcessErrors = function (apmProcess, message, callback) {
    return apmProcess.onWillThrowError(function (arg) {
      var error, handle;
      error = arg.error, handle = arg.handle;
      handle();
      return callback(createProcessError(message, error));
    });
  };

}).call(this);
