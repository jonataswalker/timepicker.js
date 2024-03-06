# TimePicker.js

![NPM Version](https://img.shields.io/npm/v/timepicker.js)
![NPM Downloads](https://img.shields.io/npm/dm/timepicker.js)
![npm bundle size](https://img.shields.io/bundlephobia/min/timepicker.js)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/jonataswalker/timepicker.js/ci.yml)
![GitHub Release Date](https://img.shields.io/github/release-date/jonataswalker/timepicker.js)


A lightweight, customizable, TimePicker.

![Timepicker anim](https://raw.githubusercontent.com/jonataswalker/timepicker.js/screenshot/images/anim.gif)

### Demo

[JSFiddle](https://jsfiddle.net/jonataswalker/fgyk86on/)
[StackBlitz](https://stackblitz.com/edit/jonataswalker-timepicker?file=index.js)

## How to use it?

##### &#8594; [NPM](https://www.npmjs.com/package/timepicker.js)

```shell
npm i timepicker.js
```

##### &#8594; CDN Hosted - [jsDelivr](http://www.jsdelivr.com/projects/timepicker.js)

Load:

```HTML
<script src="https://cdn.jsdelivr.net/npm/timepicker.js/dist/timepicker.iife.min.js"></script>
```

##### Instantiate with some options and listen to changes

```javascript
const timepicker = new TimePicker('#click-trigger', {
    theme: 'dark',
    lang: 'pt',
})
timepicker.on('change', (evt) => {
    console.log(evt)

    // {
    //     hour: string;
    //     minute: string;
    //     element: HTMLElement;
    // }
})
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

