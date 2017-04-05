(function() {
  jQuery = require('jquery');
  var gistEmbed = require('gist-embed');

  var _ = require('lodash');

  module.exports = (code) => {
      if (code.startsWith('https://gist.github.com/')) {
          code = code.substr(24)
      }

      _.delay(() => {
          $('code[data-gist-id="' + code + '"]').gist()
      }, 500)

      return '<code data-gist-id="' + code + '"></code>'
  }
}).call(this);
