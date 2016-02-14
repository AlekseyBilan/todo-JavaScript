/*global document.querySelector, document.querySelectora, $on, $parent, $delegate */

(function (window) {
    'use strict';

    /**
     * View that abstracts away the browser's DOM completely.
     * It has two simple entry points:
     *
     *   - bind(eventName, handler)
     *     Takes a todo application event and registers the handler
     *   - render(command, parameterObject)
     *     Renders the given command with the options
     */
    function View(template) {
        this.template = template;

        this.ENTER_KEY = 13;
        this.ESCAPE_KEY = 27;

        this.$todoList = document.querySelector('.todo-list'); //document.querySelector || document.querySelectorAll
        this.$todoItemCounter = document.querySelector('.todo-count');
        this.$clearCompleted = document.querySelector('.clear-completed');
        this.$main = document.querySelector('.main');
        this.$footer = document.querySelector('.footer');
        this.$toggleAll = document.querySelector('.toggle-all');
        this.$newTodo = document.querySelector('.new-todo');
        this.$newDescription = document.querySelector('.new-description');
        this.$save = document.querySelector('.save');
    }

    View.prototype._removeItem = function (id) {
        var elem = document.querySelector('[data-id="' + id + '"]');

        if (elem) {
            this.$todoList.removeChild(elem);
        }
    };

    View.prototype._clearCompletedButton = function (completedCount, visible) {
        this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
        this.$clearCompleted.style.display = visible ? 'block' : 'none';
    };

    View.prototype._setFilter = function (currentPage) {
        document.querySelector('.filters .selected').className = '';
        document.querySelector('.filters [href="#/' + currentPage + '"]').className = 'selected';
    };

    View.prototype._elementComplete = function (id, completed) {
        var listItem = document.querySelector('[data-id="' + id + '"]');

        if (!listItem) {
            return;
        }

        listItem.className = completed ? 'completed' : '';

        // In case it was toggled from an event and not by clicking the checkbox
        document.querySelector('input', listItem).checked = completed;
    };

    View.prototype._editItem = function (id, title) {
        var listItem = document.querySelector('[data-id="' + id + '"]');

        if (!listItem) {
            return;
        }

        listItem.className = listItem.className + ' editing';

        var input = document.createElement('input');
        input.className = 'edit';

        listItem.appendChild(input);
        input.focus();
        input.value = title;
    };

    View.prototype._editItemDone = function (id, title) {
        var listItem = document.querySelector('[data-id="' + id + '"]');

        if (!listItem) {
            return;
        }

        var input = document.querySelector('input.edit', listItem);
        listItem.removeChild(input);

        listItem.className = listItem.className.replace('editing', '');

        listItem.querySelectorAll('label').forEach(function (label) {
            label.textContent = title;
        });
    };

    View.prototype.render = function (viewCmd, parameter) {
        var self = this;
        var viewCommands = {
            showEntries: function () {
                self.$todoList.innerHTML = self.template.show(parameter);
            },
            removeItem: function () {
                self._removeItem(parameter);
            },
            updateElementCount: function () {
                self.$todoItemCounter.innerHTML = self.template.itemCounter(parameter);
            },
            clearCompletedButton: function () {
                self._clearCompletedButton(parameter.completed, parameter.visible);
            },
            contentBlockVisibility: function () {
                self.$main.style.display = self.$footer.style.display = parameter.visible ? 'block' : 'none';
            },
            toggleAll: function () {
                self.$toggleAll.checked = parameter.checked;
            },
            setFilter: function () {
                self._setFilter(parameter);
            },
            clearNewTodo: function () {
                self.$newTodo.value = '';
                self.$newDescription.value = '';
            },
            elementComplete: function () {
                self._elementComplete(parameter.id, parameter.completed);
            },
            editItem: function () {
                self._editItem(parameter.id, parameter.title);
            },
            editItemDone: function () {
                self._editItemDone(parameter.id, parameter.title);
            }
        };

        viewCommands[viewCmd]();
    };

    View.prototype._itemId = function (element) {
        var li = $parent(element, 'li');
        return parseInt(li.dataset.id, 10);
    };

    View.prototype._bindItemEditDone = function (handler) {
        var self = this;
        $delegate(self.$todoList, 'li .edit', 'blur', function () {
            if (!this.dataset.iscanceled) {
                handler({
                    id: self._itemId(this),
                    title: this.value
                });
            }
        });

        $delegate(self.$todoList, 'li .edit', 'keypress', function (event) {
            if (event.keyCode === self.ENTER_KEY) {
                // Remove the cursor from the input when you hit enter just like if it
                // were a real form
                this.blur();
            }
        });
    };

    View.prototype._bindItemEditCancel = function (handler) {
        var self = this;
        $delegate(self.$todoList, 'li .edit', 'keyup', function (event) {
            if (event.keyCode === self.ESCAPE_KEY) {
                this.dataset.iscanceled = true;
                this.blur();

                handler({id: self._itemId(this)});
            }
        });
    };

    View.prototype.bind = function (event, handler) {
        var self = this;

        if (event === 'newTodo') {
            $on(self.$save, 'click', function () {
                handler(self.$newTodo.value, self.$newDescription.value);
            });


        } else if (event === 'removeCompleted') {
            $on(self.$clearCompleted, 'click', function () {
                handler();
            });

        } else if (event === 'toggleAll') {
            $on(self.$toggleAll, 'click', function () {
                handler({completed: this.checked});
            });

        } else if (event === 'itemEdit') {
            $delegate(self.$todoList, 'li label', 'dblclick', function () {
                handler({id: self._itemId(this)});
            });

        } else if (event === 'itemRemove') {
            $delegate(self.$todoList, '.destroy', 'click', function () {
                handler({id: self._itemId(this)});
            });

        } else if (event === 'itemToggle') {
            $delegate(self.$todoList, '.toggle', 'click', function () {
                handler({
                    id: self._itemId(this),
                    completed: this.checked
                });
            });

        } else if (event === 'itemEditDone') {
            self._bindItemEditDone(handler);

        } else if (event === 'itemEditCancel') {
            self._bindItemEditCancel(handler);
        }
    };

    // Export to window
    window.app = window.app || {};
    window.app.View = View;
}(window));
