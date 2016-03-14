# Date-range-picker
Date-range-picker is a highly configurable JavaScript UMD component 
without dependencies that adds choosing date ranges functionality to your pages.
By default, the Date-range-picker calendar opens in a overlay when 
the associated text field gains focus.

## Demo
!["drp-preview"](https://raw.githubusercontent.com/dosandk/date-range-picker/master/assets/drp-preview.png)

## Install
Date-range-picker was developed by using UMD pattern.
So, if you use: [`requirejs`](http://requirejs.org)

```javascript
define("name-of-my-module", ["date-range-picker"], function(DRP) {
   // some logic here
}); 
```
Or, if you prefer CommonJS:
```javascript
var dateRangePicker = require("date-range-picker");
```
Or, you can simple add next lines to your page:
```html
<link rel="stylesheet" href="drp.min.css" />
<script src="date-range-picker"></script>
```
## API documentation
### Configuration

#### elementSelector
To associated input with date-range-picker you should set value to elementSelector

```javascript
var dateRangePicker = new DateRangePicker({
    elementSelector: '.some-class-name'
});
```
#### year
Parameter "year" allows to set a year for the calendar.
First month will be current.

```javascript
var dateRangePicker = new DateRangePicker({
    year: 2019
});
```
#### month
Parameter "month" allows to set a month for the calendar.

```javascript
var dateRangePicker = new DateRangePicker({
    month: 3
});
```
#### fragmentsNumber
Parameter "fragmentsNumber" allows to set a number of months for the calendar.

```javascript
var dateRangePicker = new DateRangePicker({
    fragmentsNumber: 1
});

var dateRangePicker = new DateRangePicker({
    fragmentsNumber: 2
});

var dateRangePicker = new DateRangePicker({
    fragmentsNumber: 3
});
```

### Methods

#### destroy()
This method removes connection between input and calendar.

```javascript
var dateRangePicker = new DateRangePicker();

dateRangePicker.destroy();
```

#### getInterval()
This method returns object with start and end dates timestamps.

```javascript
var dateRangePicker = new DateRangePicker();

dateRangePicker.getInterval(); // {start: 1551996000000, end: 1556571600000}
```
