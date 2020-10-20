'use strict';

// Connect to mainnet official node 'wss://obyte.org/bb'
const options = { reconnect: true };
const client = new obyte.Client('wss://obyte.org/bb', options);

// default
const params = {
    address: 'PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU'
};

function getAaStateVars (params) {
    client.api.getAaStateVars(params, function (err, result) {
        var supply = (result.shares_supply / 1000000000).toFixed(2);
        document.getElementById("supply").innerHTML = supply;
        return result
    })
}

getAaStateVars(params);

const addresses = [
    params.address
];

function getAaBalances(params2) {
    client.api.getBalances(params2, function (err, result) {
        return result
    })
    .then(result => {
        var xyz = Object.keys(result);
        var params = {address: xyz[0]};
        const requests = [];
        requests.push(Promise.resolve(result));

        const grdPrice = getGrdPrice();
        requests.push(grdPrice);

        const aaStateVars = client.api.getAaStateVars(params, function (err, result) {
            return result
        })
        requests.push(aaStateVars);
        
        return Promise.all(requests);
    })
    .then(data => {
        var key1 = Object.keys(data[0]);
        var key2 = Object.keys(data[0][key1]);
        var base_stable = data[0][key1].base.stable / 1000000000;
        var base_pending = data[0][key1].base.pending / 1000000000;
        var base_total = base_stable + base_pending;
        var growthToken_pending = data[0][key1][key2[1]].pending / 1000000000;
        var growthToken_stable = data[0][key1][key2[1]].stable / 1000000000;
        var growthToken_total = growthToken_stable + growthToken_pending;
        var valueOne= $('#arb').val().split(',')[0];
        var valueTwo =$('#arb').val().split(',')[1];
        var grdPrice = data[1][valueTwo].last_gbyte_value;
        var totalPrice = base_total + (growthToken_total*grdPrice);
        var base_percentage = base_total / totalPrice * 100;
        var grdarb_supply = data[2].shares_supply / 1000000000;
        document.getElementById("share_value").innerHTML = `${(totalPrice / grdarb_supply).toFixed(2)}`;
        document.getElementById("assets").innerHTML = `
            ${(base_total).toFixed(2)} GBYTE (${base_percentage.toFixed(2)} %)<br>
            + ${growthToken_total.toFixed(2)} ${valueTwo} (${(100 - base_percentage).toFixed(2)} %)<br>
            = ${totalPrice.toFixed(2)} GBYTE`;
        document.getElementById("actions").innerHTML = `
        <a href="obyte:${key1[0]}?asset=base">
            <button class="button is-small is-primary">add GBYTE</button>
        </a>
        <a href="obyte:${key1[0]}?asset=${encodeURIComponent(key2[1])}">
            <button class="button is-small is-primary">add ${valueTwo}</button>
        </a>
        <a href="obyte:${key1[0]}?asset=${encodeURIComponent(data[2].shares_asset)}">
            <button class="button is-small is-primary">withdraw</button>
        </a>`;
    })
    
}

getAaBalances(addresses);


function getGrdPrice() {

    return fetch(`https://data.ostable.org/api/v1/assets`)
    .then(response => {
        return response.json()
    })

}

getGrdPrice();



$('#arb').on('change', function() {
    // console.log($('#arb option:selected').text());
    $('#supply-arb-type').text($('#arb option:selected').text());
    $('#supply-arb-type2').text($('#arb option:selected').text());
    getAaStateVars({address: this.value.split(',')[0]});
    getAaBalances([this.value.split(',')[0]]);
  });


