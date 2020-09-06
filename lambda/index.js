const Alexa = require("ask-sdk-core");
var axios = require("axios");

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
    const speakOutput = "Welcome to Greeter skill. Whom you want to greet?";
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes.lastResult = speakOutput;
    handlerInput.attributesManager.getSessionAttributes(attributes);
    const repromptText = " You can say for example, say hello to john.";
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const getWish = () => {
  const mydate = new Date();
  let hours = mydate.getUTCHours();
  if (hours < 0) {
    hours = hours + 24;
  }
  if (hours < 12) {
    return "Good morning! ";
  } else if (hours < 18) {
    return "Good Afternoon! ";
  } else {
    return "Good evening! ";
  }
};

const getQuote = () => {
  const url =
    "http://api.forismatic.com/api/1.0/json?method=getQuote&lang=en&format=json";
  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((res) => res.data)
      .then((res) => {
        resolve(res.quoteText);
      })
      .catch((err) => {
        reject("", err);
      });
  });
};

const HelloIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "HelloIntent"
    );
  },
  async handle(handlerInput) {
    const name =
      handlerInput.requestEnvelope.request.intent.slots.FirstName.value;
    const quote = await getQuote();
    let speakOutput = "hello " + name + ". " + getWish();
    speakOutput +=
      " quote for the day. " + quote + " Do you want to hear one more?";
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes.lastResult = speakOutput;
    attributes.quoteIntent = true;
    handlerInput.attributesManager.getSessionAttributes(attributes);
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withStandardCard(
        "quote",
        quote,
        "https://upload.wikimedia.org/wikipedia/commons/5/5b/Hello_smile.png"
      )
      .reprompt(
        "add a reprompt if you want to keep the session open for the user to respond"
      )
      .getResponse();
  },
};

const QuoteIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "QuoteIntent"
    );
  },
  async handle(handlerInput) {
    const quote = await getQuote();
    let speakOutput = "here. " + quote + "do you want to hear more?";
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes.quoteIntent = true;
    attributes.lastResult = speakOutput;
    handlerInput.attributesManager.getSessionAttributes(attributes);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt("You can say yes or one more. ")
      .getResponse();
  },
};

const NextQuoteIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "NextQuoteIntent"
    );
  },
  async handle(handlerInput) {
    let speakOutput = "";
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    if (attributes.quoteIntent) {
      const quote = await getQuote();
      speakOutput += quote + " do you want to hear more?";
      attributes.lastResult = speakOutput;
      handlerInput.attributesManager.getSessionAttributes(attributes);
    } else {
      speakOutput += "please try again.";
    }
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt("You can say yes or one more. ")
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput = "You can say wish amy!";
    const repromptText = "How else can I help?";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const RepeatIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.RepeatIntent"
    );
  },
  handle(handlerInput) {
    let speakOutput = "repeat!";
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    if (attributes.lastResult) {
      speakOutput = "I said: " + attributes.lastResult;
    }
    handlerInput.attributesManager.getSessionAttributes(attributes);
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speakOutput = "Goodbye!";

    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet
 * */
const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.FallbackIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput = "Sorry, I don't know about that. Please try again.";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs
 * */
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
  },
  handle(handlerInput) {
    console.log(
      `~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`
    );
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const speakOutput =
      "Sorry, I had trouble doing what you asked. Please try again.";
    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom
 * */
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
    QuoteIntentHandler,
    NextQuoteIntentHandler,
    RepeatIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent("sample/hello-world/v1.2")
  .lambda();
