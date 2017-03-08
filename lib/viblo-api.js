(function() {
  var $, API_URL, VIBLO_URL, VibloAPI, DefaultRequestHeaders, request;

  $ = require('jquery');
  // VIBLO_URL = 'http://stg.viblo.asia';
  VIBLO_URL = 'http://viblo.app';
  API_URL = VIBLO_URL+'/api';

  module.exports = VibloAPI = (function(){
      function VibloAPI(postManager) {
        this.postManager = postManager;
      };

      VibloAPI.prototype.getServerHost = function(){
        return VIBLO_URL;
      },

      VibloAPI.prototype.getApiKey = function() {
        return atom.config.get('viblo-atom-plugin.apiToken');
      },

      VibloAPI.prototype.getPublishPostURL = function(source) {
        return API_URL + "/publish/post";
      },

      VibloAPI.prototype.getAutosavePostURL = function(source) {
        return API_URL + "/publish/post/autosave";
      },

      VibloAPI.prototype.publish = function(post) {
        var _this = this;
        return new Promise(function(resolve) {
          var url;
          url = _this.getPublishPostURL();
          return $.ajax(url, {
            beforeSend: function(xhr, settings) {
              xhr.setRequestHeader('Authorization', 'Bearer ' + _this.getApiKey());
              xhr.setRequestHeader('Accept', 'application/json');
            },
            data: post,
            method: 'POST',
            success: function(data) {
              return resolve(data);
            },
            error: function(response) {
              if (response.status == 422 && typeof response.responseJSON !== 'undefined') {
                return resolve({
                  success: false,
                  errors: response.responseJSON
                });
              }
              return resolve({
                success: false,
                statusText: response.statusText
              });
            }
          });
        });
      }

      VibloAPI.prototype.draft = function(post) {
        var _this = this;
        return new Promise(function(resolve) {
          var url;
          url = _this.getAutosavePostURL();
          return $.ajax(url, {
            beforeSend: function(xhr, settings) {
              xhr.setRequestHeader('Authorization', 'Bearer ' + _this.getApiKey());
              xhr.setRequestHeader('Accept', 'application/json');
            },
            data: post,
            method: 'POST',
            success: function(data) {
              return resolve(data);
            },
            error: function(response) {
              if (response.status == 422 && typeof response.responseJSON !== 'undefined') {
                return resolve({
                  success: false,
                  errors: response.responseJSON
                });
              }
              return resolve({
                success: false,
                statusText: response.statusText
              });
            }
          });
        });
      }

      VibloAPI.prototype.request = function(method, path, data) {
        var _this = this;
        return new Promise(function(resolve) {
          var url;
          url = API_URL + path;
          return $.ajax(url, {
            beforeSend: function(xhr, settings) {
              xhr.setRequestHeader('Authorization', 'Bearer ' + _this.getApiKey());
              xhr.setRequestHeader('Accept', 'application/json');
            },
            data: data,
            method: method,
            success: function(data) {
              return resolve(data);
            },
            error: function(response) {
              if (response.status == 422 && typeof response.responseJSON !== 'undefined') {
                return resolve({
                  success: false,
                  errors: response.responseJSON
                });
              }
              return resolve({
                success: false,
                statusText: response.statusText
              });
            }
          });
        });
      }

      // VibloAPI.prototype.request = function(path, callback) {
      //   var options;
      //   if (request == null) {
      //     request = require('request');
      //   }
      //   options = {
      //     url: "" + API_URL + path,
      //     headers: {
      //       'Authorization' : 'Bearer ' + this.getApiKey(),
      //       'Accept' : 'application/json'
      //     }
      //   };
      //   return request(options, (function(_this) {
      //     return function(err, res, body) {
      //       var cached, data, error;
      //       try {
      //         data = JSON.parse(body);
      //       } catch (error1) {
      //         error = error1;
      //         return callback(error);
      //       }
      //       // cached = {
      //       //   data: data,
      //       //   createdOn: Date.now()
      //       // };
      //       // localStorage.setItem(_this.cacheKeyForPath(path), JSON.stringify(cached));
      //       return callback(err, data);
      //     };
      //   })(this));
      // };

      return VibloAPI;
  })();

}).call(this);
