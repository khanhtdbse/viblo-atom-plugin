var ref = require('atom');
var CompositeDisposable = ref.CompositeDisposable;
var Emitter = ref.Emitter;
var rafDebounce = require('./raf-debounce');
var StyleText = require('./style-text');
var TableView = require('./insert-table-view');
var EraserHelper = require('./eraser-helper');

(function() {
  module.exports = ToolBarView = (function() {

    function ToolBarView() {
      this.element = document.createElement('div');
      this.element.classList.add('viblo-tool-bar');
      this.items = [];
      this.emitter = new Emitter();
      this.subscriptions = new CompositeDisposable();
      this.drawGutter = rafDebounce(this.drawGutter.bind(this));
      this.subscriptions.add(this.drawGutter);
      this.element.addEventListener('scroll', this.drawGutter);
      window.addEventListener('resize', this.drawGutter);
      this.addBinding(this.element);
    }

    ToolBarView.prototype.addBinding = function(element) {
      atom.commands.add("atom-text-editor", 'markdown-toolbar:strikethrough', (function(_this){
        return function(e) {
          var styler = new StyleText('strikethrough');
          return styler.trigger(e);
        }
      })(this));

      atom.commands.add("atom-text-editor", 'markdown-toolbar:table', (function(_this){
        return function(e) {
          var insertTableDialog = new TableView();
          return insertTableDialog.display();
        }
      })(this));

      atom.commands.add("atom-text-editor", 'markdown-toolbar:esase', (function(_this){
        return function(e) {
          var eraser = new EraserHelper();
          eraser.trigger(e)
        }
      })(this));

    };
 

    ToolBarView.prototype.addItem = function(newItem) {
      newItem.priority = this.calculatePriority(newItem);

      if (atom.inDevMode()) {
        newItem.element.dataset.group = newItem.group;
        newItem.element.dataset.priority = newItem.priority;
      }

      var index = this.items.findIndex(function(existingItem) {
        return existingItem.priority > newItem.priority;
      });
      if (index === -1) {
        index = this.items.length;
      }
      const nextItem = this.items[index];

      this.items.splice(index, 0, newItem);

      this.element.insertBefore(
        newItem.element,
        nextItem ? nextItem.element : null
      );

      this.drawGutter();

      return nextItem;
    }

    ToolBarView.prototype.removeItem = function(item) {
      item.destroy();
      this.items.splice(this.items.indexOf(item), 1);
      this.drawGutter();
    }

    ToolBarView.prototype.destroy = function() {
      this.items.forEach(function(item) {
        item.destroy()
      });
      this.items = null;

      this.subscriptions.dispose();
      this.subscriptions = null;

      this.hide();
      this.element.removeEventListener('scroll', this.drawGutter);
      this.element = null;

      window.removeEventListener('resize', this.drawGutter);

      this.emitter.emit('did-destroy');
      this.emitter.dispose();
      this.emitter = null;
    }

    ToolBarView.prototype.calculatePriority = function(item) {
      if (!isNaN(item.priority)) {
        return item.priority;
      }
      const lastItem = this.items.filter(i => i.group !== item.group).pop();
      return lastItem && !isNaN(lastItem.priority)
        ? lastItem.priority + 1
        : 50;
    }

    ToolBarView.prototype.updateSize = function(size) {
      this.element.classList.remove(
        'tool-bar-12px',
        'tool-bar-16px',
        'tool-bar-24px',
        'tool-bar-32px'
      );
      this.element.classList.add(`tool-bar-${size}`);
    }

    ToolBarView.prototype.updatePosition = function(position) {
      this.element.classList.remove(
        'tool-bar-top',
        'tool-bar-right',
        'tool-bar-bottom',
        'tool-bar-left',
        'tool-bar-horizontal',
        'tool-bar-vertical'
      );

      this.panel = atom.workspace.addTopPanel({item: this.element});

      const classNames = [`tool-bar-${position.toLowerCase()}`, 'tool-bar-horizontal'];
      this.element.classList.add(...classNames);

      this.drawGutter();
    }

    ToolBarView.prototype.drawGutter = function() {
      this.element.classList.remove('gutter-top', 'gutter-bottom');

      const visibleHeight = this.element.offsetHeight;
      const scrollHeight = this.element.scrollHeight;
      const hiddenHeight = scrollHeight - visibleHeight;

      if (visibleHeight < scrollHeight) {
        if (this.element.scrollTop > 0) {
          this.element.classList.add('gutter-top');
        }
        if (this.element.scrollTop < hiddenHeight) {
          this.element.classList.add('gutter-bottom');
        }
      }
    }

    ToolBarView.prototype.hide = function() {
      if (this.panel != null) {
        if (this.element.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }
        this.panel.destroy();
        this.panel = null;
      }
    }

    ToolBarView.prototype.show = function() {
      this.hide();
      this.updatePosition('Top');
      this.updateSize('20px');
    }

    // ToolBarView.prototype.toggle = function() {
    //   atom.config.set('tool-bar.visible', !atom.config.get('tool-bar.visible'));
    // }

    return ToolBarView;

  })();
}).call(this);
