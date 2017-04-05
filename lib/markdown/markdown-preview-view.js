(function() {
  var $, $$$, CompositeDisposable, Disposable, Emitter, File, MarkdownPreviewView, ScrollView, UpdatePreview, _, fs, imageWatcher, markdownIt, path, ref, ref1, renderer,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  path = require('path');

  ref = require('atom'), Emitter = ref.Emitter, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  ref1 = require('atom-space-pen-views'), $ = ref1.$, $$$ = ref1.$$$, ScrollView = ref1.ScrollView;

  _ = require('underscore-plus');

  fs = require('fs-plus');

  File = require('atom').File;

  renderer = require('./renderer');

  UpdatePreview = require('./update-preview');

  markdownIt = null;

  imageWatcher = null;

  module.exports = MarkdownPreviewView = (function(superClass) {
    extend(MarkdownPreviewView, superClass);

    MarkdownPreviewView.content = function() {
      return this.div({
        "class": 'markdown-preview native-key-bindings',
        tabindex: -1
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'update-preview'
          });
        };
      })(this));
    };

    function MarkdownPreviewView(arg) {
      this.editorId = arg.editorId, this.filePath = arg.filePath;
      this.syncPreview = bind(this.syncPreview, this);
      this.getPathToToken = bind(this.getPathToToken, this);
      this.syncSource = bind(this.syncSource, this);
      this.renderLaTeX = false;
      this.getPathToElement = bind(this.getPathToElement, this);
      this.updatePreview = null;
      MarkdownPreviewView.__super__.constructor.apply(this, arguments);
      this.emitter = new Emitter;
      this.disposables = new CompositeDisposable;
      this.loaded = true;
    }

    MarkdownPreviewView.prototype.attached = function() {
      if (this.isAttached) {
        return;
      }
      this.isAttached = true;
      if (this.editorId != null) {
        return this.resolveEditor(this.editorId);
      } else {
        if (atom.workspace != null) {
          return this.subscribeToFilePath(this.filePath);
        } else {
          return this.disposables.add(atom.packages.onDidActivateInitialPackages((function(_this) {
            return function() {
              return _this.subscribeToFilePath(_this.filePath);
            };
          })(this)));
        }
      }
    };

    MarkdownPreviewView.prototype.serialize = function() {
      var ref2;
      return {
        deserializer: 'MarkdownPreviewView',
        filePath: (ref2 = this.getPath()) != null ? ref2 : this.filePath,
        editorId: this.editorId
      };
    };

    MarkdownPreviewView.prototype.destroy = function() {
      if (imageWatcher == null) {
        imageWatcher = require('./image-watch-helper');
      }
      imageWatcher.removeFile(this.getPath());
      return this.disposables.dispose();
    };

    MarkdownPreviewView.prototype.onDidChangeTitle = function(callback) {
      return this.emitter.on('did-change-title', callback);
    };

    MarkdownPreviewView.prototype.onDidChangeModified = function(callback) {
      return new Disposable;
    };

    MarkdownPreviewView.prototype.onDidChangeMarkdown = function(callback) {
      return this.emitter.on('did-change-markdown', callback);
    };

    MarkdownPreviewView.prototype.subscribeToFilePath = function(filePath) {
      this.file = new File(filePath);
      this.emitter.emit('did-change-title');
      this.handleEvents();
      return this.renderMarkdown();
    };

    MarkdownPreviewView.prototype.resolveEditor = function(editorId) {
      var resolve;
      resolve = (function(_this) {
        return function() {
          var ref2, ref3;
          _this.editor = _this.editorForId(editorId);
          if (_this.editor != null) {
            if (_this.editor != null) {
              _this.emitter.emit('did-change-title');
            }
            _this.handleEvents();
            return _this.renderMarkdown();
          } else {
            return (ref2 = atom.workspace) != null ? (ref3 = ref2.paneForItem(_this)) != null ? ref3.destroyItem(_this) : void 0 : void 0;
          }
        };
      })(this);
      if (atom.workspace != null) {
        return resolve();
      } else {
        return this.disposables.add(atom.packages.onDidActivateInitialPackages(resolve));
      }
    };

    MarkdownPreviewView.prototype.editorForId = function(editorId) {
      var editor, j, len, ref2, ref3;
      ref2 = atom.workspace.getTextEditors();
      for (j = 0, len = ref2.length; j < len; j++) {
        editor = ref2[j];
        if (((ref3 = editor.id) != null ? ref3.toString() : void 0) === editorId.toString()) {
          return editor;
        }
      }
      return null;
    };

    MarkdownPreviewView.prototype.handleEvents = function() {
      var changeHandler;
      this.disposables.add(atom.grammars.onDidAddGrammar((function(_this) {
        return function() {
          return _.debounce((function() {
            return _this.renderMarkdown();
          }), 250);
        };
      })(this)));
      this.disposables.add(atom.grammars.onDidUpdateGrammar(_.debounce(((function(_this) {
        return function() {
          return _this.renderMarkdown();
        };
      })(this)), 250)));
      atom.commands.add(this.element, {
        'core:move-up': (function(_this) {
          return function() {
            return _this.scrollUp();
          };
        })(this),
        'core:move-down': (function(_this) {
          return function() {
            return _this.scrollDown();
          };
        })(this),
        'core:save-as': (function(_this) {
          return function(event) {
            event.stopPropagation();
            return _this.saveAs();
          };
        })(this),
        'core:copy': (function(_this) {
          return function(event) {
            if (_this.copyToClipboard()) {
              return event.stopPropagation();
            }
          };
        })(this),
        'viblo-markdown-preview:zoom-in': (function(_this) {
          return function() {
            var zoomLevel;
            zoomLevel = parseFloat(_this.css('zoom')) || 1;
            return _this.css('zoom', zoomLevel + .1);
          };
        })(this),
        'viblo-markdown-preview:zoom-out': (function(_this) {
          return function() {
            var zoomLevel;
            zoomLevel = parseFloat(_this.css('zoom')) || 1;
            return _this.css('zoom', zoomLevel - .1);
          };
        })(this),
        'viblo-markdown-preview:reset-zoom': (function(_this) {
          return function() {
            return _this.css('zoom', 1);
          };
        })(this),
        'viblo-markdown-preview:sync-source': (function(_this) {
          return function(event) {
            return _this.getMarkdownSource().then(function(source) {
              if (source == null) {
                return;
              }
              return _this.syncSource(source, event.target);
            });
          };
        })(this)
      });
      changeHandler = (function(_this) {
        return function() {
          var base, pane, ref2;
          _this.renderMarkdown();
          pane = (ref2 = typeof (base = atom.workspace).paneForItem === "function" ? base.paneForItem(_this) : void 0) != null ? ref2 : atom.workspace.paneForURI(_this.getURI());
          if ((pane != null) && pane !== atom.workspace.getActivePane()) {
            return pane.activateItem(_this);
          }
        };
      })(this);
      if (this.file != null) {
        this.disposables.add(this.file.onDidChange(changeHandler));
      } else if (this.editor != null) {
        this.disposables.add(this.editor.getBuffer().onDidStopChanging(function() {
          return changeHandler();
        }));
        this.disposables.add(this.editor.onDidChangePath((function(_this) {
          return function() {
            return _this.emitter.emit('did-change-title');
          };
        })(this)));
        this.disposables.add(this.editor.getBuffer().onDidSave(function() {
            return changeHandler();
        }));
        this.disposables.add(this.editor.getBuffer().onDidReload(function() {
            return changeHandler();
        }));
        this.disposables.add(atom.commands.add(atom.views.getView(this.editor), {
          'viblo-markdown-preview:sync-preview': (function(_this) {
            return function(event) {
              return _this.getMarkdownSource().then(function(source) {
                if (source == null) {
                  return;
                }
                return _this.syncPreview(source, _this.editor.getCursorBufferPosition().row);
              });
            };
          })(this)
        }));
      }
    };

    MarkdownPreviewView.prototype.renderMarkdown = function() {
      if (!this.loaded) {
        this.showLoading();
      }
      return this.getMarkdownSource().then((function(_this) {
        return function(source) {
          if (source != null) {
            return _this.renderMarkdownText(source);
          }
        };
      })(this));
    };

    MarkdownPreviewView.prototype.getMarkdownSource = function() {
      var ref2;
      if ((ref2 = this.file) != null ? ref2.getPath() : void 0) {
        return this.file.read();
      } else if (this.editor != null) {
        return Promise.resolve(this.editor.getText());
      } else {
        return Promise.resolve(null);
      }
    };

    MarkdownPreviewView.prototype.getHTML = function(callback) {
      return this.getMarkdownSource().then((function(_this) {
        return function(source) {
          if (source == null) {
            return;
          }
          return renderer.toHTML(source, _this.getPath(), _this.getGrammar(), _this.renderLaTeX, false, callback);
        };
      })(this));
    };

    MarkdownPreviewView.prototype.renderMarkdownText = function(text) {
      return renderer.toDOMFragment(text, this.getPath(), this.getGrammar(), this.renderLaTeX, (function(_this) {
        return function(error, domFragment) {
          if (error) {
            return _this.showError(error);
          } else {
            _this.loading = false;
            _this.loaded = true;
            if (!_this.updatePreview) {
              _this.updatePreview = new UpdatePreview(_this.find("div.update-preview")[0]);
            }
            _this.updatePreview.update(domFragment, _this.renderLaTeX);
            _this.emitter.emit('did-change-markdown');
            return _this.originalTrigger('viblo-markdown-preview:markdown-changed');
          }
        };
      })(this));
    };

    MarkdownPreviewView.prototype.getTitle = function() {
      if (this.file != null) {
        return (path.basename(this.getPath())) + " Preview";
      } else if (this.editor != null) {
        return (this.editor.getTitle()) + " - Preview";
      } else {
        return "Markdown Preview";
      }
    };

    MarkdownPreviewView.prototype.getIconName = function() {
      return "viblo-logo";
    };

    MarkdownPreviewView.prototype.getURI = function() {
      if (this.file != null) {
        return "viblo-markdown-preview://" + (this.getPath());
      } else {
        return "viblo-markdown-preview://editor/" + this.editorId;
      }
    };

    MarkdownPreviewView.prototype.getPath = function() {
      if (this.file != null) {
        return this.file.getPath();
      } else if (this.editor != null) {
        return this.editor.getPath();
      }
    };

    MarkdownPreviewView.prototype.getGrammar = function() {
      var ref2;
      return (ref2 = this.editor) != null ? ref2.getGrammar() : void 0;
    };

    MarkdownPreviewView.prototype.getDocumentStyleSheets = function() {
      return document.styleSheets;
    };

    MarkdownPreviewView.prototype.getTextEditorStyles = function() {
      var textEditorStyles;
      textEditorStyles = document.createElement("atom-styles");
      textEditorStyles.initialize(atom.styles);
      textEditorStyles.setAttribute("context", "atom-text-editor");
      document.body.appendChild(textEditorStyles);
      return Array.prototype.slice.apply(textEditorStyles.childNodes).map(function(styleElement) {
        return styleElement.innerText;
      });
    };

    MarkdownPreviewView.prototype.getMarkdownPreviewCSS = function() {
      var cssUrlRefExp, j, k, len, len1, markdowPreviewRules, ref2, ref3, ref4, rule, ruleRegExp, stylesheet;
      markdowPreviewRules = [];
      ruleRegExp = /\.markdown-preview/;
      cssUrlRefExp = /url\(atom:\/\/viblo-atom-plugin\/styles\/(.*)\)/;
      ref2 = this.getDocumentStyleSheets();
      for (j = 0, len = ref2.length; j < len; j++) {
        stylesheet = ref2[j];
        if (stylesheet.rules != null) {
          ref3 = stylesheet.rules;
          for (k = 0, len1 = ref3.length; k < len1; k++) {
            rule = ref3[k];
            if (((ref4 = rule.selectorText) != null ? ref4.match(ruleRegExp) : void 0) != null) {
              markdowPreviewRules.push(rule.cssText);
            }
          }
        }
      }
      return markdowPreviewRules.concat(this.getTextEditorStyles()).join('\n').replace(/atom-text-editor/g, 'pre.editor-colors').replace(/:host/g, '.host').replace(cssUrlRefExp, function(match, assetsName, offset, string) {
        var assetPath, base64Data, originalData;
        assetPath = path.join(__dirname, '../assets', assetsName);
        originalData = fs.readFileSync(assetPath, 'binary');
        base64Data = new Buffer(originalData, 'binary').toString('base64');
        return "url('data:image/jpeg;base64," + base64Data + "')";
      });
    };

    MarkdownPreviewView.prototype.showError = function(result) {
      var failureMessage;
      failureMessage = result != null ? result.message : void 0;
      return this.html($$$(function() {
        this.h2('Previewing Markdown Failed');
        if (failureMessage != null) {
          return this.h3(failureMessage);
        }
      }));
    };

    MarkdownPreviewView.prototype.showLoading = function() {
      this.loading = true;
      return this.html($$$(function() {
        return this.div({
          "class": 'markdown-spinner'
        }, 'Loading Markdown\u2026');
      }));
    };

    MarkdownPreviewView.prototype.copyToClipboard = function() {
      var selectedNode, selectedText, selection;
      if (this.loading) {
        return false;
      }
      selection = window.getSelection();
      selectedText = selection.toString();
      selectedNode = selection.baseNode;
      if (selectedText && (selectedNode != null) && (this[0] === selectedNode || $.contains(this[0], selectedNode))) {
        return false;
      }
      this.getHTML(function(error, html) {
        if (error != null) {
          return console.warn('Copying Markdown as HTML failed', error);
        } else {
          return atom.clipboard.write(html);
        }
      });
      return true;
    };

    MarkdownPreviewView.prototype.saveAs = function() {
      var filePath, htmlFilePath, projectPath, title;
      if (this.loading) {
        return;
      }
      filePath = this.getPath();
      title = 'Markdown to HTML';
      if (filePath) {
        title = path.parse(filePath).name;
        filePath += '.html';
      } else {
        filePath = 'untitled.md.html';
        if (projectPath = atom.project.getPaths()[0]) {
          filePath = path.join(projectPath, filePath);
        }
      }
      if (htmlFilePath = atom.showSaveDialogSync(filePath)) {
        return this.getHTML((function(_this) {
          return function(error, htmlBody) {
            var html;
            if (error != null) {
              return console.warn('Saving Markdown as HTML failed', error);
            } else {
              html = ("<!DOCTYPE html>\n<html>\n  <head>\n      <meta charset=\"utf-8\" />\n      <title>" + title + "</title>" + "\n      <style>" + (_this.getMarkdownPreviewCSS()) + "</style>\n  </head>\n  <body class='markdown-preview'>" + htmlBody + "</body>\n</html>") + "\n";
              fs.writeFileSync(htmlFilePath, html);
              return atom.workspace.open(htmlFilePath);
            }
          };
        })(this));
      }
    };

    MarkdownPreviewView.prototype.isEqual = function(other) {
      return this[0] === (other != null ? other[0] : void 0);
    };

    MarkdownPreviewView.prototype.bubbleToContainerElement = function(element) {
      var parent, testElement;
      testElement = element;
      while (testElement !== document.body) {
        parent = testElement.parentNode;
        if (parent.classList.contains('atom-text-editor')) {
          return parent;
        }
        testElement = parent;
      }
      return element;
    };

    MarkdownPreviewView.prototype.bubbleToContainerToken = function(pathToToken) {
      var i, j, ref2;
      for (i = j = 0, ref2 = pathToToken.length - 1; j <= ref2; i = j += 1) {
        if (pathToToken[i].tag === 'table') {
          return pathToToken.slice(0, i + 1);
        }
      }
      return pathToToken;
    };

    MarkdownPreviewView.prototype.encodeTag = function(element) {
      if (element.classList.contains('math')) {
        return 'math';
      }
      if (element.classList.contains('atom-text-editor')) {
        return 'code';
      }
      return element.tagName.toLowerCase();
    };

    MarkdownPreviewView.prototype.decodeTag = function(token) {
      if (token.tag === 'math') {
        return 'span';
      }
      if (token.tag === 'code') {
        return 'span';
      }
      if (token.tag === "") {
        return null;
      }
      return token.tag;
    };

    MarkdownPreviewView.prototype.getPathToElement = function(element) {
      var j, len, pathToElement, sibling, siblingTag, siblings, siblingsCount, tag;
      if (element.classList.contains('markdown-preview')) {
        return [
          {
            tag: 'div',
            index: 0
          }
        ];
      }
      element = this.bubbleToContainerElement(element);
      tag = this.encodeTag(element);
      siblings = element.parentNode.childNodes;
      siblingsCount = 0;
      for (j = 0, len = siblings.length; j < len; j++) {
        sibling = siblings[j];
        siblingTag = sibling.nodeType === 1 ? this.encodeTag(sibling) : null;
        if (sibling === element) {
          pathToElement = this.getPathToElement(element.parentNode);
          pathToElement.push({
            tag: tag,
            index: siblingsCount
          });
          return pathToElement;
        } else if (siblingTag === tag) {
          siblingsCount++;
        }
      }
    };

    MarkdownPreviewView.prototype.syncSource = function(text, element) {
      var finalToken, j, len, level, pathToElement, ref2, token, tokens;
      pathToElement = this.getPathToElement(element);
      pathToElement.shift();
      pathToElement.shift();
      if (!pathToElement.length) {
        return;
      }
      if (markdownIt == null) {
        markdownIt = require('./markdown-it-helper');
      }
      tokens = markdownIt.getTokens(text, this.renderLaTeX);
      finalToken = null;
      level = 0;
      for (j = 0, len = tokens.length; j < len; j++) {
        token = tokens[j];
        if (token.level < level) {
          break;
        }
        if (token.hidden) {
          continue;
        }
        if (token.tag === pathToElement[0].tag && token.level === level) {
          if (token.nesting === 1) {
            if (pathToElement[0].index === 0) {
              if (token.map != null) {
                finalToken = token;
              }
              pathToElement.shift();
              level++;
            } else {
              pathToElement[0].index--;
            }
          } else if (token.nesting === 0 && ((ref2 = token.tag) === 'math' || ref2 === 'code' || ref2 === 'hr')) {
            if (pathToElement[0].index === 0) {
              finalToken = token;
              break;
            } else {
              pathToElement[0].index--;
            }
          }
        }
        if (pathToElement.length === 0) {
          break;
        }
      }
      if (finalToken != null) {
        this.editor.setCursorBufferPosition([finalToken.map[0], 0]);
        return finalToken.map[0];
      } else {
        return null;
      }
    };

    MarkdownPreviewView.prototype.getPathToToken = function(tokens, line) {
      var j, len, level, pathToToken, ref2, ref3, token, tokenTagCount;
      pathToToken = [];
      tokenTagCount = [];
      level = 0;
      for (j = 0, len = tokens.length; j < len; j++) {
        token = tokens[j];
        if (token.level < level) {
          break;
        }
        if (token.hidden) {
          continue;
        }
        if (token.nesting === -1) {
          continue;
        }
        token.tag = this.decodeTag(token);
        if (token.tag == null) {
          continue;
        }
        if ((token.map != null) && line >= token.map[0] && line <= (token.map[1] - 1)) {
          if (token.nesting === 1) {
            pathToToken.push({
              tag: token.tag,
              index: (ref2 = tokenTagCount[token.tag]) != null ? ref2 : 0
            });
            tokenTagCount = [];
            level++;
          } else if (token.nesting === 0) {
            pathToToken.push({
              tag: token.tag,
              index: (ref3 = tokenTagCount[token.tag]) != null ? ref3 : 0
            });
            break;
          }
        } else if (token.level === level) {
          if (tokenTagCount[token.tag] != null) {
            tokenTagCount[token.tag]++;
          } else {
            tokenTagCount[token.tag] = 1;
          }
        }
      }
      pathToToken = this.bubbleToContainerToken(pathToToken);
      return pathToToken;
    };

    MarkdownPreviewView.prototype.syncPreview = function(text, line) {
      var candidateElement, element, j, len, maxScrollTop, pathToToken, token, tokens;
      if (markdownIt == null) {
        markdownIt = require('./markdown-it-helper');
      }
      tokens = markdownIt.getTokens(text, this.renderLaTeX);
      pathToToken = this.getPathToToken(tokens, line);
      element = this.find('.update-preview').eq(0);
      for (j = 0, len = pathToToken.length; j < len; j++) {
        token = pathToToken[j];
        candidateElement = element.children(token.tag).eq(token.index);
        if (candidateElement.length !== 0) {
          element = candidateElement;
        } else {
          break;
        }
      }
      if (element[0].classList.contains('update-preview')) {
        return null;
      }
      if (!element[0].classList.contains('update-preview')) {
        element[0].scrollIntoView();
      }
      maxScrollTop = this.element.scrollHeight - this.innerHeight();
      if (!(this.scrollTop() >= maxScrollTop)) {
        this.element.scrollTop -= this.innerHeight() / 4;
      }
      element.addClass('flash');
      setTimeout((function() {
        return element.removeClass('flash');
      }), 1000);
      return element[0];
    };

    return MarkdownPreviewView;

  })(ScrollView);

}).call(this);
