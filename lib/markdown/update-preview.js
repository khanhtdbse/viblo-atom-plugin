(function() {
  "use strict";
  var UpdatePreview, WrappedDomTree, prepareCodeBlocksForAtomEditors, renderer;

  WrappedDomTree = require('./wrapped-dom-tree');

  renderer = require('./renderer');

  module.exports = UpdatePreview = (function() {
    function UpdatePreview(dom) {
      this.tree = new WrappedDomTree(dom, true);
      this.domFragment = document.createDocumentFragment();
    }

    UpdatePreview.prototype.update = function(domFragment, renderLaTeX) {
      var elm, firstTime, j, len, newDom, newTree, r, ref;
      // prepareCodeBlocksForAtomEditors(domFragment);
      if (domFragment.isEqualNode(this.domFragment)) {
        return;
      }
      firstTime = this.domFragment.childElementCount === 0;
      this.domFragment = domFragment.cloneNode(true);
      newDom = document.createElement("div");
      newDom.className = "update-preview";
      newDom.appendChild(domFragment);
      newTree = new WrappedDomTree(newDom);
      r = this.tree.diffTo(newTree);
      newTree.removeSelf();
      if (firstTime) {
        r.possibleReplace = null;
        r.last = null;
      }
      this.updateOrderedListsStart();
      return r;
    };

    UpdatePreview.prototype.updateOrderedListsStart = function() {
      var i, j, parsedOLs, parsedStart, previewOLs, previewStart, ref;
      previewOLs = this.tree.shownTree.dom.querySelectorAll('ol');
      parsedOLs = this.domFragment.querySelectorAll('ol');
      for (i = j = 0, ref = parsedOLs.length - 1; j <= ref; i = j += 1) {
        previewStart = previewOLs[i].getAttribute('start');
        parsedStart = parsedOLs[i].getAttribute('start');
        if (previewStart === parsedStart) {
          continue;
        } else if (parsedStart != null) {
          previewOLs[i].setAttribute('start', parsedStart);
        } else {
          previewOLs[i].removeAttribute('start');
        }
      }
    };

    return UpdatePreview;

  })();

  prepareCodeBlocksForAtomEditors = function(domFragment) {
    var j, len, preElement, preWrapper, ref;
    ref = domFragment.querySelectorAll('pre');
    for (j = 0, len = ref.length; j < len; j++) {
      preElement = ref[j];
      preWrapper = document.createElement('span');
      preWrapper.className = 'atom-text-editor';
      preElement.parentNode.insertBefore(preWrapper, preElement);
      preWrapper.appendChild(preElement);
    }
    return domFragment;
  };

}).call(this);
