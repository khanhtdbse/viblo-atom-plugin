(function() {
  var CompositeDisposable,
  PostCard,
  View,
  marked,
  shell,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  View = require('atom-space-pen-views').View;

  CompositeDisposable = require('atom').CompositeDisposable;

  shell = require('electron').shell;

  marked = null;


  module.exports = PostCard = (function(superClass) {
    extend(PostCard, superClass);

    function PostCard() {
      return PostCard.__super__.constructor.apply(this, arguments);
    }

    PostCard.content = function(arg) {
      var description, displayName, gitUrlInfo, name, owner, ref, repository, version;
      name = arg.name, description = arg.description, version = arg.version, repository = arg.repository, gitUrlInfo = arg.gitUrlInfo;
      displayName = (ref = (gitUrlInfo ? gitUrlInfo.project : name)) != null ? ref : '';
      if (description == null) {
        description = '';
      }
      return this.div({
        "class": 'post-card col-lg-8'
      }, (function(_this) {
        return function() {
        };
      })(this));
    };

    PostCard.prototype.initialize = function(post, postManager, options) {
      var ref;
      this.post = post;
      this.postManager = postManager;
      if (options == null) {
        options = {};
      }
      this.disposables = new CompositeDisposable();
      this.client = this.postManager.getClient();
      this.type = this.post.theme ? 'theme' : 'package';
      this.name = this.post.name;
      this.onSettingsView = options != null ? options.onSettingsView : void 0;
      if (this.post.latestVersion !== this.post.version) {
        this.newVersion = this.post.latestVersion;
      }
      if (((ref = this.post.apmInstallSource) != null ? ref.type : void 0) === 'git') {
        if (this.post.apmInstallSource.sha !== this.post.latestSha) {
          this.newSha = this.post.latestSha;
        }
      }
      if (!(options != null ? options.stats : void 0)) {
        options.stats = {
          downloads: true
        };
      }
      this.displayStats(options);
      this.handlePackageEvents();
      this.handleButtonEvents(options);
      this.loadCachedMetadata();
      this.postManager.on('click', 'a', function() {
        var href;
        href = this.getAttribute('href');
        if (href != null ? href.startsWith('atom:') : void 0) {
          atom.workspace.open(href);
          return false;
        }
      });

      if (atom.packages.isBundledPackage(this.post.name)) {
        this.installButtonGroup.remove();
        this.uninstallButton.remove();
      }
      if (!(this.newVersion || this.newSha)) {
        this.updateButtonGroup.hide();
      }
      this.hasCompatibleVersion = true;
      return this.updateInterfaceState();
    };

    PostCard.prototype.locateCompatiblePackageVersion = function(callback) {
      return this.postManager.loadCompatiblePackageVersion(this.post.name, (function(_this) {
        return function(err, pack) {
          var packageVersion;
          if (err != null) {
            return console.error(err);
          }
          packageVersion = pack.version;
          if (packageVersion) {
            _this.versionValue.text(packageVersion);
            if (packageVersion !== _this.post.version) {
              _this.versionValue.addClass('text-warning');
              _this.postManager.addClass('text-warning');
              _this.postManager.text("Version " + packageVersion + " is not the latest version available for this package, but it's the latest that is compatible with your version of Atom.");
            }
            _this.installablePack = pack;
            _this.hasCompatibleVersion = true;
          } else {
            _this.hasCompatibleVersion = false;
            _this.versionValue.addClass('text-error');
            _this.postManager.addClass('text-error');
            _this.postManager.append("There's no version of this package that is compatible with your Atom version. The version must satisfy " + _this.post.engines.atom + ".");
            console.error("No available version compatible with the installed Atom version: " + (atom.getVersion()));
          }
          return callback();
        };
      })(this));
    };

    PostCard.prototype.handleButtonEvents = function(options) {
    };

    PostCard.prototype.dispose = function() {
      return this.disposables.dispose();
    };

    PostCard.prototype.loadCachedMetadata = function() {
      this.client.avatar(ownerFromRepository(this.post.repository), (function(_this) {
        return function(err, avatarPath) {
          if (avatarPath) {
            return _this.avatar.attr('src', "file://" + avatarPath);
          }
        };
      })(this));
      return this.client["package"](this.post.name, (function(_this) {
        return function(err, data) {
          var ref, ref1, ref2;
          if (!err) {
            if (data == null) {
              data = {};
            }
            if (((ref = _this.post.apmInstallSource) != null ? ref.type : void 0) === 'git') {
              _this.downloadIcon.removeClass('icon-cloud-download');
              _this.downloadIcon.addClass('icon-git-branch');
              return _this.downloadCount.text(_this.post.apmInstallSource.sha.substr(0, 8));
            } else {
              _this.stargazerCount.text((ref1 = data.stargazers_count) != null ? ref1.toLocaleString() : void 0);
              return _this.downloadCount.text((ref2 = data.downloads) != null ? ref2.toLocaleString() : void 0);
            }
          }
        };
      })(this));
    };

    PostCard.prototype.updateInterfaceState = function() {
      var ref, ref1, ref2;
      this.versionValue.text((ref = (ref1 = this.installablePack) != null ? ref1.version : void 0) != null ? ref : this.post.version);
      if (((ref2 = this.post.apmInstallSource) != null ? ref2.type : void 0) === 'git') {
        this.downloadCount.text(this.post.apmInstallSource.sha.substr(0, 8));
      }
      this.updateSettingsState();
      this.updateInstalledState();
      this.updateDisabledState();
      return this.updateDeprecatedState();
    };

    PostCard.prototype.updateSettingsState = function() {
      if (this.hasSettings() && !this.onSettingsView) {
        return this.settingsButton.show();
      } else {
        return this.settingsButton.hide();
      }
    };

    PostCard.prototype.updateDisabledState = function() {
      if (this.isDisabled()) {
        return this.displayDisabledState();
      } else if (this.hasClass('disabled')) {
        return this.displayEnabledState();
      }
    };

    PostCard.prototype.displayEnabledState = function() {
      this.removeClass('disabled');
      if (this.type === 'theme') {
        this.enablementButton.hide();
      }
      this.enablementButton.find('.disable-text').text('Disable');
      this.enablementButton.addClass('icon-playback-pause').removeClass('icon-playback-play');
      return this.statusIndicator.removeClass('is-disabled');
    };

    PostCard.prototype.displayDisabledState = function() {
      this.addClass('disabled');
      this.enablementButton.find('.disable-text').text('Enable');
      this.enablementButton.addClass('icon-playback-play').removeClass('icon-playback-pause');
      this.statusIndicator.addClass('is-disabled');
      if (this.isDeprecated()) {
        return this.enablementButton.prop('disabled', true);
      } else {
        return this.enablementButton.prop('disabled', false);
      }
    };

    PostCard.prototype.updateInstalledState = function() {
      if (this.isInstalled()) {
        return this.displayInstalledState();
      } else {
        return this.displayNotInstalledState();
      }
    };

    PostCard.prototype.displayInstalledState = function() {
      if (this.newVersion || this.newSha) {
        this.updateButtonGroup.show();
        if (this.newVersion) {
          this.updateButton.text("Update to " + this.newVersion);
        } else if (this.newSha) {
          this.updateButton.text("Update to " + (this.newSha.substr(0, 8)));
        }
      } else {
        this.updateButtonGroup.hide();
      }
      this.installButtonGroup.hide();
      this.installAlternativeButtonGroup.hide();
      this.postageActionButtonGroup.show();
      return this.uninstallButton.show();
    };

    PostCard.prototype.displayNotInstalledState = function() {
      var atomVersion;
      this.uninstallButton.hide();
      atomVersion = this.postManager.normalizeVersion(atom.getVersion());
      if (!this.postManager.satisfiesVersion(atomVersion, this.post)) {
        this.hasCompatibleVersion = false;
        this.setNotInstalledStateButtons();
        return this.locateCompatiblePackageVersion((function(_this) {
          return function() {
            return _this.setNotInstalledStateButtons();
          };
        })(this));
      } else {
        return this.setNotInstalledStateButtons();
      }
    };

    PostCard.prototype.setNotInstalledStateButtons = function() {
      if (!this.hasCompatibleVersion) {
        this.installButtonGroup.hide();
        this.updateButtonGroup.hide();
      } else if (this.newVersion || this.newSha) {
        this.updateButtonGroup.show();
        this.installButtonGroup.hide();
      } else {
        this.updateButtonGroup.hide();
        this.installButtonGroup.show();
      }
      this.installAlternativeButtonGroup.hide();
      return this.postageActionButtonGroup.hide();
    };

    PostCard.prototype.updateDeprecatedState = function() {
      if (this.isDeprecated()) {
        return this.displayDeprecatedState();
      } else if (this.hasClass('deprecated')) {
        return this.displayUndeprecatedState();
      }
    };

    PostCard.prototype.displayStats = function(options) {
      var ref, ref1;
      if (options != null ? (ref = options.stats) != null ? ref.downloads : void 0 : void 0) {
        this.postageDownloads.show();
      } else {
        this.postageDownloads.hide();
      }
      if (options != null ? (ref1 = options.stats) != null ? ref1.stars : void 0 : void 0) {
        return this.packagestars.show();
      } else {
        return this.packagestars.hide();
      }
    };

    PostCard.prototype.displayUndeprecatedState = function() {
      this.removeClass('deprecated');
      this.postManager.removeClass('text-warning');
      return this.postManager.text('');
    };

    PostCard.prototype.displayDeprecatedState = function() {
      var alt, info, isInstalled, message, ref;
      this.addClass('deprecated');
      this.settingsButton[0].disabled = true;
      info = this.getDeprecatedPackageMetadata();
      this.postManager.addClass('text-warning');
      message = null;
      if (info != null ? info.hasDeprecations : void 0) {
        message = this.getDeprecationMessage(this.newVersion);
      } else if ((info != null ? info.hasAlternative : void 0) && (info != null ? info.alternative : void 0) && (info != null ? info.alternative : void 0) === 'core') {
        message = (ref = info.message) != null ? ref : "The features in `" + this.post.name + "` have been added to core.";
        message += ' Please uninstall this package.';
        this.settingsButton.remove();
        this.enablementButton.remove();
      } else if ((info != null ? info.hasAlternative : void 0) && (alt = info != null ? info.alternative : void 0)) {
        isInstalled = this.isInstalled();
        if (isInstalled && this.postManager.isPackageInstalled(alt)) {
          message = "`" + this.post.name + "` has been replaced by `" + alt + "` which is already installed. Please uninstall this package.";
          this.settingsButton.remove();
          this.enablementButton.remove();
        } else if (isInstalled) {
          message = "`" + this.post.name + "` has been replaced by [`" + alt + "`](atom://config/install/package:" + alt + ").";
          this.installAlternativeButton.text("Install " + alt);
          this.installAlternativeButtonGroup.show();
          this.postageActionButtonGroup.show();
          this.settingsButton.remove();
          this.enablementButton.remove();
        } else {
          message = "`" + this.post.name + "` has been replaced by [`" + alt + "`](atom://config/install/package:" + alt + ").";
          this.installButtonGroup.hide();
          this.installAlternativeButtonGroup.hide();
          this.postageActionButtonGroup.hide();
        }
      }
      if (message != null) {
        if (marked == null) {
          marked = require('marked');
        }
        return this.postManager.html(marked(message));
      }
    };

    PostCard.prototype.displayGitPackageInstallInformation = function() {
      var gitUrlInfo;
      this.metaUserContainer.remove();
      this.statsContainer.remove();
      gitUrlInfo = this.post.gitUrlInfo;
      if (gitUrlInfo["default"] === 'shortcut') {
        this.postageDescription.text(gitUrlInfo.https());
      } else {
        this.postageDescription.text(gitUrlInfo.toString());
      }
      this.installButton.removeClass('icon-cloud-download');
      this.installButton.addClass('icon-git-commit');
      this.updateButton.removeClass('icon-cloud-download');
      return this.updateButton.addClass('icon-git-commit');
    };

    PostCard.prototype.displayAvailableUpdate = function(newVersion1) {
      this.newVersion = newVersion1;
      return this.updateInterfaceState();
    };

    PostCard.prototype.getDeprecationMessage = function(newVersion) {
      var info, ref;
      info = this.getDeprecatedPackageMetadata();
      if (!(info != null ? info.hasDeprecations : void 0)) {
        return;
      }
      if (newVersion) {
        if (this.isDeprecated(newVersion)) {
          return "An update to `v" + newVersion + "` is available but still contains deprecations.";
        } else {
          return "An update to `v" + newVersion + "` is available without deprecations.";
        }
      } else {
        if (this.isInstalled()) {
          return (ref = info.message) != null ? ref : 'This package has not been loaded due to using deprecated APIs. There is no update available.';
        } else {
          return 'This package has deprecations and is not installable.';
        }
      }
    };

    PostCard.prototype.handlePackageEvents = function() {
      this.disposables.add(atom.packages.onDidDeactivatePackage((function(_this) {
        return function(pack) {
          if (pack.name === _this.post.name) {
            return _this.updateDisabledState();
          }
        };
      })(this)));
      this.disposables.add(atom.packages.onDidActivatePackage((function(_this) {
        return function(pack) {
          if (pack.name === _this.post.name) {
            return _this.updateDisabledState();
          }
        };
      })(this)));
      this.disposables.add(atom.config.onDidChange('core.disabledPackages', (function(_this) {
        return function() {
          return _this.updateDisabledState();
        };
      })(this)));
      this.subscribeToPackageEvent('package-installing theme-installing', (function(_this) {
        return function() {
          _this.updateInterfaceState();
          _this.installButton.prop('disabled', true);
          return _this.installButton.addClass('is-installing');
        };
      })(this));
      this.subscribeToPackageEvent('package-updating theme-updating', (function(_this) {
        return function() {
          _this.updateInterfaceState();
          _this.updateButton.prop('disabled', true);
          return _this.updateButton.addClass('is-installing');
        };
      })(this));
      this.subscribeToPackageEvent('package-installing-alternative', (function(_this) {
        return function() {
          _this.updateInterfaceState();
          _this.installAlternativeButton.prop('disabled', true);
          return _this.installAlternativeButton.addClass('is-installing');
        };
      })(this));
      this.subscribeToPackageEvent('package-uninstalling theme-uninstalling', (function(_this) {
        return function() {
          _this.updateInterfaceState();
          _this.enablementButton.prop('disabled', true);
          _this.uninstallButton.prop('disabled', true);
          return _this.uninstallButton.addClass('is-uninstalling');
        };
      })(this));
      this.subscribeToPackageEvent('package-installed package-install-failed theme-installed theme-install-failed', (function(_this) {
        return function() {
          var ref, ref1, version;
          if (version = (ref = atom.packages.getLoadedPackage(_this.post.name)) != null ? (ref1 = ref.metadata) != null ? ref1.version : void 0 : void 0) {
            _this.post.version = version;
          }
          _this.installButton.prop('disabled', false);
          _this.installButton.removeClass('is-installing');
          return _this.updateInterfaceState();
        };
      })(this));
      this.subscribeToPackageEvent('package-updated theme-updated', (function(_this) {
        return function() {
          var apmInstallSource, metadata, ref, version;
          metadata = (ref = atom.packages.getLoadedPackage(_this.post.name)) != null ? ref.metadata : void 0;
          if (version = metadata != null ? metadata.version : void 0) {
            _this.post.version = version;
          }
          if (apmInstallSource = metadata != null ? metadata.apmInstallSource : void 0) {
            _this.post.apmInstallSource = apmInstallSource;
          }
          _this.newVersion = null;
          _this.newSha = null;
          _this.updateButton.prop('disabled', false);
          _this.updateButton.removeClass('is-installing');
          return _this.updateInterfaceState();
        };
      })(this));
      this.subscribeToPackageEvent('package-update-failed theme-update-failed', (function(_this) {
        return function() {
          _this.updateButton.prop('disabled', false);
          _this.updateButton.removeClass('is-installing');
          return _this.updateInterfaceState();
        };
      })(this));
      this.subscribeToPackageEvent('package-uninstalled package-uninstall-failed theme-uninstalled theme-uninstall-failed', (function(_this) {
        return function() {
          _this.newVersion = null;
          _this.newSha = null;
          _this.enablementButton.prop('disabled', false);
          _this.uninstallButton.prop('disabled', false);
          _this.uninstallButton.removeClass('is-uninstalling');
          return _this.updateInterfaceState();
        };
      })(this));
      return this.subscribeToPackageEvent('package-installed-alternative package-install-alternative-failed', (function(_this) {
        return function() {
          _this.installAlternativeButton.prop('disabled', false);
          _this.installAlternativeButton.removeClass('is-installing');
          return _this.updateInterfaceState();
        };
      })(this));
    };

    PostCard.prototype.isInstalled = function() {
      return this.postManager.isPackageInstalled(this.post.name);
    };

    PostCard.prototype.isDisabled = function() {
      return atom.packages.isPackageDisabled(this.post.name);
    };

    PostCard.prototype.isDeprecated = function(version) {
      return atom.packages.isDeprecatedPackage(this.post.name, version != null ? version : this.post.version);
    };

    PostCard.prototype.getDeprecatedPackageMetadata = function() {
      return atom.packages.getDeprecatedPackageMetadata(this.post.name);
    };

    PostCard.prototype.hasSettings = function() {
      return this.postManager.postageHasSettings(this.post.name);
    };

    PostCard.prototype.subscribeToPackageEvent = function(event, callback) {
      return this.disposables.add(this.postManager.on(event, (function(_this) {
        return function(arg) {
          var error, pack, packageName;
          pack = arg.post, error = arg.error;
          if (pack.post != null) {
            pack = pack.post;
          }
          packageName = pack.name;
          if (packageName === _this.post.name) {
            return callback(pack, error);
          }
        };
      })(this)));
    };


    /*
    Section: Methods that should be on a Package model
     */

    PostCard.prototype.install = function() {
      var ref;
      return this.postManager.install((ref = this.installablePack) != null ? ref : this.post, (function(_this) {
        return function(error) {
          var ref1;
          if (error != null) {
            return console.error("Installing " + _this.type + " " + _this.post.name + " failed", (ref1 = error.stack) != null ? ref1 : error, error.stderr);
          } else {
            if (_this.isDisabled()) {
              return atom.packages.enablePackage(_this.post.name);
            }
          }
        };
      })(this));
    };

    PostCard.prototype.update = function() {
      var pack, ref, version;
      if (!(this.newVersion || this.newSha)) {
        return;
      }
      pack = (ref = this.installablePack) != null ? ref : this.post;
      version = this.newVersion ? "v" + this.newVersion : "#" + (this.newSha.substr(0, 8));
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return _this.postManager.update(pack, _this.newVersion, function(error) {
            var ref1;
            if (error != null) {
              atom.assert(false, "Package update failed", function(assertionError) {
                return assertionError.metadata = {
                  type: _this.type,
                  name: pack.name,
                  version: version,
                  errorMessage: error.message,
                  errorStack: error.stack,
                  errorStderr: error.stderr
                };
              });
              console.error("Updating " + _this.type + " " + pack.name + " to " + version + " failed:\n", error, (ref1 = error.stderr) != null ? ref1 : '');
              return reject(error);
            } else {
              return resolve();
            }
          });
        };
      })(this));
    };

    PostCard.prototype.uninstall = function() {
      return this.postManager.uninstall(this.post, (function(_this) {
        return function(error) {
          var ref;
          if (error != null) {
            return console.error("Uninstalling " + _this.type + " " + _this.post.name + " failed", (ref = error.stack) != null ? ref : error, error.stderr);
          }
        };
      })(this));
    };

    PostCard.prototype.installAlternative = function() {
      var alternative, loadedPack, metadata;
      metadata = this.getDeprecatedPackageMetadata();
      loadedPack = atom.packages.getLoadedPackage(metadata != null ? metadata.alternative : void 0);
      if (!((metadata != null ? metadata.hasAlternative : void 0) && metadata.alternative !== 'core' && !loadedPack)) {
        return;
      }
      alternative = metadata.alternative;
      return this.postManager.installAlternative(this.post, alternative, (function(_this) {
        return function(error, arg) {
          var alternative, pack, ref;
          pack = arg.post, alternative = arg.alternative;
          if (error != null) {
            return console.error("Installing alternative `" + alternative + "` " + _this.type + " for " + _this.post.name + " failed", (ref = error.stack) != null ? ref : error, error.stderr);
          }
        };
      })(this));
    };

    return PostCard;

  })(View);

}).call(this);
