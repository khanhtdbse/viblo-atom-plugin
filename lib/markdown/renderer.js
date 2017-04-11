(function() {
  var md = require('./remarkable');

  let options = md.options;
  options = {
      breaks: true,
      linkTarget: '_blank'
  };
  md.set(options);

  exports.toDOMFragment = function(text, filePath, grammar, renderLaTeX, callback) {
    if (text == null) {
      text = '';
    }
    var html = md.render(text);
    var domFragment, template;
    template = document.createElement('template');
    template.innerHTML = html;
    domFragment = template.content.cloneNode(true);
    return callback(null, domFragment);
  };

  exports.toHTML = function(text, filePath, grammar, renderLaTeX, copyHTMLFlag, callback) {
    if (text == null) {
      text = '';
    }
    var html = md.render(text);
    return callback(null, html);
  };

}).call(this);
