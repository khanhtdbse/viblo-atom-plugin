(function() {
  var $$,
  CollapsibleSectionPanel,
  CompositeDisposable,
  ErrorView,
  PostsPanel,
  List,
  ListView,
  PackageCard,
  TextEditorView,
  fuzzaldrin,
  ownerFromRepository,
  packageComparatorAscending,
  ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $$ = ref.$$, TextEditorView = ref.TextEditorView;

  CompositeDisposable = require('atom').CompositeDisposable;

  fuzzaldrin = require('fuzzaldrin');

  CollapsibleSectionPanel = require('./collapsible-section-panel');

  PackageCard = require('./post-card');

  ErrorView = require('./error-view');

  List = require('./list');

  ListView = require('./list-view');

  module.exports = PostsPanel = (function(superClass) {
    extend(PostsPanel, superClass);

    function PostsPanel() {
      this.createPostCard = bind(this.createPostCard, this);
      return PostsPanel.__super__.constructor.apply(this, arguments);
    }

    PostsPanel.loadPostsDelay = 300;

    PostsPanel.content = function() {
      return this.div({
        "class": 'panels-item'
      }, (function(_this) {
        return function() {
          return _this.section({
            "class": 'section'
          }, function() {
            return _this.div({
              "class": 'section-container'
            }, function() {
              _this.div({
                "class": 'section-heading icon icon-package'
              }, function() {
                _this.text('My Posts');
                return _this.span({
                  outlet: 'totalPosts',
                  "class": 'section-heading-count badge badge-flexible'
                }, '…');
              });
              _this.div({
                "class": 'editor-container'
              }, function() {
                return _this.subview('filterEditor', new TextEditorView({
                  mini: true,
                  placeholderText: 'Filter posts by title'
                }));
              });
              _this.div({
                outlet: 'updateErrors'
              });
              _this.section({
                outlet: 'publishedSection',
                "class": 'sub-section published-packages'
              }, function() {
                _this.h3({
                  outlet: 'publishedPostsHeader',
                  "class": 'sub-section-heading icon icon-package'
                }, function() {
                  _this.text('Published Posts');
                  return _this.span({
                    outlet: 'publishedCount',
                    "class": 'section-heading-count badge badge-flexible'
                  }, '…');
                });
                return _this.div({
                  outlet: 'publishedPosts',
                  "class": 'container package-container'
                }, function() {
                  return _this.div({
                    "class": 'alert alert-info loading-area icon icon-hourglass'
                  }, "Loading posts…");
                });
              });
            });
          });
        };
      })(this));
    };

    PostsPanel.prototype.initialize = function(postManager) {
      this.postManager = postManager;
      PostsPanel.__super__.initialize.apply(this, arguments);
      this.items = {
        published: new List('name'),
        drafts: new List('name'),
        draftPublic: new List('name')
      };
      this.itemViews = {
        published: new ListView(this.items.published, this.publichedPosts, this.createPostCard),
        drafts: new ListView(this.items.drafts, this.draftPosts, this.createPostCard),
        draftPublic: new ListView(this.items.draftPublic, this.draftPublicPosts, this.createPostCard),
      };
      // this.filterEditor.getModel().onDidStopChanging((function(_this) {
      //   return function() {
      //     return _this.matchPackages();
      //   };
      // })(this));

      this.postManagerSubscriptions = new CompositeDisposable;
      this.postManagerSubscriptions.add(this.postManager.on('post-publish-fail post-saving-fail', (function(_this) {
        return function(arg) {
          var error, post;
          post = arg.post, error = arg.error;
          return _this.updateErrors.append(new ErrorView(_this.postManager, error));
        };
      })(this)));

      loadPostsTimeout = null;
      this.postManagerSubscriptions.add(this.postManager.on('post-published post-saved-as-draft post-saved-as-draft-public', (function(_this) {
        return function() {
          clearTimeout(loadPostsTimeout);
          return loadPostsTimeout = setTimeout(function() {
            return _this.loadPosts();
          }, PostsPanel.loadPostsDelay);
        };
      })(this)));
      this.handleEvents();
      return this.loadPosts();
    };

    PostsPanel.prototype.focus = function() {
      return this.filterEditor.focus();
    };

    PostsPanel.prototype.dispose = function() {
      return this.postManagerSubscriptions.dispose();
    };

    PostsPanel.prototype.loadPosts = function() {
      var myPosts;
      myPosts = {};
      this.postManager.getPublished().then((function(_this) {
        return function(posts) {
          _this.published.find('.alert.loading-area').remove();
          _this.items.published.setItems(_this.posts.published);
          // return _this.matchPackages();
        };
      })(this))["catch"](this.catchLoadingError);
    };

    PostsPanel.prototype.catchLoadingError = (function(_this) {
      return function(error) {
        console.error(error.message, error.stack);
        _this.loadingMessage.hide();
        return _this.updateErrors.append(new ErrorView(_this.postManager, error));
      };
    })(this)

    PostsPanel.prototype.createPostCard = function(post) {
      var postView, postRow;
      postRow = $$(function() {
        return this.div({
          "class": 'row'
        });
      });
      postView = new PostCard(post, this.postManager, {
        back: 'Posts'
      });
      packageRow.append(packView);
      return packageRow;
    };


    return PostsPanel;

  })(CollapsibleSectionPanel);

}).call(this);
