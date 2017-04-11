(function() {
  var $, $$$, CompositeDisposable, Directory, Emitter, ImageHelperView, TextEditorView, View, fs, path, ref, ref1,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  ref1 = require('atom-space-pen-views'), $ = ref1.$, $$$ = ref1.$$$, View = ref1.View, TextEditorView = ref1.TextEditorView;

  Directory = require('atom').Directory;

  path = require('path');

  fs = require('fs-plus');

  var VibloAPI = require('../viblo-api');
  var vibloAPI = new VibloAPI();


  ImageHelperView = (function(superClass) {
    extend(ImageHelperView, superClass);

    function ImageHelperView() {
      return ImageHelperView.__super__.constructor.apply(this, arguments);
    }

    ImageHelperView.prototype.subscriptions = new CompositeDisposable;

    ImageHelperView.prototype.initialize = function() {
      this.bindEvents();
      return this.subscriptions.add(atom.commands.add(this.element, {
        'core:cancel': (function(_this) {
          return function() {
            return _this.hidePanel();
          };
        })(this),
        'core:confirm': (function(_this) {
          return function() {
            return _this.insertImageURL();
          };
        })(this)
      }));
    };

    ImageHelperView.prototype.destroy = function() {
      var ref2;
      this.subscriptions.dispose();
      if ((ref2 = this.panel) != null) {
        ref2.destroy();
      }
      this.panel = null;
      return this.editor = null;
    };

    ImageHelperView.content = function() {
      return this.div({
        "class": 'image-helper-view'
      }, (function(_this) {
        return function() {
          _this.h3('Insert Images');
          _this.div({
            "class": 'upload-div'
          }, function() {
            _this.label('Image external URL');
            _this.subview("urlEditor", new TextEditorView({
              mini: true,
              placeholderText: 'Enter image URL here, then press \'Enter\' to insert.'
            }));
            _this.div({
              "class": 'splitter'
            });
            _this.label('Upload');
            _this.div({
              "class": 'drop-area uploader'
            }, function() {
              _this.p({
                "class": 'uploader'
              }, function() {
                _this.span({'class' : 'fa fa-cloud-upload fa-3x'});
                _this.br();
                _this.raw('Drag and drop files here or click to upload');
              });
              return _this.input({
                "class": 'file-uploader uploader',
                type: 'file',
                style: 'display: none;',
                multiple: "multiple"
              });
            });
            _this.div({
              "class": 'splitter'
            });
            _this.div({
              'class':'image-thumbs inset-panel',
              'outlet': 'mediaLibrary'
            }, function() {
              _this.p({}, function() {
                _this.span({'class': 'loading loading-spinner-tiny inline-block'});
                _this.raw('Loading media lybrary...');
              })
            })
          });
          return _this.div({'class':'modal-footer'}, function() {
            return _this.div({
              "class": 'close-btn btn'
            }, 'close');
          })
        };
      })(this));
    };

    ImageHelperView.prototype.bindEvents = function() {
      var closeBtn, dropArea, fileUploader, uploaderSelect;
      closeBtn = $('.close-btn', this.element);
      closeBtn.click((function(_this) {
        return function() {
          return _this.hidePanel();
        };
      })(this));
      dropArea = $('.drop-area', this.element);
      fileUploader = $('.file-uploader', this.element);
      uploaderSelect = $('.uploader-select', this.element);
      dropArea.on("drop dragend dragstart dragenter dragleave drag dragover", (function(_this) {
        return function(e) {
          var file, j, k, len, len1, ref2, ref3, results, results1;
          e.preventDefault();
          e.stopPropagation();
          if (e.type === "drop") {
            ref3 = e.originalEvent.dataTransfer.files;
            results1 = [];
            for (k = 0, len1 = ref3.length; k < len1; k++) {
              file = ref3[k];
              results1.push(_this.uploadImageFile(file));
            }
            return results1;
          }
        };
      })(this));
      dropArea.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return $(this).find('input[type="file"]').click();
      });
      fileUploader.on('click', function(e) {
        return e.stopPropagation();
      });
      fileUploader.on('change', (function(_this) {
        return function(e) {
          var file, j, k, len, len1, ref2, ref3, results, results1;
          ref3 = e.target.files;
          results1 = [];
          for (k = 0, len1 = ref3.length; k < len1; k++) {
            file = ref3[k];
            results1.push(_this.uploadImageFile(file));
          }
          return results1;
        };
      })(this));
    };

    ImageHelperView.prototype.replaceHint = function(editor, lineNo, hint, withStr) {
      var line;
      if (editor && editor.buffer && editor.buffer.lines[lineNo].indexOf(hint) >= 0) {
        line = editor.buffer.lines[lineNo];
        editor.buffer.setTextInRange([[lineNo, 0], [lineNo + 1, 0]], line.replace(hint, withStr + '\n'));
        return true;
      }
      return false;
    };

    ImageHelperView.prototype.setUploadedImageURL = function(fileName, url, editor, hint, curPos) {
      var buffer, description, i, line, results, withStr;
      if (fileName.lastIndexOf('.')) {
        description = fileName.slice(0, fileName.lastIndexOf('.'));
      } else {
        description = fileName;
      }
      buffer = editor.buffer;
      line = editor.buffer.lines[curPos.row];
      withStr = "![" + description + "](" + url + ")";
      if (!this.replaceHint(editor, curPos.row, hint, withStr)) {
        i = curPos.row - 20;
        results = [];
        while (i <= curPos.row + 20) {
          if (this.replaceHint(editor, i, hint, withStr)) {
            break;
          }
          results.push(i++);
        }
        return results;
      }
    };

    ImageHelperView.prototype.uploadImageFile = function(file) {
      var curPos, editor, fileName, hint, uid, uploader;
      fileName = file.name;
      this.hidePanel();
      editor = this.editor;
      uid = Math.random().toString(36).substr(2, 9);
      hint = "![Uploading " + fileName + "… (" + uid + ")]()";
      curPos = editor.getCursorBufferPosition();
      editor.insertText(hint);
      atom.views.getView(editor).focus();
      return vibloAPI.uploadFile(file.path, (function(_this) {
        return function(err, url) {
          if (err) {
            return atom.notifications.addError(err);
          } else {
            return _this.setUploadedImageURL(fileName, url, editor, hint, curPos);
          }
        };
      })(this));
  };

    ImageHelperView.prototype.insertImageURL = function(url) {
      var curPos, url;
      if (!url) {
        url = this.urlEditor.getText().trim();
      }
      if (url.indexOf(' ') >= 0) {
        url = "<" + url + ">";
      }
      if (url.length) {
        this.hidePanel();
        curPos = this.editor.getCursorBufferPosition();
        this.editor.insertText("![Image description](" + url + ")");
        this.editor.setSelectedBufferRange([[curPos.row, curPos.column + 2], [curPos.row, curPos.column + 19]]);
        return atom.views.getView(this.editor).focus();
      }
    };

    ImageHelperView.prototype.hidePanel = function() {
      var ref2;
      if (!((ref2 = this.panel) != null ? ref2.isVisible() : void 0)) {
        return;
      }
      return this.panel.hide();
    };

    ImageHelperView.prototype.getLocalStorageImagesPath = function() {
      var homeDir, vibloDir;
      homeDir = fs.getHomeDirectory();
      vibloDir = homeDir + '/.viblo';
      imageFolderPath = vibloDir + '/images';
      if (!fs.isDirectorySync(imageFolderPath)) {
        fs.makeTreeSync(imageFolderPath);
      }
      return imageFolderPath;
    }

    ImageHelperView.prototype.display = function(editor) {
      var copyLabel, imageFolderPath, uploader;
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: false
        });
      }
      this.panel.show();
      this.urlEditor.focus();
      this.editor = editor;
      this.urlEditor.setText('');
      $('.loading', this.mediaLibrary).parent().show();
      $('img', this.mediaLibrary).remove();
      $(this.element).find('input[type="file"]').val('');
      vibloAPI.loadMediaLibrary().then((function(_this) {
        return function(imageList) {
          imageList = JSON.parse(imageList);
          $('.loading', _this.mediaLibrary).parent().hide();
          $.each(imageList, function(i, elm) {
            var $image = $('<img>').attr('src', elm.thumbnail);
            $image.on('click', function() {
              _this.insertImageURL(elm.full);
            });
            _this.mediaLibrary.append($image);
          });
        };
      })(this)).catch((function(_this) {
        return (err) => {
          console.log(err);
          _this.mediaLibrary.text('Error occurs. Please reopen the Image Helper.');
        };
      })(this));
    };

    return ImageHelperView;

  })(View);

  module.exports = ImageHelperView;

}).call(this);
