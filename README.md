# Timepicker.js

![NPM Version](https://img.shields.io/npm/v/timepicker.js)
![NPM Downloads](https://img.shields.io/npm/dm/timepicker.js)
![npm bundle size](https://img.shields.io/bundlephobia/min/timepicker.js)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/jonataswalker/timepicker.js/ci.yml)
![GitHub Release Date](https://img.shields.io/github/release-date/jonataswalker/timepicker.js)


A lightweight, customizable, TimePicker.

![Timepicker anim](https://raw.githubusercontent.com/jonataswalker/timepicker.js/screenshot/images/anim.gif)

### Demo

See [here a demo](https://jsfiddle.net/jonataswalker/fgyk86on/).

## How to use it?

##### &#8594; [NPM](https://www.npmjs.com/package/timepicker.js)

```shell
npm i timepicker.js
```

##### &#8594; CDN Hosted - [jsDelivr](http://www.jsdelivr.com/projects/timepicker.js)

Load:

```HTML
<script src="//cdn.jsdelivr.net/timepicker.js/latest/timepicker.iife.js"></script>
```

##### Instantiate with some options and listen to changes

```javascript
var timepicker = new TimePicker('.field', {
    theme: 'dark',
    lang: 'pt',
});
timepicker.on('change', function (evt) {
    var value = (evt.hour || '00') + ':' + (evt.minute || '00');
    evt.element.value = value;
});
```

# API

## Constructor

#### `new TimePicker(target, options)`

###### `target` can be:

`{String|Element}` String or DOM node.

###### `options` is an object with the following possible properties:

-   `theme`: `'dark'`; Theme color
-   `lang`: `'en'`; Header language

## Methods

#### timepicker.show()

To be used programatically. Same for `hide()`.

All targets passed to the constructor will be shown.

#### timepicker.hide()

#### timepicker.setTarget(target)

`target` can be: `{String|Element}` String or DOM node.

## Events

```javascript
timepicker.on('open', function (evt) {});

timepicker.on('close', function (evt) {});

timepicker.on('change', function (evt) {});
```

## Themes

-   dark
-   red
-   pink
-   purple
-   deep-purple
-   indigo
-   blue
-   light-blue
-   cyan
-   teal
-   green
-   light-green
-   lime
-   yellow
-   amber
-   orange
-   deep-orange
-   brown
-   blue-grey

