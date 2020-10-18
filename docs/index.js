'use strict';

// Connect to mainnet official node 'wss://obyte.org/bb'
const client = new obyte.Client();

const params = {
    address: 'PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU'
};

client.api.getAaStateVars(params, function (err, result) {
    var supply = result.shares_supply / 1000000000;
    console.log(supply);
    document.getElementById("supply").innerHTML = supply;
});


const addresses = [
    'PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU'
];


client.api.getBalances(addresses, function (err, result) {
    console.log(Object.keys(result));
    var base = result.PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU.base.stable / 1000000000;
    var growthToken = result.PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU['YtEVK0inFAj3cQ3CPkJl5Kb8Ax+VlI/dqcOb6GQP64k='].stable / 1000000000;

    var assets = JSON.stringify(result);
    console.log(assets);
    console.log(assets[0]);
    document.getElementById("assets").innerHTML = `${base} GBYTE + ${growthToken} GRD`;
    console.log(result);
    console.log(result.PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU);
    console.log(result.PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU.base.stable / 1000000000);
});