
class Calculator
{
    Calculate(month, day) {
        var moment = require('moment');
        var myDate = moment([2018, month - 1, day]);
        var now = moment();

        return myDate.diff(now, 'days') + ' days';
    }
}

module.exports = Calculator;
var c = new Calculator();
console.log(c.Calculate(5, 10));
