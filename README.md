**communiQ** is a communication tool and will be used by business to :

* Make programmable voice calls to customers
* Receive and respond to an inbound phone call which reads a message to the caller using Text to Speech
* Call analytics dashboard

## Technology
* Java 8
* spring-boot

## Installation

* Sign up for -[Twilio](https://www.twilio.com/) and get your first voice-enabled Twilio phone number 

* Add following properties from twilio account to application.yml
   * account sid 
   * auth token 
   * Twilio phone number as customer care number
-[Help](https://www.twilio.com/docs/voice/quickstart/java#sign-up-for-twilio-and-get-a-twilio-phone-number)
   
* build project   
```
mvn clean install
```

* start application 

```
mvn spring-boot:run
```

Application can be accessed at :
```
http://localhost:8082/communiQ/
```