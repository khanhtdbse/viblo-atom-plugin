(function() {
  var BLOCKQUOTE_REGEX, LIST_AL_REGEX, LIST_AL_TASK_REGEX, LIST_OL_REGEX, LIST_OL_TASK_REGEX, LIST_UL_REGEX, LIST_UL_TASK_REGEX, LineMeta, TYPES, incStr, utils;

  utils = require("./utils");

  LIST_UL_TASK_REGEX = /^(\s*)([*+-\.])\s+\[[xX ]\]\s*(.*)$/;

  LIST_UL_REGEX = /^(\s*)([*+-\.])\s+(.*)$/;

  LIST_OL_TASK_REGEX = /^(\s*)(\d+)\.\s+\[[xX ]\]\s*(.*)$/;

  LIST_OL_REGEX = /^(\s*)(\d+)\.\s+(.*)$/;

  LIST_AL_TASK_REGEX = /^(\s*)([a-zA-Z]+)\.\s+\[[xX ]\]\s*(.*)$/;

  LIST_AL_REGEX = /^(\s*)([a-zA-Z]+)\.\s+(.*)$/;

  BLOCKQUOTE_REGEX = /^(\s*)(>)\s*(.*)$/;

  incStr = function(str) {
    var num;
    num = parseInt(str, 10);
    if (isNaN(num)) {
      return utils.incrementChars(str);
    } else {
      return num + 1;
    }
  };

  TYPES = [
    {
      name: ["list", "ul", "task"],
      regex: LIST_UL_TASK_REGEX,
      nextLine: function(matches) {
        return "" + matches[1] + matches[2] + " [ ] ";
      },
      defaultHead: function(head) {
        return head;
      }
    }, {
      name: ["list", "ul"],
      regex: LIST_UL_REGEX,
      nextLine: function(matches) {
        return "" + matches[1] + matches[2] + " ";
      },
      defaultHead: function(head) {
        return head;
      }
    }, {
      name: ["list", "ol", "task"],
      regex: LIST_OL_TASK_REGEX,
      nextLine: function(matches) {
        return "" + matches[1] + (incStr(matches[2])) + ". [ ] ";
      },
      defaultHead: function(head) {
        return "1";
      }
    }, {
      name: ["list", "ol"],
      regex: LIST_OL_REGEX,
      nextLine: function(matches) {
        return "" + matches[1] + (incStr(matches[2])) + ". ";
      },
      defaultHead: function(head) {
        return "1";
      }
    }, {
      name: ["list", "ol", "al", "task"],
      regex: LIST_AL_TASK_REGEX,
      nextLine: function(matches) {
        return "" + matches[1] + (incStr(matches[2])) + ". [ ] ";
      },
      defaultHead: function(head) {
        var c;
        c = utils.isUpperCase(head) ? "A" : "a";
        return head.replace(/./g, c);
      }
    }, {
      name: ["list", "ol", "al"],
      regex: LIST_AL_REGEX,
      nextLine: function(matches) {
        return "" + matches[1] + (incStr(matches[2])) + ". ";
      },
      defaultHead: function(head) {
        var c;
        c = utils.isUpperCase(head) ? "A" : "a";
        return head.replace(/./g, c);
      }
    }, {
      name: ["blockquote"],
      regex: BLOCKQUOTE_REGEX,
      nextLine: function(matches) {
        return matches[1] + "> ";
      },
      defaultHead: function(head) {
        return ">";
      }
    }
  ];

  module.exports = LineMeta = (function() {
    function LineMeta(line) {
      this.line = line;
      this.type = void 0;
      this.head = "";
      this.defaultHead = "";
      this.body = "";
      this.indent = "";
      this.nextLine = "";
      this._findMeta();
    }

    LineMeta.prototype._findMeta = function() {
      var i, len, matches, results, type;
      results = [];
      for (i = 0, len = TYPES.length; i < len; i++) {
        type = TYPES[i];
        if (matches = type.regex.exec(this.line)) {
          this.type = type;
          this.indent = matches[1];
          this.head = matches[2];
          this.defaultHead = type.defaultHead(matches[2]);
          this.body = matches[3];
          this.nextLine = type.nextLine(matches);
          break;
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    LineMeta.prototype.isTaskList = function() {
      return this.type && this.type.name.indexOf("task") !== -1;
    };

    LineMeta.prototype.isList = function(type) {
      return this.type && this.type.name.indexOf("list") !== -1 && (!type || this.type.name.indexOf(type) !== -1);
    };

    LineMeta.prototype.isContinuous = function() {
      return !!this.nextLine;
    };

    LineMeta.prototype.isEmptyBody = function() {
      return !this.body;
    };

    LineMeta.isList = function(line) {
      return LIST_UL_REGEX.test(line) || LIST_OL_REGEX.test(line) || LIST_AL_REGEX.test(line);
    };

    LineMeta.isOrderedList = function(line) {
      return LIST_OL_REGEX.test(line) || LIST_AL_REGEX.test(line);
    };

    LineMeta.isUnorderedList = function(line) {
      return LIST_UL_REGEX.test(line);
    };

    LineMeta.incStr = incStr;

    return LineMeta;

  })();

}).call(this);
