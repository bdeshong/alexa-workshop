'use strict';
var Alexa = require("alexa-sdk");
var AWS = require("aws-sdk");

AWS.config.update({
    region: 'us-east-1'
});

var dynamoDb = new AWS.DynamoDB();

// For detailed tutorial on how to making a Alexa skill,
// please visit us at http://alexa.design/build

exports.handler = function(event, context) {
    var alexa = Alexa.handler(event, context);
    //alexa.dynamoDBTableName = 'alexa-countdown';
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('SayHello');
    },
    'HelloWorldIntent': function () {
        this.emit('SayHello');
    },
    'MyNameIsIntent': function () {
        this.emit('SayHelloName');
    },
    'SayHello': function () {
        this.response.speak('Hello World!')
                     .cardRenderer('hello world', 'hello world');
        this.emit(':responseReady');
    },
    'SayHelloName': function () {
        var name = this.event.request.intent.slots.name.value;
        this.response.speak('Hello ' + name)
            .cardRenderer('hello world', 'hello ' + name);
        this.emit(':responseReady');
    },
    'SessionEndedRequest' : function() {
        console.log('Session ended with reason: ' + this.event.request.reason);
    },
    'AMAZON.StopIntent' : function() {
        this.response.speak('Bye');
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent' : function() {
        this.response.speak("You can try: 'alexa, hello world' or 'alexa, ask hello world my" +
            " name is awesome Aaron'");
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent' : function() {
        this.response.speak('Bye');
        this.emit(':responseReady');
    },
    'CountdownIntent' : function() {
        console.log(this.event.request.intent.slots);

        if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS"){
            // We're missing eventDate, so delegate to collect what we're
            // missing.
            this.context.succeed({
                "response": {
                    "directives": [
                        {
                            "type": "Dialog.Delegate"
                        }
                    ],
                    "shouldEndSession": false
                },
                "sessionAttributes": {}
            });
        } else {
            var c = new Calculator();
            this.response.speak(c.Calculate(this.event.request.intent.slots.eventDate.value));
        }

        if (this.event.request.intent.slots.event.value !== undefined &&
            this.event.request.intent.slots.eventDate.value !== undefined
        ) {
            // Store to DynamoDB
            var params = {
                'TableName': 'alexa-countdown',
                'Item': {
                    'userId': {'S': this.event.session.user.userId},
                    'event': {'S': this.event.request.intent.slots.event.value},
                    'eventDate': {'S': this.event.request.intent.slots.eventDate.value}
                }
            };

            console.log("params");
            console.log(params);

            dynamoDb.putItem(params, function (error, data) {
                console.log("in callback: data");
                console.log(data);

                console.log("in callback: error");
                console.log(error);

                if (error) {
                    console.error("failed to persist; " + error);
                } else {
                    console.log("persisted successfully");
                }
            });

            console.log("down here after dynamoDb call");
        }

        this.emit(':responseReady');
    },
    'Unhandled' : function() {
        this.response.speak("Sorry, I didn't get that. You can try: 'alexa, hello world'" +
            " or 'alexa, ask hello world my name is awesome Aaron'");
    }
};

class Calculator
{
    Calculate(date) {
        var moment = require('moment');
        var myDate = moment(date);
        var now = moment();

        return myDate.diff(now, 'days') + ' days';
    }
}
