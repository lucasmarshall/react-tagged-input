# react-tagged-input

A react component that lets you enter text and converts them to tags.

See the component proptypes in the src/ directory any more options.

More docs and features are on the way. Pull requests are welcome.

---
### Install

```sh
npm install react-tagged-input
```

---

### Usage

To make give this component a proper look and feel, you will want to include the [these styles](https://github.com/tutorialhorizon/react-tagged-input/blob/master/css/react-tagged-input.css) and namespace them appropriately using the `classes` property as shown below to customize them as per your liking.

Space and comma act as the default delimiters for when the user types.  Customise this with the `delimiters` 
prop, which should be set to an array of 1 character strings.

```js
var React = require('react'),
  TaggedInput = require('react-tagged-input'),
  mountPoint = document.querySelector('body');

React.render(
  <TaggedInput
    autofocus={true} // Gives the component focus after it mounts
    backspaceDeletesWord={true} // false deletes one character at a time
    placeholder={'Your favorite npm modules'}
    tags={['javascript', 'react']} // pre-assigned tags
    onEnter={/*function*/}
    onAddTag={/*function*/} // argument - tag that was added
    onRemoveTag={/*function*/} // argument - tag that got removed
    tagOnBlur={false}          // If true, creates a tag from any text entered when input box loses focus
    clickTagToEdit={false}          // If true, enables tag editing by clicking the tag text
    unique={true} // Whether duplicate entries are allowed, or a callback
    classes={'my-css-namespace'}
    removeTagLabel={"\u274C"} // Unicode of a symbol or an Object click to delete tags. Defaults to 'x',
    onBeforeAddTag={function (tagText) {return true;}} // Returning true from this function causes the tag to itself handle adding tags. Return false if you want a parent to pass in updated tags in props.
    onBeforeRemoveTag={function (tagText) {return true;}} // Returning true causes the tag to itself handle removing tags. Return false if you want a parent to pass in updated tags in props.
  />,
  mountPoint );
```

#### Unique Callback

If the unique property is a function it will be called to obtain the duplicate index. The callback will receive the array of
current tags and the new tag, it will return the index of the duplicate tag, or -1 if there is no duplicate. This can be used
to do custom comparisons for uniqueness.

### API

#### getTags

Retrieves the tags as an array.

#### getEnteredTest

Retrieves the text from the input before it is entered as a tag.

#### getAllValues

Retrieves the tags as an array with input text concatenated if it exists.

---
###Dev

Before you begin editing the source component, just run the following grunt task that watches for your changes to the examples as well as the component.

```sh
grunt dev
```

## License

[MIT](LICENSE)
