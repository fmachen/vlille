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
    isFavorite() {
        return false;
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
    static favoriteToggle(stationId) {
        let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        let index = favorites.indexOf(stationId);
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(stationId);
        }
        localStorage.setItem("favorites", JSON.stringify(favorites.sort((a, b) => a < b ? -1 : 1)));
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
            }).sort(function (a, b) {
                return a.id < b.id ? -1 : 1;
            });
        }
    },
    methods: {
        favoriteToggle: function (stationId) {
            StationManager.favoriteToggle(stationId);
        }
    }
});
