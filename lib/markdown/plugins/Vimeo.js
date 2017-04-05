var vimeo_parser = (url) => {
    var regExp = /(https?:\/\/)?(www.)?(player.)?vimeo.com\/([a-z]*\/)*([0-9]{6,11})[?]?.*/
    var match = url.match(regExp)
    return (match && match[5].length > 0) ? match[5] : false
}

module.exports = (code) => {
    if (code.startsWith('https://')) {
        code = vimeo_parser(code)
    }
    code = 'https://player.vimeo.com/video/' + code

    return '<div class="embed-responsive embed-responsive-16by9">' +
        '<iframe class="embed-responsive-item" type="text/html" src="' + code + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>' +
        '</div>'
}
