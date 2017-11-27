let vlille = {
    nbStations: 0,
    stations: {}
};

function updateVlilleStations() {
    return fetch(`https://opendata.lillemetropole.fr/api/records/1.0/search/?dataset=vlille-realtime&rows=512`)
        .then(response => response.json())
        .then((json) => {
            vlille.nbStations = json.nhits;
            vlille.stations = json.records;
            console.log(vlille);
        });
}

updateVlilleStations();
let intervalId = setInterval(updateVlilleStations, 15000);

const app = new Vue({
    el: 'main',
    data: {
        vlille
    },
});
console.log(app);