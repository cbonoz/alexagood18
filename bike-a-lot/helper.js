const library = (function () {

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

    function getBikeFact() {
        const randomValue = getRandom(BIKING_FACTS.length)
        return BIKING_FACTS[randomValue]
    }

    return {
        getBikeFact
    }

})();
module.exports = library;

