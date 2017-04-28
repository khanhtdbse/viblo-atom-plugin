(function() {
  var Emitter, PublishForm, View, TextEditorView, ref, $, $$, shell, markdownIt, cheerio,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Emitter = require('atom').Emitter, ref = require('atom-space-pen-views'), $$ = ref.$$, TextEditorView = ref.TextEditorView, View = ref.View;
  shell = require('electron').shell;
  $ = require('jquery');
  var _ = require('underscore-plus');
  var PostManager = require('./post-manager');

  var capitalizeFirstLetter = function(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }

  var fs = require('fs-plus');
  var vibloPostsStorageDir = fs.getHomeDirectory() + '/.viblo/';

  var isVibloFile = function(path) {
    if (!path) {
      return;
    }
    return path.indexOf(vibloPostsStorageDir) === 0;
  }

  module.exports = PublishForm = (function(superClass) {

    PublishForm.provider = null;

    PublishForm.prototype.provide = function() {
      return [
        require('./category-provider')
      ]
    };

    extend(PublishForm, superClass);

    function PublishForm(settingsView) {
      if (settingsView && settingsView.postManager) {
        this.postManager = settingsView.postManager;
      } else {
        this.postManager = new PostManager();
        this.postManager.on('post-published post-saved-as-draft post-saved-as-draft-public', (function(_this) {
          return function(result) {
              if (!result.error) {
                if (!isVibloFile(atom.workspace.getActivePaneItem().getURI())) {
                  atom.workspace.getActivePane().destroyActiveItem();
                  atom.commands.dispatch(atom.views.getView(atom.workspace.getActivePane()), 'viblo:posts');
                }
              }
            };
        })(this))
      }
      this.titleTextEditor = null;
      return PublishForm.__super__.constructor.apply(this, arguments);
    }

    PublishForm.prototype.initialize = function() {
      this.post = undefined;
      this.handleButtonEvents();
    };

    PublishForm.prototype.setData = function(post) {
      this.post = post;
      if (this.post && this.post.category_id) {
        this.categorySelector.val(this.post.category_id);
      }
      if (this.post && this.post.locale_code) {
        this.languageSelector.val(this.post.locale_code);
      }
      if (this.post && typeof this.post.tags !== 'undefined') {
        if (this.post.tags instanceof Array) {
          var tags = [];
          this.post.tags.forEach(function(tag, index) {
              return tags.push(capitalizeFirstLetter(tag.name));
          })
          this.tagsInput.getModel().setText(tags.join(', '));
        } else {
          this.tagsInput.getModel().setText(this.post.tags);
        }
      } else {
        this.tagsInput.getModel().setText('');
      }
      return this;
    }

    PublishForm.prototype.handleButtonEvents = function() {
      this.tagExample.on('click', (function(_this) {
        return function(event) {
          event.preventDefault();
          _this.tagsInput.getModel().setText(_this.tagExample.text());
          return false;
        };
      })(this));

      this.closeButton.on('click', (function(_this) {
        return function() {
          return _this.hide();
        };
      })(this));

      this.publishButton.on('click', (function(_this) {
        return function() {
          $('.body').addClass('request-loading');
          var post = {
            title:_this.titleInput.model.getText(),
            contents: _this.post.contents,
            locale_code: _this.languageSelector.val(),
            tags: _this.tagsInput.model.getText(),
            category_id: _this.categorySelector.val()
          };
          var promise = null;
          if (_this.post && typeof _this.post.id !== 'undefined' && _this.post.id > 0) {
            post = $.extend(_this.post, post);
            _.map(post, function(value, key) {
              if(!post[key]) {
                delete post[key];
              }
            });
            promise = _this.postManager.publish(post);
          }
          promise.then((function(_that){
            return function(result) {
              _that.hide();
              $('.body').removeClass('request-loading');
              _that.contents = '';
              _that.titleInput.model.setText('');
              if (result.success) {
                var notification = atom.notifications.addSuccess('Congratulations!', {
                  description: 'Post published',
                  detail: "Your post was published successfully",
                  dismissable: true,
                  buttons: [
                    {
                      text: 'Check your new post on Viblo',
                      onDidClick: function() {
                        _this.postManager.openPostOnViblo(typeof post.id !== 'undefined' ? post : result.data);
                        return notification.dismiss();
                      }
                    }
                  ]
                });
                _this.postManager.emitPostEvent('post-published', $.extend(_this.post, result.data));
              } else {
                var errorMessage = '';
                if (result.errors) {
                  var errors = result.errors;
                  for (var errorName in errors) {
                    if( errors.hasOwnProperty(errorName) ) {
                      errorMessage += errors[errorName].slice(0,1)+"\n";
                    }
                  }
                } else {
                  errorMessage = result.statusText;
                }
                var notification = atom.notifications.addWarning('Validation errors', {
                  description: 'Please check validation messages above',
                  detail: errorMessage,
                  dismissable: true,
                  buttons: [
                    {
                      text: 'OK, I understand',
                      onDidClick: function() {
                        return notification.dismiss();
                      }
                    }
                  ]
                });
                _this.postManager.emitPostEvent('post-publish-failed', _this.post);
              }
            };
          })(_this));
        };
      })(this));

      this.draftButton.on('click', (function(_this) {
        return function() {
          $('.body').addClass('request-loading');
          var promise = null;
          var post = {
            title:_this.titleInput.model.getText(),
            contents: _this.post.contents,
            locale_code: _this.languageSelector.val(),
            tags: _this.tagsInput.model.getText(),
            category_id: _this.categorySelector.val()
          };
          if (_this.post && typeof _this.post.id !== 'undefined' && _this.post.id > 0) {
            post = $.extend(_this.post, post);
            _.map(post, function(value, key) {
              if(!post[key]) {
                delete post[key];
              }
            });
            promise = _this.postManager.draft(post);
          }
          promise.then((function(_that){
            return function(result) {
              $('.body').removeClass('request-loading');
              _that.contents = '';
              _that.titleInput.model.setText('');
              _that.hide();
              if (result.success) {
                var notification = atom.notifications.addSuccess('Successfully saved', {
                  description: 'Post saved as draft',
                  detail: "",
                  dismissable: true
                });
                _this.postManager.emitPostEvent('post-saved-as-draft', _this.post);
              } else {
                var errorMessage = '';
                if (result.errors) {
                  var errors = result.errors;
                  for (var errorName in errors) {
                    if( errors.hasOwnProperty(errorName) ) {
                      errorMessage += errors[errorName].slice(0,1)+"\n";
                    }
                  }
                  var notification = atom.notifications.addInfo('Validation errors', {
                    description: 'Please check validation messages above',
                    detail: errorMessage,
                    dismissable: true,
                    buttons: [
                      {
                        text: 'OK, I understand',
                        onDidClick: function() {
                          return notification.dismiss();
                        }
                      }
                    ]
                  });
                  _this.postManager.emitPostEvent('post-save-as-draft-failed', _this.post);
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
                }
              }
            };
          })(_this));
        };
      })(this));
    }

    PublishForm.prototype.focus = function() {
      this.titleInput.focus();
    }

    PublishForm.content = function(arg) {
      return this.div({
        tabindex: -1,
        'class' : 'body',
        outlet: 'publishForm'
      }, (function(_this) {
        return function() {
          _this.h1({
            'class': 'heading-title'
          }, 'Publishing post');

          _this.div({
            'class' : 'submit-loader'
          }, function() {
            _this.span({
              'class' : 'loading loading-spinner-large inline-block'
            })
            _this.h4({}, 'publishing in progress...')
          })

          return _this.div({
            'class': 'content'
          }, function() {
            _this.div({
              'class' : 'row'
            }, function() {
              _this.div({
                "class": 'editor-container'
              }, function() {
                _this.label({
                  'for': 'post-title',
                  'class' : 'control-label'
                }, function() {
                  _this.raw('Title')
                });
                var titleTextEditor = new TextEditorView({
                  'id' : 'post-title',
                  mini: true
                });
                return _this.subview('titleInput', titleTextEditor);
              });
            });

            _this.div({
              'class' : 'row'
            }, function() {
              _this.div({
                "class": 'editor-container'
              }, function() {
                _this.label({
                  'for': 'post-tags',
                  'class' : 'control-label'
                }, function() {
                  _this.raw('Tags (e.g. ');
                  // PHP, Javascript, CSS
                  _this.a({
                    class: 'tag-example',
                    outlet: 'tagExample'
                  }, 'PHP, Javascript, CSS');
                  _this.raw(')');
                });

                var tagsTextEditor = new TextEditorView({
                  'id' : 'post-tags',
                  mini: true
                });
                return _this.subview('tagsInput', tagsTextEditor);
              });
            });

            _this.div({
              'class' : 'row'
            }, function() {
              _this.label({
                'class': 'control-label',
                'for':'category'
              }, function() {
                _this.span({}, 'Category');
                return _this.select({
                    'id': 'category',
                    "class": 'form-control',
                    outlet: 'categorySelector'
                  }, (function(_that) {
                    return function() {
                      var options = require('./post-category');
                      var i, len, option, results;
                      results = [];
                      for (i = 0, len = options.length; i < len; i++) {
                        option = options[i];
                        if (option.hasOwnProperty('value')) {
                          results.push(_that.option({
                            value: option.value
                          }, option.description));
                        } else {
                          results.push(_that.option({
                            value: option
                          }, option));
                        }
                      }
                      return results;
                    };
                })(_this));
            });
          });

            _this.div({
              'class' : 'row'
            }, function() {
              _this.label({
                'class': 'control-label',
                'for':'language'
              }, function() {
                _this.span({}, 'Post language');
                return _this.select({
                    'id': 'language',
                    "class": 'form-control',
                    outlet: 'languageSelector'
                  }, (function(_that) {
                    return function() {
                      var options = [
                        {value:'vi', description: 'Vietnamese'},
                        {value:'en', description: 'English'},
                        {value:'ja', description: 'Japanese'}
                      ];
                      var i, len, option, results;
                      results = [];
                      for (i = 0, len = options.length; i < len; i++) {
                        option = options[i];
                        if (option.hasOwnProperty('value')) {
                          results.push(_that.option({
                            value: option.value
                          }, option.description));
                        } else {
                          results.push(_that.option({
                            value: option
                          }, option));
                        }
                      }
                      return results;
                    };
                })(_this));
            });
          });
          return _this.div({
            'class':'row'
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
                    "class": 'btn icon icon-book publish-button',
                    outlet: 'publishButton'
                  }, 'Save as Public Post');
                  _this.button({
                    type: 'button',
                    "class": 'btn icon icon-file draft-button',
                    outlet: 'draftButton'
                  }, 'Save as Draft Post');
                  return _this.button({
                    'class' : 'btn icon icon-circle-slash btn-cancel',
                    outlet: 'closeButton'
                  }, 'Cancel');
                });
              });
            })
          })
        }
      })(this));
    };

    PublishForm.prototype.show = function() {

      this.emitter = new Emitter;
      var manager = this.postManager;
      if (!manager.getClient().getApiKey()) {
        var notification = atom.notifications.addWarning('Viblo API Warning', {
          description: 'Please refer to Viblo Social platform for registering new API key to publish your articles',
          detail: "Token is invalid",
          dismissable: true,
          buttons: [
            {
              text: 'Go to Viblo',
              onDidClick: (function(_manager){
                return function() {
                  // atom.commands.dispatch(atom.views.getView(atom.workspace), 'settings-view:view-installed-packages');
                  var client = _manager.getClient();
                  shell.openExternal(client.getServerHost());
                  return notification.dismiss();
                }
              })(manager)
            }
          ]
        });

        return notification;
      }

      if (this.modalPanel == null) {
        this.modalPanel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.modalPanel.show();
      this.titleInput.model.setText(this.post.title);
      return this.titleInput.focus();
    };

    PublishForm.prototype.hide = function() {
      return this.modalPanel.hide();
    };

    PublishForm.prototype.toggle = function() {
      return this.modalPanel.visible ? this.hide() : this.show();
    };

    PublishForm.prototype.destroy = function() {
      var ref;
      if ((ref = this.modalPanel) != null) {
        ref.destroy();
      }

      this.modalPanel = null;
      return this.emitter.dispose();
    };

    return PublishForm;

  })(View);

}).call(this);
