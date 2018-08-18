/**
    Bike-a-lot

    Bike-a-lot is an alexa skill for tracking and rewarding users who activately use their bicycles - instead of driving.

    This skill also uses entity resolution to define synonyms. Combined with
    dialog management, the skill can ask the user for clarification of a synonym
    is mapped to two slot values.
 **/

/* eslint-disable  func-names */
/* eslint-disable  no-restricted-syntax */
/* eslint-disable  no-loop-func */
/* eslint-disable  consistent-return */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const helper = require('./helper');

const APP_NAME = "Bike-a-lot"
const WELCOME_PROMPT = "Do you want to report a ride, hear a biking fact, hear about your performance?"
const ERROR_MESSAGE = 'Sorry, I didn\'t understand the command. Please say again.'

/* INTENT HANDLERS */

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(`Welcome to ${APP_NAME}. I track your biking stats and help you manage your goals. ${WELCOME_PROMPT}`)
            .reprompt(WELCOME_PROMPT)
            .getResponse();
    },
};

const BikeFactIntent = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest'
            && request.intent.name === 'BikeFactIntent';
    },
    handle(handlerInput) {

        const bikeFact = helper.getBikeFact()

        return handlerInput.responseBuilder
            .speak(`Here's your bike fact: ${bikeFact}. What next? ${WELCOME_PROMPT}`)
            .reprompt(WELCOME_PROMPT)
            .getResponse();
    },
};

const RideStatIntent = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest'
            && request.intent.name === 'RideReportIntent';
    },
    handle(handlerInput) {
        // TODO: allow the user to report a ride and save it to the record

        return handlerInput.responseBuilder
            .speak('You don\'t want to start your career? Have fun wasting away on the couch.')
            .getResponse();
    },
};

const RideReportIntent = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest'
            && request.intent.name === 'RideReportIntent';
    },
    handle(handlerInput) {
        // TODO: allow the user to report a ride and save it to the record

        return handlerInput.responseBuilder
            .speak('You don\'t want to start your career? Have fun wasting away on the couch.')
            .getResponse();
    },
};

const HelpHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest'
            && request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(`This is ${APP_NAME}. ${WELCOME_PROMPT}`)
            .reprompt(WELCOME_PROMPT)
            .getResponse();
    },
};

const ExitHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest'
            && (request.intent.name === 'AMAZON.CancelIntent'
                || request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Good luck on your next ride. Bye!')
            .getResponse();
    },
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

        return handlerInput.responseBuilder.getResponse();
    },
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);
        return handlerInput.responseBuilder
            .speak(ERROR_MESSAGE)
            .reprompt(ERROR_MESSAGE)
            .getResponse();
    },
};

/* CONSTANTS */

const skillBuilder = Alexa.SkillBuilders.custom();

/* HELPER FUNCTIONS */

function getSlotValues(filledSlots) {
    const slotValues = {};

    console.log(`The filled slots: ${JSON.stringify(filledSlots)}`);
    Object.keys(filledSlots).forEach((item) => {
        const name = filledSlots[item].name;

        if (filledSlots[item] &&
            filledSlots[item].resolutions &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
            switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
                case 'ER_SUCCESS_MATCH':
                    slotValues[name] = {
                        synonym: filledSlots[item].value,
                        resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
                        isValidated: true,
                    };
                    break;
                case 'ER_SUCCESS_NO_MATCH':
                    slotValues[name] = {
                        synonym: filledSlots[item].value,
                        resolved: filledSlots[item].value,
                        isValidated: false,
                    };
                    break;
                default:
                    break;
            }
        } else {
            slotValues[name] = {
                synonym: filledSlots[item].value,
                resolved: filledSlots[item].value,
                isValidated: false,
            };
        }
    }, this);

    return slotValues;
}

exports.handler = skillBuilder
    .addRequestHandlers(
        LaunchRequestHandler,
        RideReportIntent,
        RideStatIntent,
        BikeFactIntent,
        CompletedRecommendationIntent,
        HelpHandler,
        ExitHandler,
        SessionEndedRequestHandler,
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
