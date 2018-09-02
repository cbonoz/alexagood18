const library = (function () {

    const axios = require('axios')
    const BASE_URL = "http://api.citybik.es/v2"


    function getAllNetworks() {
        return axios.get(`${BASE_URL}/networks`)
    }

    function getNetwork(networkId) {
        return axios.get(`${BASE_URL}/networks/${networkId}`)
    }

    return {
        getAllNetworks,
        getNetwork
    }

})();
module.exports = library;

