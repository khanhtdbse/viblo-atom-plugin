(function() {
  module.exports = Paginator = (function(){
      function Paginator(currentPage, nextPageURL, prevPageURL) {
        this.currentPage = currentPage;
        this.nextPageURL = nextPageURL;
        this.prevPageURL = prevPageURL;
        this.items = [];
      };

      Paginator.content = function() {
        return this.div({
          'class': 'pagination'
          outlet: 'pagination'
        }, (function(_this){
          return function() {
              _this.text('Load next page')
          };
        })(this))
      };

      return Paginator;
  })();
}).call(this);
