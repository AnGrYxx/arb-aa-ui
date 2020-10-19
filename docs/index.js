'use strict';

// Connect to mainnet official node 'wss://obyte.org/bb'
const client = new obyte.Client();

const params = {
    address: 'PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU'
};

function getAaStateVars () {
    client.api.getAaStateVars(params, function (err, result) {
        var supply = result.shares_supply / 1000000000;
        document.getElementById("supply").innerHTML = supply;
        return supply;
    })
}

getAaStateVars();


const addresses = [
    'PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU'
];

function getAaBalances() {
    client.api.getBalances(addresses, function (err, result) {
        return result
    })
    .then(result => {
        const requests = [];
        requests.push(Promise.resolve(result));

    
            const grdPrice = getGrdPrice();
            requests.push(grdPrice);
        
        return Promise.all(requests);
        // var base_stable = result.PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU.base.stable / 1000000000;
        // var growthToken_stable = result.PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU['YtEVK0inFAj3cQ3CPkJl5Kb8Ax+VlI/dqcOb6GQP64k='].stable / 1000000000;
        // var base_pending = result.PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU.base.pending / 1000000000;
        // var growthToken_pending = result.PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU['YtEVK0inFAj3cQ3CPkJl5Kb8Ax+VlI/dqcOb6GQP64k='].pending / 1000000000;
        // document.getElementById("assets").innerHTML = `${base_stable + base_pending} GBYTE + ${growthToken_stable + growthToken_pending} GRD = `;
    })
    .then(data => {
        console.log("xxx");
        console.log(data);
        console.log("xxx");
        var base_stable = data[0].PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU.base.stable / 1000000000;
        var base_pending = data[0].PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU.base.pending / 1000000000;
        var base_total = base_stable + base_pending;
        var growthToken_pending = data[0].PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU['YtEVK0inFAj3cQ3CPkJl5Kb8Ax+VlI/dqcOb6GQP64k='].pending / 1000000000;
        var growthToken_stable = data[0].PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU['YtEVK0inFAj3cQ3CPkJl5Kb8Ax+VlI/dqcOb6GQP64k='].stable / 1000000000;
        var growthToken_total = growthToken_stable + growthToken_pending;
        var grdPrice = data[1].GRD.last_gbyte_value;
        var totalPrice = base_total + growthToken_total *grdPrice;
        var base_percentage = base_total / totalPrice * 100;
        document.getElementById("assets").innerHTML = `${(base_total).toFixed(2)} GBYTE (${base_percentage.toFixed(2)} %) + ${growthToken_total.toFixed(2)} GRD (${(100 - base_percentage).toFixed(2)} %) = ${totalPrice.toFixed(2)} GBYTE`;
    })
    
}

getAaBalances();


function getGrdPrice() {

    return fetch(`https://data.ostable.org/api/v1/assets`)
    .then(response => {
        return response.json()
    })

}

getGrdPrice();
