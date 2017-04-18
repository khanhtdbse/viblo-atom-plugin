(function() {
  var VibloMarkdownPreviewView, _, fs, imageRegister, isVibloMarkdownPreviewView, path, pathWatcher, pathWatcherPath, renderPreviews, srcClosure;

  fs = require('fs-plus');

  _ = require('lodash');

  path = require('path');

  pathWatcherPath = path.join(atom.packages.resourcePath, '/node_modules/pathwatcher/lib/main');

  pathWatcher = require(pathWatcherPath);

  imageRegister = {};

  VibloMarkdownPreviewView = null;

  isVibloMarkdownPreviewView = function(object) {
    if (VibloMarkdownPreviewView == null) {
      VibloMarkdownPreviewView = require('./markdown-preview-view');
    }
    return object instanceof VibloMarkdownPreviewView;
  };

  renderPreviews = _.debounce((function() {
    var item, j, len, ref;
    if (atom.workspace != null) {
      ref = atom.workspace.getPaneItems();
      for (j = 0, len = ref.length; j < len; j++) {
        item = ref[j];
        if (isVibloMarkdownPreviewView(item)) {
          item.renderMarkdown();
        }
      }
    }
  }), 250);

  srcClosure = function(src) {
    return function(event, path) {
      if (event === 'change' && fs.isFileSync(src)) {
        imageRegister[src].version = Date.now();
      } else {
        imageRegister[src].version = void 0;
      }
      renderPreviews();
    };
  };

  module.exports = {
    removeFile: function(file) {
      return imageRegister = _.mapValues(imageRegister, function(image) {
        image.files = _.without(image.files, file);
        image.files = _.filter(image.files, fs.isFileSync);
        if (_.isEmpty(image.files)) {
          image.watched = false;
          image.watcher.close();
        }
        return image;
      });
    }
    // ,getVersion: function(image, file) {
    //   var files, i, version;
    //   i = _.get(imageRegister, image, {});
    //   if (_.isEmpty(i)) {
    //     if (fs.isFileSync(image)) {
    //       version = Date.now();
    //       imageRegister[image] = {
    //         path: image,
    //         watched: true,
    //         files: [file],
    //         version: version,
    //         watcher: pathWatcher.watch(image, srcClosure(image))
    //       };
    //       return version;
    //     } else {
    //       return false;
    //     }
    //   }
    //   files = _.get(i, 'files');
    //   if (!_.contains(files, file)) {
    //     imageRegister[image].files.push(file);
    //   }
    //   version = _.get(i, 'version');
    //   if (!version && fs.isFileSync(image)) {
    //     version = Date.now();
    //     imageRegister[image].version = version;
    //   }
    //   return version;
    // }
  };

}).call(this);
