(function() {
  var CollapsibleSectionPanel,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,

  CollapsibleSectionPanel = require('./collapsible-section-panel');

  module.exports = AboutPanel = (function(superClass) {
    extend(AboutPanel, superClass);

    function AboutPanel() {
      return AboutPanel.__super__.constructor.apply(this, arguments);
    }

    AboutPanel.content = function() {
      return this.div({
        "class": 'panels-item about-panel'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'section'
          }, function() {
            _this.div({
              "class": 'section-container text-center'
            }, function() {
              _this.h1({
                "class": 'section-heading',
                "title": 'Feel the Power'
              }, function() {
                _this.p({}, function() {
                  _this.span({'class': 'icon icon-viblo'});
                });
                _this.text('Viblo');
              });
            });
            _this.div({
              "class": 'section-container text-center'
            }, function() {
              _this.h2({}, function() {
                _this.span({'class':'icon icon-quote-left'},'');
                _this.text('Free service for technical knowledge sharing ');
                _this.span({'class':'icon icon-quote-right'},'');
              });
            });
            _this.div({
              'class' : 'about-footer'
            }, function() {
                _this.div({
                  'class' : 'about-links text-center'
                }, function() {
                  _this.h3({}, function() {
                    _this.span({'class':'icon icon-facebook-official'},'');
                    _this.a({
                      'href' : 'https://www.facebook.com/codewar.framgia/'
                    }, function() {
                      _this.text('Facebook Funpage');
                    });
                  })

                  _this.h3({}, function() {
                    _this.span({'class':'icon icon-home'},'');
                    _this.text('Homepage: ');
                    _this.a({
                      'href' : 'https://viblo.asia'
                    }, function() {
                      _this.text('https://viblo.asia');
                    });
                  })

                  _this.h3({}, function() {
                    _this.text('Atom Plugin ')
                    _this.span({'class':'icon icon-code'},'');
                    _this.text(' with ');
                    _this.span({'class':'icon icon-heart'},'');
                    _this.text(' by ')
                    _this.a({
                      'href' : 'https://viblo.asia'
                    }, function() {
                      _this.text('Viblo Team');
                    });
                  })
                })
            })
          });
          _this.section({'class':'section'}, ' ');
        };
      })(this));
    };

    AboutPanel.prototype.initialize = function() {
    };

    return AboutPanel;

  })(CollapsibleSectionPanel);

}).call(this);
