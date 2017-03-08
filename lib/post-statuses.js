(function() {
  var PostStatuses;
  module.exports = PostStatuses = (function(superClass){
    function PostStatuses() {}

    PostStatuses.STATUS_DRAFT = 'draft';
    PostStatuses.STATUS_DRAFT_PUBLIC = 'draft_public';
    PostStatuses.STATUS_PUBLIC = 'public';

    PostStatuses.prototype.isDrafted = function(post) {
      return post.status == this.STATUS_DRAFT;
    }

    PostStatuses.prototype.isDraftPublic = function(post) {
        return post.status == this.STATUS_DRAFT_PUBLIC;
    }

    PostStatuses.prototype.isPublic = function(post) {
      return post.status == this.STATUS_PUBLIC;
    }

    return PostStatuses;

  })();
}).call(this)
