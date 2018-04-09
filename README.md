# Timepicker.js

<p align="center">
  <a href="https://travis-ci.org/jonataswalker/timepicker.js">
    <img src="https://travis-ci.org/jonataswalker/timepicker.js.svg?branch=master" alt="build status">
  </a>
  <a href="https://www.npmjs.com/package/timepicker.js">
    <img src="https://img.shields.io/npm/v/timepicker.js.svg"
      alt="npm version">
  </a>
  <a href="https://github.com/jonataswalker/timepicker.js/blob/master/LICENSE.md">
    <img src="https://img.shields.io/npm/l/timepicker.js.svg"
      alt="license">
  </a>
  <a href="https://david-dm.org/jonataswalker/timepicker.js">
    <img src="https://david-dm.org/jonataswalker/timepicker.js/status.svg"
      alt="dependency status">
  </a>
  <a href="https://david-dm.org/jonataswalker/timepicker.js">
    <img src="https://david-dm.org/jonataswalker/timepicker.js/dev-status.svg" alt="devDependency status">
  </a>
</p>

A lightweight, customizable, TimePicker. Zero dependencies.

Because `<input type="time">` is not yet supported in major browsers (MS Edge and Chrome only).

![Timepicker anim](https://raw.githubusercontent.com/jonataswalker/timepicker.js/screenshot/images/anim.gif)

### Demo
See [here a demo](http://rawgit.com/jonataswalker/timepicker.js/master/examples/example.html).


## How to use it?

##### &#8594; [NPM](https://www.npmjs.com/package/timepicker.js)
```shell
npm i timepicker.js
```

##### &#8594; CDN Hosted - [jsDelivr](http://www.jsdelivr.com/projects/timepicker.js)
Load CSS and Javascript:
```HTML
<link href="//cdn.jsdelivr.net/timepicker.js/latest/timepicker.min.css"  rel="stylesheet">
<script src="//cdn.jsdelivr.net/timepicker.js/latest/timepicker.min.js"></script>
```
##### &#8594; Self hosted
Download [latest release](https://github.com/jonataswalker/timepicker.js/releases/latest) and (obviously) load CSS and Javascript.

##### Instantiate with some options and listen to changes
```javascript
var timepicker = new TimePicker(['field1', 'field2'], {
  theme: 'dark', // or 'blue-grey'
  lang: 'pt' // 'en', 'pt' for now
});
timepicker.on('change', function(evt){
  console.info(evt);

  var value = (evt.hour || '00') + ':' + (evt.minute || '00');
  evt.element.value = value;
});
```

# API

## Constructor

#### `new TimePicker(target, options)`

###### `target` can be:
`{String|Array<String>|Element|Array<Element>}` String or array of string, DOM node or array of nodes.

###### `options` is an object with the following possible properties:
* `theme`: `'dark'`; Theme color ('dark', 'blue-grey' for now)
* `lang`: `'en'`; Header language ('en', 'pt' for now)

## Methods

#### timepicker.show()
To be used programatically. Same for `hide()`.

All targets passed to the constructor will be shown.

#### timepicker.hide()

#### timepicker.setTarget(target)
`target` can be: `{String|Array<String>|Element|Array<Element>}` String or array of string, DOM node or array of nodes.

## Events

```javascript
timepicker.on('open', function(evt){

});

timepicker.on('close', function(evt){

});

timepicker.on('change', function(evt){

  var hour = evt.hour;
  var minute = evt.minute;

});
```
