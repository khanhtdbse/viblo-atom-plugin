var youtube_parser = (url) => {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    var match = url.match(regExp)
    return (match && match[7].length == 11) ? match[7] : false
}

module.exports = (code) => {
    if (code.startsWith('https://')) {
        code = youtube_parser(code)
    }

    return '<div class="embed-responsive embed-responsive-16by9">' +
        '<iframe class="embed-responsive-item" type="text/html" src="https://www.youtube.com/embed/' + code + '" frameborder="0"></iframe>' +
        '</div>'
}
