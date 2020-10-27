'use strict';

// Connect to mainnet official node 'wss://obyte.org/bb'
var options = { reconnect: true };
var client = new obyte.Client('wss://obyte.org/bb', options);
var assetPrices = fetch(`https://data.ostable.org/api/v1/assets`).then(response => response.json());

function getAaBalances(params2) {
    client.api.getBalances(params2, function (err, result) {
        return result
    })
    .then(result => {
        var xyz = Object.keys(result);
        var params = {address: xyz[0]};
        var requests = [];
        requests.push(Promise.resolve(result));
        requests.push(assetPrices);

        var aaStateVars = client.api.getAaStateVars(params, function (err, result) {
            return result
        })
        requests.push(aaStateVars);
        
        return Promise.all(requests);
    })
    .then(data => {
        var key1 = Object.keys(data[0]);
        var key2 = Object.keys(data[0][key1]);
        var t1OrInterestTokenName = $('#arb').val().split(',')[1]; // t1 or interest token name
        if (key1[0] === "PVL22DMGM57FOYKJRPKMQBFM2BUSJLDU" || key1[0] === "Y3NP6UMNFMA6DU2DGPJN4HB65KHKVAKR" || key1[0] === "YSGAUS4DWUORJMV3TEZXPCAEFCT4FGO3" || key1[0] === "USKWYTYD4NKBIOGPFGROG5NNTQQLISYB" || key1[0] === "6DV4SOBQ5XCC44242HTRXJMRQUXYZFSI" || key1[0] === "6KGD2SIKEIMWKUWC5E5265JKMMZHFWF2") {
            // if t1/reserve arb
            var base_stable = data[0][key1].base.stable / 1000000000;
            var base_pending = data[0][key1].base.pending / 1000000000;
            var base_total = base_stable + base_pending;
            var growthToken_pending = data[0][key1][key2[1]].pending / 1000000000;
            var growthToken_stable = data[0][key1][key2[1]].stable / 1000000000;
            var growthToken_total = growthToken_stable + growthToken_pending;
            var growthTokenPrice = data[1][t1OrInterestTokenName].last_gbyte_value;
            var totalPrice = base_total + (growthToken_total*growthTokenPrice);
            var base_percentage = base_total / totalPrice * 100;
            var arb_supply = data[2].shares_supply / 1000000000;
            document.getElementById("supply").innerHTML = `${arb_supply} <br><a href="https://explorer.obyte.org/#${key1[0]}" target="_blank">(see on explorer)</a>`;
            document.getElementById("share_value").innerHTML = `${(totalPrice / arb_supply).toFixed(2)}`;
            document.getElementById("assets").innerHTML = `
                ${(base_total).toFixed(2)} GBYTE (${base_percentage.toFixed(2)} %)<br>
                + ${growthToken_total.toFixed(2)} ${t1OrInterestTokenName} (${(100 - base_percentage).toFixed(2)} %)<br>
                = ${totalPrice.toFixed(2)} GBYTE`;
            document.getElementById("actions").innerHTML = `
            <a href="obyte:${key1[0]}?asset=base">
                <button class="button is-small is-primary">add GBYTE</button>
            </a>
            <a href="obyte:${key1[0]}?asset=${encodeURIComponent(key2[1])}">
                <button class="button is-small is-primary">add ${t1OrInterestTokenName}</button>
            </a>
            <a href="obyte:${key1[0]}?asset=${encodeURIComponent(data[2].shares_asset)}">
                <button class="button is-small is-primary">withdraw</button>
            </a>`;
        } else {
            // if stable/interest arb
            var interestToken = $('#arb').val().split(',')[1];
            var stableToken = $('#arb').val().split(',')[2];
            var interestDecimals = $('#arb').val().split(',')[3]; // decimals of interest and stable token
            var interestTokenPrice = data[1][interestToken].last_gbyte_value;
            var stableTokenPrice = data[1][stableToken].last_gbyte_value;
            var arb_supply = data[2].shares_supply / interestDecimals;
            if (!data[0][key1][key2[2]]) {
                // case if only interest token and gbyte in assets
                var interest_pending = data[0][key1][key2[1]].pending / interestDecimals;
                var interest_stable = data[0][key1][key2[1]].stable / interestDecimals;
                var interest_total = interest_pending + interest_stable;
                var totalPrice = interestTokenPrice * interest_total;
                document.getElementById("supply").innerHTML = `${arb_supply} <br><a href="https://explorer.obyte.org/#${key1[0]}" target="_blank">(see on explorer)</a>`;
                document.getElementById("share_value").innerHTML = `${(totalPrice / arb_supply).toFixed(2)}`;
                document.getElementById("assets").innerHTML = `
                    ${interest_total.toFixed(2)} ${t1OrInterestTokenName} (100 %)<br>
                    = ${totalPrice.toFixed(2)} GBYTE`;
                document.getElementById("actions").innerHTML = `
                <a href="obyte:${key1[0]}?asset=${encodeURIComponent(key2[1])}">
                    <button class="button is-small is-primary">add ${interestToken}</button>
                </a>
                <a href="obyte:${key1[0]}?asset=${encodeURIComponent(data[2].shares_asset)}">
                    <button class="button is-small is-primary">withdraw</button>
                </a>`;
            } else {
                //case if interest tokens and stable tokens and arb asset in AA balance, e.g USD
                var interest_pending = data[0][key1][key2[2]].pending / interestDecimals;
                var interest_stable = data[0][key1][key2[2]].stable / interestDecimals;
                var interest_total = interest_pending + interest_stable;
                var stable_pending = data[0][key1][key2[3]].pending / interestDecimals;
                var stable_stable = data[0][key1][key2[3]].stable / interestDecimals;
                var stable_total = stable_pending + stable_stable;
                var totalPrice = (interestTokenPrice * interest_total) + (stableTokenPrice * stable_total);
                var interest_percentage = (interestTokenPrice * interest_total) / ((interestTokenPrice * interest_total) + (stableTokenPrice * stable_total)) *100;
                document.getElementById("supply").innerHTML = `${arb_supply} <br><a href="https://explorer.obyte.org/#${key1[0]}" target="_blank">(see on explorer)</a>`;
                document.getElementById("share_value").innerHTML = `${(totalPrice / arb_supply).toFixed(2)}`;
                document.getElementById("assets").innerHTML = `
                    ${interest_total.toFixed(2)} ${interestToken} (${interest_percentage.toFixed(2)} %)<br>
                    + ${stable_total.toFixed(2)} ${stableToken} (${(100 - interest_percentage).toFixed(2)} %)<br>
                    = ${totalPrice.toFixed(2)} GBYTE`;
                document.getElementById("actions").innerHTML = `
                <a href="obyte:${key1[0]}?asset=${encodeURIComponent(key2[2])}">
                    <button class="button is-small is-primary">add ${interestToken}</button>
                </a>
                <a href="obyte:${key1[0]}?asset=${encodeURIComponent(data[2].shares_asset)}">
                    <button class="button is-small is-primary">withdraw</button>
                </a>`;
            }
            
        }
        
    })
    
}

function update() {
    $('#supply-arb-type').text($('#arb option:selected').text());
    $('#supply-arb-type2').text($('#arb option:selected').text());
    var address = $('#arb').val().split(',')[0];
    getAaBalances([address]);
}

$(document).ready(update);
$('#arb').on('change', update);
