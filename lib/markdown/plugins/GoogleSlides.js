module.exports = (code) => {
    if (code.startsWith('https://docs.google.com/presentation/d/')) {
        code = code.match(/[-\w]{25,}/)
    }

    code = 'https://docs.google.com/presentation/d/' + code + '/embed?start=false&loop=false&delayms=3000'

    return '<div class="embed-responsive embed-responsive-16by9">' +
        '<iframe class="embed-responsive-item" src="' + code + '" frameborder="0" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>' +
        '</div>'
}
