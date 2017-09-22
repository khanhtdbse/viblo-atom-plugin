var Remarkable = require('remarkable');
var katex = require('./plugins/katex')
var mentions = require('./parse-mentions');
var Embed = require('remarkable-embed').Plugin;
var Vimeo = require('./plugins/Vimeo');
var Youtube = require('./plugins/Youtube');
var Codepen = require('./plugins/Codepen');
var Slideshare = require('./plugins/Slideshare');
var GoogleSlides = require('./plugins/GoogleSlides');
var Gist = require('./plugins/Gist');
var hljs = require('highlight.js');
var remarkableUtils = require('remarkable/lib/common/utils');
var escapeHtml = remarkableUtils.escapeHtml;
var replaceEntities = remarkableUtils.replaceEntities;
var unescapeMd = remarkableUtils.unescapeMd;

const md = new Remarkable({
    langPrefix: 'hljs language-',
    linkify: true,
    highlight (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str).value
            } catch (err) {}
        }

        try {
            return hljs.highlightAuto(str).value
        } catch (err) {}

        return '' // use external default escaping
    }
})

var sourceParse = Embed.prototype.parse

Embed.prototype.parse = function (state) {
    if (state.src.charCodeAt(state.pos) !== 123) {
        return false
    }
    return sourceParse.bind(this)(state)
}

Embed.prototype.render = function (tokens, idx, opts) {
    var token = tokens[idx]
    var plugin = token.content.plugin
    var meta = token.content.meta

    if (!this.plugins.hasOwnProperty(plugin)) {
        return meta
    }
    return this.plugins[plugin](meta, opts)
}

const vibloUrl = 'https://viblo.asia';

const embed = new Embed()

embed.register('vimeo', Vimeo)
embed.register('youtube', Youtube)
embed.register('codepen', Codepen)
embed.register('gist', Gist)
embed.register('slideshare', Slideshare)
embed.register('googleslide', GoogleSlides)

md.use(mentions({
    url: `${vibloUrl}/u`,
    reserved: ['youtube', 'vimeo', 'codepen', 'gist', 'slideshare', 'googleslide']
}))

md.use(embed.hook)

md.use(katex, {
    throwOnError: false
})

md.use((r) => {
    r.renderer.rules.image = (tokens, idx, options) => {
        var uri = escapeHtml(tokens[idx].src)
        var match = uri.match(new RegExp(`((?:${vibloUrl})*/uploads/)([a-f0-9\\-]{36}\\.jpg)`))
        var src = ` src="${uri}"`
        if (match !== null) {
            src += ` srcset="${match[1]}retina/${match[2]} 2x" data-lity-target="${match[1]}full/${match[2]}"`
        }
        var title = tokens[idx].title ? (' title="' + escapeHtml(replaceEntities(tokens[idx].title)) + '"') : ''
        var alt = ' alt="' + (tokens[idx].alt ? escapeHtml(replaceEntities(unescapeMd(tokens[idx].alt))) : '') + '"'
        var suffix = options.xhtmlOut ? ' /' : ''
        return '<img' + src + alt + title + suffix + '>'
    }
})

module.exports = md;
