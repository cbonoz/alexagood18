const api = require('./api')
const helper = require('./helper')

api.getAllNetworks().then(data => {
    const networks = data.data.networks
    const city = "Boston"
    const networkMatches = helper.getNetworkMatches(city, networks)
    const networkId = networkMatches[0].id
    api.getNetwork(networkId).then(networkData => {
        const stations = networkData.data.network.stations
        const cityMatches = helper.getStationMatches('Jersey at Boylston', stations)
        const match = cityMatches[0];
    })


});


