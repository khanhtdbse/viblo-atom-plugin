(function() {
  var $$,
  CollapsibleSectionPanel,
  CompositeDisposable,
  ErrorView,
  PostsPanel,
  List,
  ListView,
  PostCard,
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

  PostCard = require('./post-card');

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
                outlet: 'publicSection',
                "class": 'sub-section public-posts'
              }, function() {
                _this.h3({
                  outlet: 'publicPostsHeader',
                  "class": 'sub-section-heading icon icon-pencil'
                }, function() {
                  _this.text('Public Posts');
                  return _this.span({
                    outlet: 'publicCount',
                    "class": 'section-heading-count badge badge-flexible'
                  }, '…');
                });
                return _this.div({
                  outlet: 'publicPosts',
                  "class": 'container posts-container'
                }, function() {
                  return _this.div({
                    "class": 'alert alert-info loading-area icon icon-hourglass'
                  }, "Loading posts…");
                });
              });

              _this.section({
                outlet: 'draftSection',
                "class": 'sub-section draft-posts'
              }, function() {
                _this.h3({
                  outlet: 'draftPostsHeader',
                  "class": 'sub-section-heading icon icon-pencil'
                }, function() {
                  _this.text('Draft Posts');
                  return _this.span({
                    outlet: 'draftCount',
                    "class": 'section-heading-count badge badge-flexible'
                  }, '…');
                });
                return _this.div({
                  outlet: 'draftPosts',
                  "class": 'container posts-container'
                }, function() {
                  return _this.div({
                    "class": 'alert alert-info loading-area icon icon-hourglass'
                  }, "Loading posts…");
                });
              });

              _this.section({
                outlet: 'draftPublicSection',
                "class": 'sub-section draft-public-posts'
              }, function() {
                _this.h3({
                  outlet: 'draftPublicPostsHeader',
                  "class": 'sub-section-heading icon icon-pencil'
                }, function() {
                  _this.text('Public Draft Posts');
                  return _this.span({
                    outlet: 'draftPublicCount',
                    "class": 'section-heading-count badge badge-flexible'
                  }, '…');
                });
                return _this.div({
                  outlet: 'draftPublicPosts',
                  "class": 'container posts-container'
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
      this.posts = {};
      this.posts.public = [];
      this.posts.draft = [];
      this.posts.draft_public = [];
      PostsPanel.__super__.initialize.apply(this, arguments);
      this.items = {
        public: new List('slug'),
        draft: new List('slug'),
        draft_public: new List('slug')
      };
      this.itemViews = {
        public: new ListView(this.items.public, this.publicPosts, this.createPostCard),
        draft: new ListView(this.items.draft, this.draftPosts, this.createPostCard),
        draft_public: new ListView(this.items.draft_public, this.draftPublicPosts, this.createPostCard)
      };
      this.filterEditor.getModel().onDidStopChanging((function(_this) {
        return function() {
          return _this.matchPosts();
        };
      })(this));

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
      this.loadPosts();
    };

    PostsPanel.prototype.focus = function() {
      return this.filterEditor.focus();
    };

    PostsPanel.prototype.dispose = function() {
      return this.postManagerSubscriptions.dispose();
    };

    PostsPanel.prototype.resetSectionHasItems = function() {
      return this.resetCollapsibleSections([this.publicPostsHeader, this.draftPostsHeader, this.draftPublicPostsHeader]);
    };

    PostsPanel.prototype.updateUnfilteredSectionCounts = function() {
      this.updateSectionCount(this.publicPostsHeader, this.publicCount, this.posts.public.length);
      this.updateSectionCount(this.draftPostsHeader, this.draftCount, this.posts.draft.length);
      this.updateSectionCount(this.draftPublicPostsHeader, this.draftPublicCount, this.posts.draft_public.length);
      return this.totalPosts.text(this.posts.public.length + this.posts.draft.length + this.posts.draft_public.length);
    };

    PostsPanel.prototype.updateFilteredSectionCounts = function() {
      var public, draft, draft_public, shownPosts, totalPosts;

      public = this.notHiddenCardsLength(this.publicPosts);
      this.updateSectionCount(this.publicPostsHeader, this.publicCount, public, this.posts.public.length);

      draft = this.notHiddenCardsLength(this.draftPosts);
      this.updateSectionCount(this.draftPostsHeader, this.draftCount, draft, this.posts.draft.length);

      draft_public = this.notHiddenCardsLength(this.draftPublicPosts);
      this.updateSectionCount(this.draftPublicPostsHeader, this.draftPublicCount, draft_public, this.posts.draft_public.length);

      shownPosts = public + draft + draft_public;
      totalPosts = this.posts.public.length + this.posts.draft.length + this.posts.draft_public.length;
      return this.totalPosts.text(shownPosts + "/" + totalPosts);
    };

    PostsPanel.prototype.loadPosts = function() {
      this.postManager.getPublished().then((function(_this) {
        return function(posts) {
          var data = posts.data.length > 0 ? posts.data : [];
          if (data.length == 0) {
            return _this.publicSection.hide();
          }
          _this.publicSection.show();
          _this.posts.public = data;
          _this.publicPosts.find('.alert.loading-area').remove();
          _this.items.public.setItems(data);
          _this.updateSectionCount(_this.publicPostsHeader, _this.publicCount, _this.posts.public.length);
          _this.updateUnfilteredSectionCounts();
        };
      })(this))["catch"](this.catchLoadingError);

      this.postManager.getDrafts().then((function(_this) {
        return function(posts) {
          var data = posts.data.length > 0 ? posts.data : [];
          if (data.length == 0) {
            return _this.draftSection.hide();
          }
          _this.draftSection.show();
          _this.posts.draft = data;
          _this.draftPosts.find('.alert.loading-area').remove();
          _this.items.draft.setItems(data);
          _this.updateSectionCount(_this.draftPostsHeader, _this.draftCount, _this.posts.draft.length);
          _this.updateUnfilteredSectionCounts();
        };
      })(this))["catch"](this.catchLoadingError);

      this.postManager.getDraftPublished().then((function(_this) {
        return function(posts) {
          var data = posts.data.length > 0 ? posts.data : [];
          if (data.length == 0) {
            return _this.draftPublicSection.hide();
          }
          _this.draftPublicSection.show();
          _this.posts.draft_public = data;
          _this.draftPublicPosts.find('.alert.loading-area').remove();
          _this.items.draft_public.setItems(data);
          _this.updateSectionCount(_this.draftPublicPostsHeader, _this.draftPublicCount, _this.posts.draft_public.length);
          _this.updateUnfilteredSectionCounts();
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


    PostsPanel.prototype.matchPosts = function() {
      var filterText;
      filterText = this.filterEditor.getModel().getText();
      return this.filterPostsListByText(filterText);
    };

    PostsPanel.prototype.filterPostsListByText = function(text) {
      var activeViews, allViews, i, j, k, len, len1, len2, ref2, view;
      console.log(this.posts);
      if (!this.posts) {
        return;
      }
      ref2 = ['public', 'draft', 'draft_public'];
      for (i = 0, len = ref2.length; i < len; i++) {
        postStatus = ref2[i];
        allViews = this.itemViews[postStatus].getViews();
        activeViews = this.itemViews[postStatus].filterViews(function(post) {
          var filterText, owner, ref3;
          if (text === '') {
            return true;
          }
          filterText = post.title;
          return fuzzaldrin.score(filterText, text) > 0;
        });
        for (j = 0, len1 = allViews.length; j < len1; j++) {
          view = allViews[j];
          if (view) {
            view.find('.post-card').hide().addClass('hidden');
          }
        }
        for (k = 0, len2 = activeViews.length; k < len2; k++) {
          view = activeViews[k];
          if (view) {
            view.find('.post-card').show().removeClass('hidden');
          }
        }
      }
      return this.updateSectionCounts();
    };

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
      postRow.append(postView);
      return postRow;
    };


    return PostsPanel;

  })(CollapsibleSectionPanel);

}).call(this);
