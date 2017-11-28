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
    nbStations: 0,
    stations: {}
};

function updateVlilleStations() {
    return fetch(`https://opendata.lillemetropole.fr/api/records/1.0/search/?dataset=vlille-realtime&rows=512`)
        .then(response => response.json())
        .then((json) => {
            vlille.nbStations = json.nhits;
            vlille.stations = {};
            json.records.forEach(record => {
                vlille.stations[record.fields.libelle] = StationManager.loadFromVlilleApi(record)
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
            filtered = [];
            for (let station in this.vlille.stations) {
                let searchable = this.vlille.stations[station].adress + ' ' + this.vlille.stations[station].name;
                if (!this.search || searchable.match(re)) {
                    filtered.push(this.vlille.stations[station])
                }
            }
            return filtered;
        }
    },
    methods: {
        applyFilter: function (item) {
            console.log(item)
            return this
        }
    }
});
