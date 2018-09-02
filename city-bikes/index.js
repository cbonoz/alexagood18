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

const Alexa = require('ask-sdk-core')
const helper = require('./helper')
const api = require('./api')

const APP_NAME = "City Biking"
const WELCOME_PROMPT = "Do you want to know about nearby city bikes, or hear a biking fact? Say, give me a fact, or something like 'city bikes in Los Angeles.'"
const ERROR_MESSAGE = 'Sorry, I didn\'t understand the command. Please say again.'
const REPROMPT = "Ask for city bikes in another city?"

const states = {
    NONE: "_NONE",
    GET_CITY: "_GET_CITY",
    GET_STATION: "_GET_STATION"
}

/* INTENT HANDLERS */

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(`Welcome to ${APP_NAME}, I can help you find city bikes. ${WELCOME_PROMPT}`)
            .reprompt(WELCOME_PROMPT)
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
            .speak(`You're currently using ${APP_NAME}. ${WELCOME_PROMPT}`)
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

/* CUSTOM HANDLERS */

const BikeFactIntent = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest' && request.intent.name === 'BikeFactIntent';
    },
    handle(handlerInput) {
        const attributes = handlerInput.attributesManager.getSessionAttributes()
        attributes.state = states.NONE

        const bikeFact = helper.getBikeFact()

        return handlerInput.responseBuilder
            .speak(`Here's your bike fact: ${bikeFact}. What next? ${WELCOME_PROMPT}`)
            .reprompt(WELCOME_PROMPT)
            .getResponse();
    },
};

const CityBikeIntent = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest' && request.intent.name === 'CityBikeIntent';
    },
    handle(handlerInput) {
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        attributes.state = states.GET_CITY;
        // TODO: get city from intent.
        const item = getItem(handlerInput.requestEnvelope.request.intent.slots);
        const city = item.CityName;
        const state = item.StateName;

        if (!city && !state) {
            return handlerInput.responseBuilder
                .speak(`Say a city or state. ${WELCOME_PROMPT}`)
                .reprompt(WELCOME_PROMPT)
                .getResponse();  
        }

        attributes.city = city

        api.getAllNetworks().then(networkData => {
            const networks = networkData.data.networks
            const matches = helper.getNetworkMatches(city, networks)
            if (matches) {
                attributes.state = states.GET_STATION

                const cityMatch = matches[0].location.city
                const stateMatch = matches[0].location.state
                attributes.cityMatch = cityMatch
                attributes.stateMatch = stateMatch
                const networkId = matches[0].id
                attributes.networkMatch = networkId
                api.getNetwork(networkId).then(networkData => {
                    const stations = networkData.data.network.stations
                    attributes.stations = stations
                    const speech = `My closest result is ${cityMatch}, ${stateMatch}. I found ${stations.length} ${helper.getReadableId(networkId)} stations here; if this is right, say a street name or intersection for bike information. Or say city bikes for another city.`;
                    return handlerInput.responseBuilder
                        .speak(speech)
                        .reprompt(speech)
                        .getResponse(); 
                }).catch(err2 => {
                    attributes.state = states.NONE;
                    return handlerInput.responseBuilder
                        .speak(`Error getting stations for ${city}. ${WELCOME_PROMPT}`)
                        .reprompt(WELCOME_PROMPT)
                        .getResponse(); 
                })
            }

            attributes.state = states.NONE;
            return handlerInput.responseBuilder
                .speak(`Sorry, I don't have bike info for ${city}. Say city bikes in Los Angeles, or try another city.`)
                .reprompt(WELCOME_PROMPT)
                .getResponse();  
        }).catch(err => {

            attributes.state = states.NONE;
            return handlerInput.responseBuilder
                .speak(`Error getting bike networks. ${WELCOME_PROMPT}`)
                .reprompt(WELCOME_PROMPT)
                .getResponse();
        })
    }
};

const StationIntent = {
    canHandle(handlerInput) {
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        const request = handlerInput.requestEnvelope.request;

        return attributes.state === states.GET_STATION && request.type === 'IntentRequest' && request.intent.name === 'StationIntent';
    },
    handle(handlerInput) {
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        attributes.state = states.GET_STATION;

        const item = getItem(handlerInput.requestEnvelope.request.intent.slots);
        const streetName = item.StreetName;

        const matches = helper.getStationMatches(streetName, attributes.stations)
        let speech
        if (matches) {
            if (matches.length > 1) {
                speech = `I found ${matches.length} matching stations. `;
                matches.map((match) => {
                    speech += helper.getBikeInfo(match);
                })
            } else {
                const match = matches[0]
                speech = `I found a matching station at ${match.name}. ${helper.getBikeInfo(match)}`;
            }
        } else {
            speech = `I couldn't find a match for ${streetName}.`;
        }

        const reprompt = `Try asking about ${helper.getRandom(attributes.stations).name} again, or ask about another street. Or say exit.`;

        return handlerInput.responseBuilder
            .speak(speech + reprompt)
            .reprompt(reprompt)
            .getResponse();
    }
};


exports.handler = skillBuilder
    .addRequestHandlers(
        LaunchRequestHandler,
        CityBikeIntent,
        StationIntent,
        BikeFactIntent,
        HelpHandler,
        ExitHandler,
        SessionEndedRequestHandler,
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
