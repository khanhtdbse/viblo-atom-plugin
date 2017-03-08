module.exports = {
  selector: 'atom-text-editor[mini]',

  inclusionPriority: 1,
  excludeLowerPriority: true,

  getSuggestions: function(request) {
    console.log(request);
    var prefix = request.prefix
    var suggestions = []
    var scopes = request.scopeDescriptor.getScopesArray()
    suggestions.push({
      text: 'snippet',
      displayText: 'displayText',
      rightLabel: "octicon",
      replacementPrefix: 'ss',
      type: "tag",
      leftLabelHTML:'leftLabelHTML'
    })
    return suggestions
  }
}

function isAMatch(str1, str2) {
  return str1.toLowerCase().indexOf(str2.toLowerCase()) >= 0
}

function anyMatch(keywords, str) {
  var result = false
  keywords.forEach(function(key) {
    if (isAMatch(key, str)) {
      result = true
    }
  })
  return result
}
