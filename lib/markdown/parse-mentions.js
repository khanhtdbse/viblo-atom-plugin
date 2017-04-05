let render = (tokens, index, options) => {
    let token = tokens[index]
    return `<a href="${options.mention.url}/${token.username}">@${token.username}</a>`
}

let checkPrecedingChar = (src, pos) => {
    if (pos === 0) {
        return true
    }

    let char = src.charAt(pos - 1)

    return /[\s.,;:]/.test(char)
}

let token = (username, state) => ({
    type: 'mention',
    username,
    block: false,
    level: state.level
})

let reserved = (word, reserved) => reserved.length > 0 && reserved.includes(word)

let parser = (md, options) => (state) => {
    if (state.src.charAt(state.pos) !== '@' || !checkPrecedingChar(state.src, state.pos)) {
        return false
    }

    let text = state.src.slice(state.pos)
    let matches = /^@([\w_.\\-]{3,255})\b/.exec(text)

    if (!matches || reserved(matches[1], options.reserved)) {
        return false
    }

    state.pos += matches[0].length
    state.push(token(matches[1], state))

    return true
}

module.exports = (options) => (md) => {
    options.url = options.url || ''
    options.reserved = options.reserved || []
    md.options.mention = options

    md.inline.ruler.push('mention', parser(md, options), {alt: []})
    md.renderer.rules.mention = render
}
