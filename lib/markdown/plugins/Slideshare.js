var _ = require('lodash');
var VibloAPI = require('../../viblo-api');
var vibloAPI = new VibloAPI();
var rp = require('request-promise');
var $ = require('jquery');

var getSlideshareContent = (url) => {
    var options = {
        method: 'GET',
        uri: vibloAPI.getServerHost() + '/api/embed/slideshare',
        qs: {
            url: url
        },
        headers: {
          'Authorization': 'Bearer ' + vibloAPI.getApiKey(),
          'Accept' : 'application/json'
        },
        json: true
    };
    rp(options).then((response) => {
      if (!response) {
        return;
      }
        var frame = $('<div class="embed-responsive embed-responsive-16by9"></div>')
            .html($($(response.html)[0]).addClass('embed-responsive-item'))
        _.delay(() => {
            $('code[data-slideshare-id="' + url + '"]').replaceWith(frame);
        }, 500)
    }).catch((err) => {
      console.log(err);
    });
};

module.exports = (code) => {
    if (!code.startsWith('http://www.slideshare.net/')) {
        code = 'http://www.slideshare.net/slideshow/embed_code/' + code
    }

    getSlideshareContent(code);

    return '<code data-slideshare-id="' + code + '"><span class="loading loading-spinner-tiny inline-block"></span> Loading Slideshare slides...</code>'
}
