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
        return StationManager.isFavorite(this.id)
    }
}

class StationManager {
    static loadFromVlilleApi(json) {
        const station = new Station();
        station.id = json.fields.libelle;
        station.name = json.fields.nom.replace(/^\d+ /, '').replace(' (CB)', '');
        station.state = json.fields.etat + '/' + json.fields.etatConnexion;
        station.adress = json.fields.adresse + ' ' + json.fields.commune;
        station.nbBikes = json.fields.nbvelosdispo;
        station.nbSlots = json.fields.nbplacesdispo;
        station.acceptCb = json.fields.type === "AVEC TPE";
        station.gps = json.fields.geo;
        return station;
    }
    static saveFavorites() {
        localStorage.setItem("favorites", JSON.stringify(vlille.favorites.sort((a, b) => a < b ? -1 : 1)));
    }
    static isFavorite(stationId) {
        return vlille.favorites.indexOf(stationId) > -1;
    }
}

let vlille = {
    stations: [],
    favorites: JSON.parse(localStorage.getItem("favorites")) || []
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
let intervalId = setInterval(updateVlilleStations, 120000);

Vue.component('station', {
    props: ['station'],
    template: '#tpl-station',
    methods: {
        favoriteUpdate: function (station) {
            this.$emit("favorite-update", { id: station.id });
        }
    },
})

new Vue({
    el: 'main',
    data: {
        vlille,
        filterSearch: '',
        filterFavorite: false
    },
    computed: {
        filteredStations: function () {
            re = new RegExp(this.filterSearch, 'i');
            requireFavorite = this.filterFavorite;
            return this.vlille.stations.filter(function (item) {
                let searchable = item.id + ' ' + item.adress + ' ' + item.name;
                if (requireFavorite && !item.isFavorite()) {
                    return false;
                }
                return searchable.match(re);
            }).sort(function (a, b) {
                return a.id < b.id ? -1 : 1;
            });
        }
    },
    methods: {
        favoriteUpdate: function (station) {
            let index = this.vlille.favorites.indexOf(station.id);
            if (index > -1) {
                this.vlille.favorites.splice(index, 1);
            } else {
                this.vlille.favorites.push(station.id);
            }
            StationManager.saveFavorites();
        }
    },
});
