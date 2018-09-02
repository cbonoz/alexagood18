const library = (function () {

    const Fuse = require('fuse.js');

    const BIKING_FACTS = [
        "Cycling three hours or 30 kilometres per week halves your risk of heart disease and strokes",
        "Women who walk or bike 30 minutes a day have a lower risk of breast cancer.",
        "Countries with the highest levels of cycling and walking generally have the lowest obesity rates.",
        "A study of nearly 2,400 adults found that those who biked to work were fitter, leaner, less likely to be obese, and had better triglyceride levels, blood pressure, and insulin levels than those who didn’t active commute to work.",
        "An adult cyclist typically has a level of fitness equivalent to someone 10 years younger and a life expectancy two years above the average.",
        "Bicycle commuting burns an average of 540 calories per hour.",
        "Figures show the average person will lose 13 lbs, about 5.8 kilograms, in their first year of cycling to work",
    ]

    function getRandom(n) {
        return Math.floor(Math.random() * n)
    }

    function getReadableId(networkId) {
        return networkId.split('-').join(' ')
    }

    function getBikeFact() {
        const randomValue = getRandom(BIKING_FACTS.length)
        return BIKING_FACTS[randomValue]
    }

    function getNetworkMatches(city, networks) {

        var searchOptions = {
            shouldSort: true,
            threshold: 0.6,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: [
                "location.city"
            ]
        };

        var fuse = new Fuse(networks, searchOptions); // "networks" is the item array
        var result = fuse.search(city)
        return result
    }

    function getStationMatches(street, stations) {

        var searchOptions = {
            shouldSort: true,
            threshold: 0.6,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: [
                "name",
                "extra.address"
            ]
        };

        var fuse = new Fuse(stations, searchOptions); // "stations" is the item array
        var result = fuse.search(street)
        return result
    }

    function getItem(slots) {
        const propertyArray = Object.getOwnPropertyNames(data[0]);
        let slotValue;

        for (const slot in slots) {
            if (Object.prototype.hasOwnProperty.call(slots, slot) && slots[slot].value !== undefined) {
                slotValue = slots[slot].value;
                for (const property in propertyArray) {
                    if (Object.prototype.hasOwnProperty.call(propertyArray, property)) {
                        const item = data.filter(x => x[propertyArray[property]]
                            .toString().toLowerCase() === slots[slot].value.toString().toLowerCase());
                        if (item.length > 0) {
                            return item[0];
                        }
                    }
                }
            }
        }
        return slotValue;
    }

    function getBikeInfo(station) {
        let bikesText;
        if (station.free_bikes == 0) {
            bikesText = `There are no free bikes at ${station.name}.`
        } else {
            const totalBikes = station.free_bikes + station.empty_slots;
            bikesText = `${station.free_bikes} of ${totalBikes} bikes are free at ${station.name}.`
            if (station.free_bikes / totalBikes < .25) {
                bikesText += "Not that many here!";
            }
        }
        return bikesText;
    }

    return {
        getBikeFact,
        getRandom,
        getReadableId,
        getNetworkMatches,
        getStationMatches,
        getItem,
        getBikeInfo
    }

})();
module.exports = library;

