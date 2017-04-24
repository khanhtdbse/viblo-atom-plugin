(function() {
  var FormatText, LineMeta, config, utils;

  config = {
    tableExtraPipes: {},
    tableAlignment: 'left'
  };

  utils = require("./utils");

  LineMeta = require("./line-meta");

  module.exports = FormatText = (function() {
    function FormatText(action) {
      this.action = action;
      this.editor = atom.workspace.getActiveTextEditor();
    }

    FormatText.prototype.trigger = function(e) {
      var fn;
      fn = this.action.replace(/-[a-z]/ig, function(s) {
        return s[1].toUpperCase();
      });
      return this.editor.transact((function(_this) {
        return function() {
          var formattedText, paragraphRange, range, text;
          paragraphRange = _this.editor.getCurrentParagraphBufferRange();
          range = _this.editor.getSelectedBufferRange();
          if (paragraphRange) {
            range = paragraphRange.union(range);
          }
          if (range.start.row === range.end.row) {
            return;
          }
          text = _this.editor.getTextInBufferRange(range);
          if (text.trim() === "") {
            return;
          }
          text = text.split(/\r?\n/);
          formattedText = _this[fn](e, range, text);
          if (formattedText) {
            return _this.editor.setTextInBufferRange(range, formattedText);
          }
        };
      })(this));
    };

    FormatText.prototype.correctOrderListNumbers = function(e, range, lines) {
      var correctedLines, idx, indent, indentStack, j, len, line, lineMeta, orderStack;
      correctedLines = [];
      indentStack = [];
      orderStack = [];
      for (idx = j = 0, len = lines.length; j < len; idx = ++j) {
        line = lines[idx];
        lineMeta = new LineMeta(line);
        if (lineMeta.isList("ol")) {
          indent = lineMeta.indent;
          if (indentStack.length === 0 || indent.length > indentStack[0].length) {
            indentStack.unshift(indent);
            orderStack.unshift(lineMeta.defaultHead);
          } else if (indent.length < indentStack[0].length) {
            while (indentStack.length > 0 && indent.length !== indentStack[0].length) {
              indentStack.shift();
              orderStack.shift();
            }
            if (orderStack.length === 0) {
              indentStack.unshift(indent);
              orderStack.unshift(lineMeta.defaultHead);
            } else {
              orderStack.unshift(LineMeta.incStr(orderStack.shift()));
            }
          } else {
            orderStack.unshift(LineMeta.incStr(orderStack.shift()));
          }
          correctedLines[idx] = "" + indentStack[0] + orderStack[0] + ". " + lineMeta.body;
        } else {
          correctedLines[idx] = line;
        }
      }
      return correctedLines.join("\n");
    };

    FormatText.prototype.formatTable = function(e, range, lines) {
      var j, len, options, ref, ref1, row, rows, table;
      if (lines.some(function(line) {
        return line.trim() !== "" && !utils.isTableRow(line);
      })) {
        return;
      }
      ref = this._parseTable(lines), rows = ref.rows, options = ref.options;
      table = [];
      table.push(utils.createTableRow(rows[0], options).trimRight());
      table.push(utils.createTableSeparator(options));
      ref1 = rows.slice(1);
      for (j = 0, len = ref1.length; j < len; j++) {
        row = ref1[j];
        table.push(utils.createTableRow(row, options).trimRight());
      }
      return table.join("\n");
    };

    FormatText.prototype._parseTable = function(lines) {
      var columnWidth, i, j, k, len, len1, line, options, ref, row, rows, separator;
      rows = [];
      options = {
        numOfColumns: 1,
        extraPipes: config['tableExtraPipes'],
        columnWidth: 1,
        columnWidths: [],
        alignment: config['tableAlignment'],
        alignments: []
      };
      for (j = 0, len = lines.length; j < len; j++) {
        line = lines[j];
        if (line.trim() === "") {
          continue;
        } else if (utils.isTableSeparator(line)) {
          separator = utils.parseTableSeparator(line);
          options.extraPipes = options.extraPipes || separator.extraPipes;
          options.alignments = separator.alignments;
          options.numOfColumns = Math.max(options.numOfColumns, separator.columns.length);
        } else {
          row = utils.parseTableRow(line);
          rows.push(row.columns);
          options.numOfColumns = Math.max(options.numOfColumns, row.columns.length);
          ref = row.columnWidths;
          for (i = k = 0, len1 = ref.length; k < len1; i = ++k) {
            columnWidth = ref[i];
            options.columnWidths[i] = Math.max(options.columnWidths[i] || 0, columnWidth);
          }
        }
      }
      return {
        rows: rows,
        options: options
      };
    };

    return FormatText;

  })();

}).call(this);
