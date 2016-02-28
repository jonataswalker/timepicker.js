# Timepicker.js
Yet Another (framework free) Timepicker.


![Timepicker anim](https://raw.githubusercontent.com/jonataswalker/timepicker.js/screenshot/images/anim.gif)

### Demo
See [here a demo](http://rawgit.com/jonataswalker/timepicker.js/master/examples/example.html).


## How to use it?
##### CDN Hosted - [jsDelivr](http://www.jsdelivr.com/projects/timepicker.js)
Load CSS and Javascript:
```HTML
<link href="//cdn.jsdelivr.net/timepicker.js/latest/timepicker.min.css"  rel="stylesheet">
<script src="//cdn.jsdelivr.net/timepicker.js/latest/timepicker.min.js"></script>
```
##### Self hosted
Download [latest release](https://github.com/jonataswalker/timepicker.js/releases/latest) and (obviously) load CSS and Javascript.

##### Instantiate with some options and listen to changes
```javascript
var timepicker = new TimePicker(['field1', 'field2'], {
  lang: 'pt'
});
timepicker.on('change', function(evt){
  console.info(evt);
  
  var value = '' + (evt.hour || '00') + ':' + (evt.minute || '00');
  evt.element.value = value;
});
```

# API

## Constructor

#### `new TimePicker(target, options)`

###### `target` can be:
`{String|Array<String>|Element|Array<Element>}` String or array of string, DOM node or array of nodes.

###### `options` is an object with the following possible properties:
* `lang`: `'en'`; Header language

## Methods

#### timepicker.show()

#### timepicker.hide()


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