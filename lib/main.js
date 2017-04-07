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
    markdownIt,cheerio,
    TextEditor;

  $ = require('jquery');
  path = require('path');
  fs = require('fs-plus');
  url = require('url');
  CompositeDisposable = require('atom').CompositeDisposable;
  TextEditor = require('atom').TextEditor;
  var MarkdownPreviewView, fs, isMarkdownPreviewView, mathjaxHelper, renderer, url,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  PostManager = require('./post-manager');
  _disposables = new CompositeDisposable();
  postManagerInstance = null;
  MarkdownPreviewView = null;
  renderer = null;

  var vibloPostsStorageDir = fs.getHomeDirectory() + '/.viblo/';

  isMarkdownPreviewView = function(object) {
    if (MarkdownPreviewView == null) {
      MarkdownPreviewView = require('./markdown/markdown-preview-view');
    }
    return object instanceof MarkdownPreviewView;
  };

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
    provider: null,
    provide: function() {
      return [
        require('./category-provider')
      ]
    },
    createMarkdownPreviewView: function(state) {
      if (state.editorId) {
        if (MarkdownPreviewView == null) {
          MarkdownPreviewView = require('./markdown/markdown-preview-view');
        }
        return new MarkdownPreviewView(state);
      }
    },
    changeDocumentTitle: function(paneItem) {
      if (paneItem instanceof TextEditor) {
        var path = paneItem.getDirectoryPath();
        var homeDir = fs.getHomeDirectory();
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
      if (post) {
        return post.title;
      }
      return originalTitle;
    },

    prepareNewPostForPublish: function(editor) {
        var post = {};
        var contents = editor.getText();
        var title = this.getTitleFromContent(contents);
        if (!title && editor.getPath()) {
          title = path.basename(editor.getPath().toLowerCase(), '.md');
        }
        post.title = title;
        post.contents = contents;
        return post;
    },

    loadVibloPost: function(path) {
      if (!path || !isVibloFile(path)) {
        return;
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
        markdownIt = require('./markdown/markdown-it-helper');
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
      }

      var getTextEditorTitle = this.getTextEditorTitle.bind(this);
      _disposables.add(atom.workspace.observeTextEditors((function(_this){
        return function (editor) {
          // _disposables.add(editor.onDidChangeTitle(function(state) {
          //   console.log('onDidChangeTitle', state);
          // }));

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
            _disposables.add(postManagerInstance.onDidSavedToFile(function(post) {
              editor.emitter.emit('did-change-title', post.title);
              postManagerInstance.save(post);
            }));

            _disposables.add(editor.onDidSave(function(event) {
              var post = _this.loadVibloPost(event.path);
              if (!post) {
                return;
              }
              post.contents = editor.getText();

              var title = _this.getTitleFromContent(post.contents);
              if (title) {
                post.title = title;
              }
              postManagerInstance.savePostToFile(post);
            }));
          }

        }
      })(this)))
      // _disposables.add(atom.workspace.observePanes(function (pane) {
      //   console.log('Pane', pane);
        // _disposables.add(pane.onDidMoveItem(renameTabs))
      // }))
      // _disposables.add(atom.workspace.onDidOpen(renameTabs))
      // _disposables.add(atom.workspace.onDidAddPane(function(state) {
      //   console.log('onDidAddPane', state);
      // }));
      // _disposables.add(atom.workspace.onDidAddTextEditor(function(state) {
      //   console.log('onDidAddTextEditor', state);
      //   return function() {
      //     textEditor
      //   }
      // }));


      _disposables.add(atom.workspace.onDidChangeActivePaneItem((function(_this){
        return function(paneItem) {
            _this.changeDocumentTitle(paneItem);
        };
      })(this)));

      atom.workspace.addOpener((function(_this) {
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
              return _this.createMarkdownPreviewView({
                editorId: pathname.substring(1)
              });
            }
            return _this.createMarkdownPreviewView({
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
      })(this));

      var publishFromFileTreeCb = (function(_this) {
          return function(arg) {
            var editor, filePath, i, len, ref, target, contents;
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
          return function(arg) {
            var contents, editor;
            editor = atom.workspace.getActiveTextEditor();
            if (editor == null) {
              return;
            }
            var post = _this.loadVibloPost(editor.getPath());
            if (!post) {
              post =_this.prepareNewPostForPublish(editor);
            }
            _this.showPublishForm(post);
          };
      })(this);

      var publishFromMarkdownPreview = (function(_this) {
          return function(arg) {
            var contents, editor, file, activePane, buffer;
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
            // _this.showPublishForm(contents);
          };
      })(this);

      var publishFromWorkspace = (function(_this) {
          return function(event) {
            if (event.originalEvent == null) {
              return;
            }
            var code = event.originalEvent && event.originalEvent.code;
            if (code == 'Escape' && _this.modal) {
              _this.modal.hide();
            }
          };
      })(this);

      atom.commands.add('atom-workspace', 'viblo-view:toggle-preview', (function(_this) {
        return function() {
          return _this.togglePreview();
        };
      })(this));

      var previewPost = this.previewPost.bind(this);

      atom.commands.add("atom-workspace atom-text-editor[data-grammar*=\"gfm\"]", 'viblo-view:toggle', publishFromEditor);
      atom.commands.add("atom-workspace atom-text-editor[data-grammar*=\"gfm\"]", 'viblo-view:preview-post', previewPost);
      atom.commands.add('.tree-view .file .name[data-name$=\\.md]', 'viblo-view:preview-post', previewPost);
      atom.commands.add('.tree-view .file .name[data-name$=\\.md]', 'viblo-view:toggle', publishFromFileTreeCb);
      atom.commands.add('.markdown-preview', 'viblo-view:toggle', publishFromMarkdownPreview);
      atom.commands.add('atom-workspace', 'viblo-view:toggle', publishFromWorkspace);

      atom.commands.add('atom-workspace', 'viblo-view:settings', function() {
          return atom.workspace.open(locationUri + "/settings");
      });

      atom.commands.add('atom-workspace', 'viblo-view:posts', function() {
          return atom.workspace.open(locationUri + "/posts");
      });
    },

    togglePreview: function() {
      var editor, grammars, ref, ref1;
      if (isMarkdownPreviewView(atom.workspace.getActivePaneItem())) {
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
      return atom.workspace.open(uri, options).then(function(markdownPreviewView) {
        if (isMarkdownPreviewView(markdownPreviewView)) {
          return previousActivePane.activate();
        }
      });
    },
    previewPost: function(arg) {
      var editor, filePath, i, len, ref, target;
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
          // console.log(event, editor, post);
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
      _disposables.dispose();
      this.bindings.dispose();
      return postManagerInstance = null;
    },

    createSettingsView: function(params) {
      if (VibloPluginSettingsView == null) {
        VibloPluginSettingsView = require('./viblo-plugin-settings-view');
      }
      params.postManagerInstance = postManagerInstance;

      return settingsViewInstance = new VibloPluginSettingsView(params);
    },

    showPublishForm: function(post) {
      var PublishForm;
      if (postManagerInstance == null) {
        postManagerInstance = new PostManager();
      }
      if (this.modal == null) {
        PublishForm = require('./publish-form');
        this.modal = new PublishForm(postManagerInstance);
      }
      // if (this.modal.isVisible()) {
      //     return this.modal.hide();
      // }
      this.modal.setData(post);
      return this.modal.show();
    },


  };
}).call(this);
