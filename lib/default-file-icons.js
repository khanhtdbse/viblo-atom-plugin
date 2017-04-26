(function() {
  var DefaultFileIcons, fs, path, vibloPostsStorageDir, PostStatuses, postStatusesInstance;

  PostStatuses = require('./post-statuses');

  postStatusesInstance = new PostStatuses();

  fs = require('fs-plus');

  path = require('path');

 vibloPostsStorageDir = fs.getHomeDirectory() + '/.viblo/';

  DefaultFileIcons = (function() {
    function DefaultFileIcons() {}

    DefaultFileIcons.prototype.iconClassForPath = function(filePath) {
      if (this.isVibloFile(filePath)) {
        var postSlug = filePath.replace(vibloPostsStorageDir, '').replace('.md', '');
        var postMetaPath = vibloPostsStorageDir + postSlug + '.meta';
        if (fs.isFileSync(postMetaPath)) {
          var buffer = fs.readFileSync(postMetaPath);
          var post = JSON.parse(buffer.toString());

          if (post.status === postStatusesInstance.STATUS_DRAFT) {
            return 'viblo-logo icon-post-draft';
          }

          if (post.status === postStatusesInstance.STATUS_PUBLIC) {
            return 'viblo-logo icon-post-public';
          }

          if (post.status === postStatusesInstance.STATUS_DRAFT_PUBLIC) {
            return 'viblo-logo icon-post-draft-public';
          }
        }
      }
      var extension;
      extension = path.extname(filePath);
      if (fs.isSymbolicLinkSync(filePath)) {
        return 'icon-file-symlink-file';
      } else if (fs.isReadmePath(filePath)) {
        return 'icon-book';
      } else if (fs.isCompressedExtension(extension)) {
        return 'icon-file-zip';
      } else if (fs.isImageExtension(extension)) {
        return 'icon-file-media';
      } else if (fs.isPdfExtension(extension)) {
        return 'icon-file-pdf';
      } else if (fs.isBinaryExtension(extension)) {
        return 'icon-file-binary';
      } else {
        return 'icon-file-text';
      }
    };

    DefaultFileIcons.prototype.isVibloFile = function(path) {
      if (!path) {
        return;
      }
      return path.indexOf(vibloPostsStorageDir) === 0;
    }

    return DefaultFileIcons;

  })();

  module.exports = DefaultFileIcons;

}).call(this);
