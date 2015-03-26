/**
 * @jsx React.DOM
 */

var React = require('react');
var joinClasses = require('react/lib/joinClasses');

var KEY_CODES = {
  ENTER: 13,
  BACKSPACE: 8
};

var DefaultTagComponent = React.createClass({
  render: function () {
    var self = this, p = self.props;

    return (
      <div className={joinClasses("tag", p.classes)}>
        <div className="tag-text" onClick={p.onEdit}>{p.item}</div>
        <div className="remove" onClick={p.onRemove}>
          {p.removeTagLabel}
        </div>
      </div>
      );
  }

});

var TaggedInput = React.createClass({
  propTypes: {
    onBeforeAddTag: React.PropTypes.func,
    onAddTag: React.PropTypes.func,
    onBeforeRemoveTag: React.PropTypes.func,
    onRemoveTag: React.PropTypes.func,
    onEnter: React.PropTypes.func,
    unique: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.func]),
    autofocus: React.PropTypes.bool,
    backspaceDeletesWord: React.PropTypes.bool,
    placeholder: React.PropTypes.string,
    removeTagLabel: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.object]),
    delimiters: React.PropTypes.arrayOf(function (props, propName, componentName) {
      if (typeof props[propName] !== 'string' || props[propName].length !== 1) {
        return new Error('TaggedInput prop delimiters must be an array of 1 character strings')
      }
    }),
    tagOnBlur: React.PropTypes.bool,
    tabIndex: React.PropTypes.number,
    clickTagToEdit: React.PropTypes.bool,
    inputType: React.PropTypes.string,
    tagOnEnter: React.PropTypes.bool,
    textValue: React.PropTypes.string,
    deleteTagOnBackspace: React.PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      delimiters: [' ', ','],
      unique: true,
      autofocus: false,
      backspaceDeletesWord: true,
      tagOnBlur: false,
      clickTagToEdit: false,
      deleteTagOnBackspace: true,
      onBeforeAddTag: function (tag) {
        return true;
      },
      onBeforeRemoveTag: function (index) {
        return true;
      },
      inputType: 'text',
      tagOnEnter: true
    };
  },

  getInitialState: function () {
    return {
      tags: this.props.tags || [],
      currentInput: this.props.textValue || ''
    };
  },

  render: function () {
    var self = this, s = self.state, p = self.props;

    var tagComponents = [],
      classes = "tagged-input-wrapper",
      placeholder,
      i;

    if (p.classes) {
      classes += ' ' + p.classes;
    }

    if (s.tags.length === 0) {
      placeholder = p.placeholder;
    }

    var TagComponent = DefaultTagComponent;

    for (i = 0; i < s.tags.length; i++) {
      tagComponents.push(
        <TagComponent
          key={'tag' + i}
          item={s.tags[i]}
          itemIndex={i}
          onRemove={self._handleRemoveTag.bind(this, i)}
          onEdit={p.clickTagToEdit ? self._handleEditTag.bind(this, i) : null}
          classes={p.unique && (i === s.duplicateIndex) ? 'duplicate' : ''}
          removeTagLabel={p.removeTagLabel || "\u274C"} />
      );
    }

    var input;
    if (p.inputType === 'text') {
      input = (
        <input type="text"
          className="tagged-input"
          ref="input"
          onKeyUp={this._handleKeyUp}
          onKeyDown={this._handleKeyDown}
          onChange={this._handleChange}
          onBlur={this._handleBlur}
          value={s.currentInput}
          placeholder={placeholder}
          tabIndex={p.tabIndex}>
        </input>
        );
    } else if (p.inputType === 'textarea') {
      input = (
        <div
          className="tagged-input"
          ref="input"
          onKeyUp={this._handleKeyUp}
          onKeyDown={this._handleKeyDown}
          onInput={this._handleChange}
          onBlur={this._handleChangeAndBlur}
          data-placeholder={placeholder}
          tabIndex={p.tabIndex}
          contentEditable
        >
          {s.currentInput}
        </div>
        );
    }


    return (
      <div className={classes} onClick={self._handleClickOnWrapper}>
        {tagComponents}
        {input}
      </div>
      );
  },

  componentDidMount: function () {
    var self = this, s = self.state, p = self.props;

    if (p.autofocus) {
      self.refs.input.getDOMNode().focus();
    }
  },

  componentWillReceiveProps: function (nextProps) {
    var s = this.state,
        p = this.props,
        newTags = nextProps.tags,
        added = newTags.filter(function(elem){ return s.tags.indexOf(elem) === -1; }),
        removed = s.tags.filter(function(elem){ return newTags.indexOf(elem) === -1 });

    this.setState({
      tags: newTags,
      currentInput: nextProps.textValue
    });

    if (p.onAddTag) {
      for (var i = 0; i < added.length; i++) {
        p.onAddTag(added[i], this);
      }
    }

    if (p.onRemoveTag) {
      for (var i = 0; i < removed.length; i++) {
        p.onRemoveTag(removed[i], this);
      }
    }
  },

  _handleRemoveTag: function (index) {
    var self = this, s = self.state, p = self.props;

    if (p.onBeforeRemoveTag(index)) {
      var removedItems = s.tags.splice(index, 1);

      if (s.duplicateIndex) {
        self.setState({duplicateIndex: null}, function () {
          if (p.onRemoveTag) {
            p.onRemoveTag(removedItems[0], self);
          }
        });
      } else {
        if (p.onRemoveTag) {
          p.onRemoveTag(removedItems[0], self);
        }
        self.forceUpdate();
      }
    }
  },

  _handleEditTag: function (index) {
    var self = this, s = self.state, p = self.props;

    if (s.currentInput) {
      var trimmedInput = s.currentInput.trim();
      if (trimmedInput && (this.state.tags.indexOf(trimmedInput) < 0 || !p.unique)) {
        this._validateAndTag(s.currentInput);
      }
    }
    var removedItems = s.tags.splice(index, 1);
    if (s.duplicateIndex) {
      self.setState({duplicateIndex: null, currentInput: removedItems[0]}, function () {
        if (p.onRemoveTag) {
          p.onRemoveTag(removedItems[0]);
        }
      });
    } else {
      self.setState({currentInput: removedItems[0]}, function () {
        if (p.onRemoveTag) {
          p.onRemoveTag(removedItems[0]);
        }
      });
    }
  },

  _handleKeyUp: function (e) {
    var self = this, s = self.state, p = self.props;

    var enteredValue = e.target.value;

    switch (e.keyCode) {
      case KEY_CODES.ENTER:
        if (s.currentInput && p.tagOnEnter) {
          self._validateAndTag(s.currentInput, function (status) {
            if (p.onEnter) {
              p.onEnter(e, s.tags);
            }
          });
        }
        break;
    }
  },

  _handleKeyDown: function (e) {
    var self = this,
      s = self.state,
      p = self.props,
      poppedValue,
      newCurrentInput;

    switch (e.keyCode) {
      case KEY_CODES.BACKSPACE:
        if (p.deleteTagOnBackspace && (!e.target.value || e.target.value.length < 0)) {
          if (p.onBeforeRemoveTag(s.tags.length - 1)) {
            poppedValue = s.tags.pop();

            newCurrentInput = p.backspaceDeletesWord ? '' : poppedValue;

            this.setState({
              currentInput: newCurrentInput,
              duplicateIndex: null
            });
            if (p.onRemoveTag && poppedValue) {
              p.onRemoveTag(poppedValue);
            }
          }
        }
        break;
    }
  },

  _handleChange: function (e) {
    var self = this, s = self.state, p = self.props;

    var value = e.target.tagName === 'DIV' ? e.target.innerText : e.target.value,
      lastChar = value.charAt(value.length - 1),
      tagText = value.substring(0, value.length - 1);

    if (p.delimiters.indexOf(lastChar) !== -1) {
      self._validateAndTag(tagText);
    } else {
      this.setState({
        currentInput: value
      });

      if (this.props.onChange) {
        this.props.onChange(value);
      }
    }
  },

  _handleBlur: function (e) {
    var value = e.target.tagName === 'div' ? e.tag.innerText : e.target.value;
    if (this.props.tagOnBlur) {
      if (value) {
        this._validateAndTag(value)
      }
    }
  },

  _handleChangeAndBlur: function (e) {
    this._handleChange(e);
    this._handleBlur(e);
  },

  _handleClickOnWrapper: function (e) {
    this.refs.input.getDOMNode().focus();
  },

  _validateAndTag: function (tagText, callback) {
    var self = this, s = self.state, p = self.props;
    var duplicateIndex;
    var trimmedText;

    if (tagText && tagText.length > 0) {
      trimmedText = tagText.trim();
      if (p.unique) {

        // not a boolean, it's a function
        if (typeof p.unique === 'function') {
          duplicateIndex = p.unique(this.state.tags, trimmedText);
        } else {
          duplicateIndex = this.state.tags.indexOf(trimmedText);
        }

        if (duplicateIndex === -1) {
          if (p.onBeforeAddTag(trimmedText)) {
            s.tags.push(trimmedText);
          }
          self.setState({
            currentInput: '',
            duplicateIndex: null
          }, function () {
            if (p.onAddTag) {
              p.onAddTag(tagText, self);
            }
            if (callback) {
              callback(true);
            }
          });
        } else {
          self.setState({duplicateIndex: duplicateIndex}, function () {
            if (callback) {
              callback(false);
            }
          });
        }
      } else {
        if (p.onBeforeAddTag(trimmedText)) {
          s.tags.push(trimmedText);
        }
        self.setState({currentInput: ''}, function () {
          if (p.onAddTag) {
            p.onAddTag(tagText, self);
          }
          if (callback) {
            callback(true);
          }
        });
      }
    }
  },

  getTags: function () {
    return this.state.tags;
  },

  getEnteredText: function () {
    return this.state.currentInput;
  },

  getAllValues: function () {
    var self = this, s = this.state, p = this.props;

    if (s.currentInput && s.currentInput.length > 0) {
      return this.state.tags.concat(s.currentInput);
    } else {
      return this.state.tags;
    }
  }

});

module.exports = TaggedInput;
