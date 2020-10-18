'use strict';

// Connect to mainnet official node 'wss://obyte.org/bb'
const client = new obyte.Client();

const params = {
    address: 'PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU'
};

client.api.getAaStateVars(params, function (err, result) {
    document.getElementById("supply").innerHTML = (result.shares_supply / 1000000000);
    console.log(result);
    console.log(result.shares_supply);
});

const addresses = [
    'PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU'
];


client.api.getBalances(addresses, function (err, result) {
    document.getElementById("assets").innerHTML = `${result.PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU.base.stable / 1000000000} GBYTE + ${result.PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU.base.stable / 1000000000} GRD`;
    console.log(result);
    console.log(result.PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU);
    console.log(result.PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU.base.stable / 1000000000);
});