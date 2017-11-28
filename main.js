class Station {
    constructor() {
        this.id;
        this.name;
        this.state;
        this.adress;
        this.nbBikes;
        this.nbSlots;
        this.acceptCb;
        this.gps;
    }
}

class StationManager {
    static loadFromVlilleApi(json) {
        const station = new Station();
        station.id = json.fields.libelle;
        station.name = json.fields.nom.replace(/^\d+ /, '').replace(' (CB)', '');
        station.state = json.fields.etat + '/' + json.fields.etatConnexion;
        station.adress = json.fields.adresse + ' ' + json.fields.commune;
        station.nbBikes = json.fields.nbVelosDispo;
        station.nbSlots = json.fields.nbPlacesDispo;
        station.acceptCb = json.fields.type === "AVEC TPE";
        station.gps = json.fields.geo;
        return station;
    }
}

let vlille = {
    stations: []
};

function updateVlilleStations() {
    return fetch(`https://opendata.lillemetropole.fr/api/records/1.0/search/?dataset=vlille-realtime&rows=512`)
        .then(response => response.json())
        .then((json) => {
            vlille.stations = [];
            json.records.forEach(record => {
                vlille.stations.push(StationManager.loadFromVlilleApi(record))
            });
            console.log(vlille.stations);
        });
}

updateVlilleStations();
let intervalId = setInterval(updateVlilleStations, 15000);

const app = new Vue({
    el: 'main',
    data: {
        vlille,
        search: ''
    },
    computed: {
        filteredStations: function () {
            re = new RegExp(this.search, 'i');
            return this.vlille.stations.filter(function (item) {
                let searchable = item.adress + ' ' + item.name;
                return searchable.match(re);
            });
        }
    }
});
