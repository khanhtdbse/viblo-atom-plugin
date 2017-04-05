(function() {
  var $, API_URL, VIBLO_URL, VibloAPI, DefaultRequestHeaders, request, fs;

  $ = require('jquery');
  VIBLO_URL = 'http://stg.viblo.asia';
  // VIBLO_URL = 'http://viblo.app';
  API_URL = VIBLO_URL+'/api';

  fs = require('fs-plus');

  module.exports = VibloAPI = (function(){
      function VibloAPI(postManager) {
        this.postManager = postManager;
      };

      VibloAPI.prototype.getServerHost = function(){
        return VIBLO_URL;
      },

      loadApiToken = function(callback) {
        var homeDir, vibloDir;
        homeDir = fs.getHomeDirectory();
        vibloDir = homeDir + '/.viblo';
        var tokenPath = vibloDir+'/api.token';
        if (fs.isFileSync(tokenPath)) {
          return fs.readFileSync(tokenPath);
        }
      }


      VibloAPI.prototype.getApiKey = function() {
        return loadApiToken();
      },

      VibloAPI.prototype.request = function(method, path, formData) {
        var _this = this;
        return new Promise(function(resolve) {
          var url;
          url = API_URL + path;
          return $.ajax(url, {
            beforeSend: function(xhr, settings) {
              xhr.setRequestHeader('Authorization', 'Bearer ' + _this.getApiKey());
              xhr.setRequestHeader('Accept', 'application/json');
            },
            data: formData,
            method: method,
            success: function(response) {
              var cached, data;
              data = response.data;
              cached = {
                data: data,
                createdOn: Date.now()
              };

              localStorage.setItem(_this.cacheKeyForPath(path), JSON.stringify(cached));
              return resolve(response);
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

      VibloAPI.prototype.cacheKeyForPath = function(path) {
        return 'viblo:' + path;
      };

      VibloAPI.prototype.fetchFromCache = function(path, options, callback) {
        var cached;
        if (!callback) {
          callback = options;
          options = {};
        }
        if (!options.force) {
          options.force = !this.online();
        }
        cached = localStorage.getItem(this.cacheKeyForPath(path));
        cached = cached ? JSON.parse(cached) : void 0;
        if ((cached != null) && (!this.online() || options.force || (Date.now() - cached.createdOn < this.expiry))) {
          if (cached == null) {
            cached = {
              data: {}
            };
          }
          return callback(null, cached.data);
        } else if ((cached == null) && !this.online()) {
          return callback(null, {});
        } else {
          return callback(null, null);
        }
      };

      VibloAPI.prototype.online = function() {
        return navigator.onLine;
      };

      return VibloAPI;
  })();

}).call(this);
