(function(){

  var locationUri = 'atom://viblo',
    uriRegex = /viblo\/([a-z]+)\/?([a-zA-Z0-9_-]+)?/i,
    editPostRegex = /viblo\/edit\/?([a-zA-Z0-9_-]+)?/i,
    settingsViewInstance,
    VibloPluginSettingsView,
    PostManager,
    postManagerInstance,
    _disposables,
    path,
    url,
    fs,
    CompositeDisposable,
    markdownIt,
    cheerio,
    FileIcons,
    ToolBarManager,
    ToolBarView,
    toolBarView,
    TextEditor;


  $ = require('jquery');
  path = require('path');
  fs = require('fs-plus');
  url = require('url');
  CompositeDisposable = require('atom').CompositeDisposable;
  Disposable = require('atom').Disposable;
  TextEditor = require('atom').TextEditor;
  ToolBarManager = require('./toolbar/tool-bar-manager');
  ToolBarView = require('./toolbar/tool-bar-view');
  toolBarView = null;
  var VibloMarkdownPreviewView, fs, mathjaxHelper, renderer, url,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  PostManager = require('./post-manager');
  FileIcons = require('./file-icons');
  ToolBar = require('./toolbar');
  _disposables = new CompositeDisposable();
  postManagerInstance = null;
  VibloMarkdownPreviewView = null;
  renderer = null;

  var vibloPostsStorageDir = fs.getHomeDirectory() + '/.viblo/';

  isVibloFile = function(path) {
    if (!path) {
      return;
    }
    return path.indexOf(vibloPostsStorageDir) === 0;
  }

  openPanel = function(settingsViewInstance, panelName, uri) {
    var detail, match, options, panel;
    match = uriRegex.exec(uri);
    panel = match != null ? match[1] : void 0;
    detail = match != null ? match[2] : void 0;
    options = {
      uri: uri
    };
    if (panel === "settings" && (detail != null)) {
      panelName = detail;
      options.pack = {
        name: detail
      };
      if (atom.packages.getLoadedPackage(detail)) {
        options.back = 'settings';
      }
    }
    return settingsViewInstance.showPanel(panelName, options);
  };

  module.exports = {
    imageHelperView: null,
    toolBar: null,
    isVibloMarkdownPreviewView : function(object) {
      if (VibloMarkdownPreviewView == null) {
        VibloMarkdownPreviewView = require('./markdown/markdown-preview-view');
      }
      return object instanceof VibloMarkdownPreviewView;
    },

    createVibloMarkdownPreviewView: function(state) {
      if (state.editorId) {
        if (VibloMarkdownPreviewView == null) {
          VibloMarkdownPreviewView = require('./markdown/markdown-preview-view');
        }
        this.preview = new VibloMarkdownPreviewView(state);
        return this.preview;
      }
    },
    changeDocumentTitle: function(paneItem) {
      if (paneItem instanceof TextEditor) {
        var docTitle = this.getTextEditorTitle(paneItem, document.title);
        if (docTitle) {
          document.title = docTitle;
        }
      }
    },
    getTextEditorTitle: function(editor, originalTitle) {
      if (originalTitle == 'untitled' && editor.getPath()) {
        return path.basename(editor.getPath());
      }
      var post = this.loadVibloPost(editor.getPath());
      if (post && post.title) {
        return post.title;
      }
      return originalTitle;
    },

    prepareNewPostForPublish: function(editor) {
        var post = this.loadVibloPost(editor.getPath());
        var contents = editor.getText();
        if (typeof post.title === 'undefined') {
          var title = this.getTitleFromContent(contents);
          if (!title && editor.getPath()) {
            title = path.basename(editor.getPath().toLowerCase(), '.md');
          }
          post.title = title;
          }
        post.contents = contents;
        return post;
    },

    loadVibloPost: function(path) {
      if (!path || !isVibloFile(path)) {
        return {};
      }
      var postSlug = path.replace(vibloPostsStorageDir, '').replace('.md', '');
      var postMetaPath = vibloPostsStorageDir + postSlug + '.meta';
      if (fs.isFileSync(postMetaPath)) {
        var buffer = fs.readFileSync(postMetaPath);
        return JSON.parse(buffer.toString());
      }
    },

    getTitleFromContent: function(contents) {
      if (!contents.length) {
        return '';
      }
      if (markdownIt == null) {
        var MarkdownIt = require('markdown-it');
        markdownIt = new MarkdownIt();
      }
      var htmlContents = markdownIt.render(contents);
      var o;
      if (cheerio == null) {
        cheerio = require('cheerio');
      }
      o = cheerio.load('<div>'+htmlContents+'</div>');
      var title = o('h1').first().text();
      if (!title) {
        return '';
      }
      return title;
    },

    activate: function() {
      if (postManagerInstance == null) {
        postManagerInstance = new PostManager();
        postManagerInstance.on('post-saved-as-draft post-saved-as-draft-public post-published', (function(_this){
          return function(result) {
            if (!result.error && result.post) {
              postManagerInstance.savePostToFile(result.post, false);
              var editor = atom.workspace.getActiveTextEditor();
              editor.emitter.emit('did-change-title', result.post.title);
              _this.changeDocumentTitle(atom.workspace.getActivePaneItem());
            }
          };
        })(this));
      }

      toolBarView = new ToolBarView();

      var getTextEditorTitle = this.getTextEditorTitle.bind(this);
      _disposables.add(atom.workspace.observeTextEditors((function(_this){
        return function (editor) {
          var title = editor.getTitle();
          var longTitle = editor.getLongTitle();
          editor.getTitle = function () {
            return getTextEditorTitle(editor, title);
          }
          editor.getLongTitle = function () {
            return getTextEditorTitle(editor, longTitle);
          }

          if (isVibloFile(editor.getPath())) {
            _this.addBinding(editor);
            _disposables.add(postManagerInstance.onDidSavedToFile(function(results) {
              editor.emitter.emit('did-change-title', results.post.title);
              if (results.sync) {
                if (results.post.tags instanceof Array)  {
                  var tags = [];
                  results.post.tags.forEach(function(tag, index) {
                      return tags.push(tag.name);
                  })
                  results.post.tags = tags.join(', ');
                }
                var promise = postManagerInstance.save(results.post);
                promise.then((function(_that){
                  return function(result) {
                    if (result.data !== undefined) {
                      var notification = atom.notifications.addSuccess('Post saved', {});

                      setTimeout(function() {
                        notification.dismiss();
                      }, 5000);

                      settingsViewInstance.postManager.emitPostEvent('post-published', results.post);
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
                      postManagerInstance.emitPostEvent('post-publish-failed', results.post);
                    }
                  };
                })(_this));
              }
            }));

            _disposables.add(editor.onDidSave(function(event) {
              var post = _this.loadVibloPost(event.path);
              if (!post) {
                return;
              }
              post.contents = editor.getText();

              if (typeof post.title === 'undefined' || post.title.trim() === '') {
                var title = _this.getTitleFromContent(post.contents);
                if (title) {
                  post.title = title;
                }
              }
              postManagerInstance.savePostToFile(post);
            }));
          }

        }
      })(this)))

      atom.workspace.onDidChangeActivePaneItem((function(_this){
        return function(paneItem) {
            _this.changeDocumentTitle(paneItem);
        };
      })(this));

      /* MARKDOWN TOOLBAR// */
      _disposables.add(atom.workspace.onDidStopChangingActivePaneItem((function(_this) {
        return function(editor) {
          if (_this.toolBar && editor && typeof editor.getURI === "function") {
            const title = editor.getTitle();
            if (isVibloFile(editor.getURI()) || title.match(/\.md$/i)) {
              _this.toolBar.toolBarView.show()
            } else {
              _this.toolBar.toolBarView.hide()
            }
          }
        };
      })(this)));
      /* //MARKDOWN TOOLBAR */

      _disposables.add(atom.workspace.addOpener((function(_this) {
        return function(uri) {
          var match, panelName, postStatus, postSlug, editor,
              error, host, pathname, protocol, ref;
          try {
            ref = url.parse(uri), protocol = ref.protocol, host = ref.host, pathname = ref.pathname;
          } catch (error1) {
            error = error1;
            return;
          }
          try {
            if (pathname) {
              pathname = decodeURI(pathname);
            }
          } catch (error1) {
            error = error1;
            return;
          }
          if (protocol === 'viblo-markdown-preview:') {
            if (host === 'editor') {
              return _this.createVibloMarkdownPreviewView({
                editorId: pathname.substring(1)
              });
            }
            return _this.createVibloMarkdownPreviewView({
              filePath: pathname
            });
          }

          if (uri.startsWith(locationUri)) {
            if (settingsViewInstance == null) {
              settingsViewInstance = _this.createSettingsView({
                uri: uri
              });
            }
            if (match = uriRegex.exec(uri)) {
              panelName = match[1];
              panelName = panelName[0].toUpperCase() + panelName.slice(1);
              openPanel(settingsViewInstance, panelName, uri);
            }
            return settingsViewInstance;
          }
        };
      })(this)));

      var publishFromFileTreeCb = (function(_this) {
          return function(arg) {
            var editor, filePath, i, len, ref, target;
            target = arg.target;
            filePath = target.dataset.path;
            if (!filePath) {
              return;
            }
            ref = atom.workspace.getTextEditors();
            for (i = 0, len = ref.length; i < len; i++) {
              editor = ref[i];
              if (!(editor.getPath() === filePath)) {
                continue;
              }
              var post = _this.loadVibloPost(editor.getPath());
              if (!post) {
                return;
              }
              _this.showPublishForm(post);
              return;
            }
          };
      })(this);

      var publishFromEditor = (function(_this) {
          return function() {
            var editor;
            editor = atom.workspace.getActiveTextEditor();
            if (editor == null) {
              return;
            }
            var post = _this.loadVibloPost(editor.getPath());
            if (!post) {
              post =_this.prepareNewPostForPublish(editor);
            } else {
              post = $.extend(post, {
                title: typeof post.title !== 'undefined' ? post.title : _this.getTitleFromContent(editor.getText()),
                contents: editor.getText()
              });
            }
            _this.showPublishForm(post);
          };
      })(this);

      var publishFromMarkdownPreview = (function(_this) {
          return function() {
            var contents, file, activePane, buffer;
            activePane = atom.workspace.getActivePaneItem();
            file = activePane.file;
            buffer = activePane.buffer;
            if(file == null) {
              if (buffer == null) {
                return;
              }
              contents = buffer.file.cachedContents;
            } else {
              contents = file.cachedContents;
            }

            if (!contents) {
              return;
            }
          };
      })(this);

      atom.commands.add('atom-workspace', 'viblo-view:toggle-preview', (function(_this) {
        return function() {
          return _this.togglePreview();
        };
      })(this));

      var previewPost = this.previewPost.bind(this);

      atom.commands.add("atom-workspace atom-text-editor[data-grammar*=\"gfm\"]", 'viblo-view:image-helper', (function(_this) {
        return function() {
          return _this.startImageHelper();
        };
      })(this));
      atom.commands.add("atom-workspace atom-text-editor[data-grammar*=\"gfm\"]", 'viblo-view:toggle', publishFromEditor);
      atom.commands.add("atom-workspace atom-text-editor[data-grammar*=\"gfm\"]", 'viblo-view:preview-post', previewPost);
      atom.commands.add('.tree-view .file .name[data-name$=\\.md]', 'viblo-view:preview-post', previewPost);
      atom.commands.add('.tree-view .file .name[data-name$=\\.md]', 'viblo-view:toggle', publishFromFileTreeCb);
      atom.commands.add('.markdown-preview', 'viblo-view:toggle', publishFromMarkdownPreview);

      atom.commands.add('atom-workspace', 'viblo:settings', function() {
          return atom.workspace.open(locationUri + "/settings");
      });

      atom.commands.add('atom-workspace', 'viblo:posts', function() {
          return atom.workspace.open(locationUri + "/posts");
      });

      atom.commands.add('atom-workspace', 'viblo:about', function() {
          return atom.workspace.open(locationUri + "/about");
      });

    },

    provideFileIcons: function() {
      return FileIcons.getService();
    },

    consumeToolBar: function() {
      this.toolBar = new ToolBarManager('viblo-markdown-tool-bar', toolBarView)
      this.toolBar.onDidDestroy((function(_this) {
        return function() {
          return _this.toolBar = null;
        };
      })(this));
      return this.toolBar.addButtons();
    },

    startImageHelper: function() {
      var ImageHelperView, editor;
      ImageHelperView = require('./markdown/image-helper-view');
      editor = atom.workspace.getActiveTextEditor();
      if (editor && editor.buffer) {
        if (this.imageHelperView == null) {
          this.imageHelperView = new ImageHelperView();
        }
        return this.imageHelperView.display(editor);
      } else {
        return atom.notifications.addError('Failed to open Image Helper panel');
      }
    },

    togglePreview: function() {
      var editor, grammars, ref1;
      if (this.isVibloMarkdownPreviewView(atom.workspace.getActivePaneItem())) {
        atom.workspace.destroyActivePaneItem();
        return;
      }
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return;
      }
      grammars = ['source.gfm', 'text.md'];
      if (ref1 = editor.getGrammar().scopeName, indexOf.call(grammars, ref1) < 0) {
        return;
      }
      if (!this.removePreviewForEditor(editor)) {
        return this.addPreviewForEditor(editor);
      }
    },
    uriForEditor: function(editor) {
      return "viblo-markdown-preview://editor/" + editor.id;
    },
    removePreviewForEditor: function(editor) {
      var preview, previewPane, uri;
      uri = this.uriForEditor(editor);
      previewPane = atom.workspace.paneForURI(uri);
      if (previewPane != null) {
        preview = previewPane.itemForURI(uri);
        if (preview !== previewPane.getActiveItem()) {
          previewPane.activateItem(preview);
          return false;
        }
        previewPane.destroyItem(preview);
        return true;
      } else {
        return false;
      }
    },
    addPreviewForEditor: function(editor) {
      var options, previousActivePane, uri;
      uri = this.uriForEditor(editor);
      previousActivePane = atom.workspace.getActivePane();
      options = {
        searchAllPanes: true
      };
      options.split = 'right';
      return atom.workspace.open(uri, options).then((function(_this){
        return function(VibloMarkdownPreviewView) {
          if (_this.isVibloMarkdownPreviewView(VibloMarkdownPreviewView)) {
            return previousActivePane.activate();
          }
        };
      })(this));
    },
    previewPost: function(arg) {
      var editor, filePath, i, len, ref;
      if (typeof arg.currentTarget.component !== 'undefined') {
        filePath = arg.currentTarget.component.editor.getPath();
      } else if (typeof arg.target.dataset.path !== 'undefined') {
        filePath = arg.target.dataset.path;
      }
      if (!filePath) {
        return;
      }
      ref = atom.workspace.getTextEditors();
      for (i = 0, len = ref.length; i < len; i++) {
        editor = ref[i];
        if (!(editor.getPath() === filePath)) {
          continue;
        }
        this.addPreviewForEditor(editor);
        return;
      }
      return atom.workspace.open("viblo-markdown-preview://" + (encodeURI(filePath)), {
        searchAllPanes: true
      });
    },
    addBinding: function(editor) {
      if (this.bindings && this.bindings.dispose) {
        this.bindings.dispose()
      }
      this.bindings = new CompositeDisposable();
      var commands = {}
      commands[`viblo-view:toggle`] = (function(_this) {
        return function(event) {
          var post = _this.loadVibloPost(editor.getPath());
          return post;
        }
      })(this)

      _disposables.add(editor.onDidDestroy((function(_this){
        return function(event) {
          _this.bindings.dispose();
        }
      })(this)));

      return this.bindings.add(atom.commands.add(
        atom.views.getView(editor), commands)
      );
    },

    deactivate: function() {
      if (settingsViewInstance != null) {
        settingsViewInstance.dispose();
      }
      if (settingsViewInstance != null) {
        settingsViewInstance.remove();
      }
      settingsViewInstance = null;
      if ((ref1 = this.imageHelperView) != null) {
        ref1.destroy();
      }
      this.imageHelperView = null;

      if ((ref2 = this.preview) != null) {
        ref2.destroy();
      }
      this.preview = null;

      if (toolBarView) {
        toolBarView.destroy();
      }
      toolBarView = null;

      _disposables.dispose();
      if (this.bindings) {
        this.bindings.dispose();
      }
      return postManagerInstance = null;
    },

    createSettingsView: function(params) {
      if (VibloPluginSettingsView == null) {
        VibloPluginSettingsView = require('./viblo-plugin-settings-view');
      }
      if (postManagerInstance == null) {
        postManagerInstance = new PostManager();
      }
      params.postManagerInstance = postManagerInstance;

      return settingsViewInstance = new VibloPluginSettingsView(params);
    },

    showPublishForm: function(post) {
      var PublishForm;
      if (postManagerInstance == null) {
        postManagerInstance = new PostManager(settingsViewInstance);
      }
      if (this.modal == null) {
        PublishForm = require('./publish-form');
        this.modal = new PublishForm(settingsViewInstance);
      }
      this.modal.setData(post);
      return this.modal.show();
    },


  };
}).call(this);
