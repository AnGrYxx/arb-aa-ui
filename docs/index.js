'use strict';

// Connect to any node that accepts incomming connections https://stats.obyte.org/worldmap.php
var options = { reconnect: true };
var client = new obyte.Client('wss://relay.bytes.cash/bb', options);
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
        var t1OrInterestAsset = data[1][t1OrInterestTokenName] ? data[1][t1OrInterestTokenName].asset_id : '';
        var t2stableAAs = [
            'BCMFNDHNQDEECEWAKUXYIHFE6GXAJ2F6',
            'ED4PXGI5HOOKMMQAOWZAOF6E3GS5JBEJ',
            'ENVRH2JPPWBVD7A2FXPMSV6WV5M75T7A',
            'WVCFYYQW7DFIKHNKKJZTICXFII4IYEN3',
        ];
        if (!t2stableAAs.includes(key1[0])) {
            // if t1/reserve arb
            var reserveTokenName = $('#arb').val().split(',')[2] || 'GBYTE';
            var reserveAsset = reserveTokenName === 'GBYTE' ? 'base' : data[1][reserveTokenName].asset_id;
            var reserveDecimals = $('#arb').val().split(',')[3] || 1000000000; // decimals of reserve asset
            var reserveConfirmed = data[0][key1] && data[0][key1][reserveAsset] ? data[0][key1][reserveAsset].stable / reserveDecimals : 0;
            var reservePending = data[0][key1] && data[0][key1][reserveAsset] ? data[0][key1][reserveAsset].pending / reserveDecimals : 0;
            var reserveTotal = reserveConfirmed + reservePending;
            var growthDecimals = data[1][t1OrInterestTokenName] ? data[1][t1OrInterestTokenName].decimals : 9;
            var growthPending = data[0][key1] && data[0][key1][t1OrInterestAsset] ? data[0][key1][t1OrInterestAsset].pending / (10 ** growthDecimals) : 0;
            var growthConfirmed = data[0][key1] && data[0][key1][t1OrInterestAsset] ? data[0][key1][t1OrInterestAsset].stable / (10 ** growthDecimals) : 0;
            var growthTotal = growthConfirmed + growthPending;
            var reservePrice = data[1][reserveTokenName] ? data[1][reserveTokenName].last_gbyte_value : 1;
            var growthPrice = data[1][t1OrInterestTokenName].last_gbyte_value;
            var totalPrice = (reserveTotal * reservePrice) + (growthTotal * growthPrice);
            var arbSupply = data[2].shares_supply / reserveDecimals || 0;
            var poolPercentage = (reserveTotal * reservePrice) / ((reserveTotal * reservePrice) + (growthTotal * growthPrice)) * 100;
            var shareValue = arbSupply ? totalPrice / arbSupply : 0;

            document.getElementById("supply").innerHTML = `${arbSupply} <br>(<a href="https://explorer.obyte.org/#${key1[0]}" target="_blank">see on explorer</a>)`;
            document.getElementById("share_value").innerHTML = `${shareValue.toFixed(4)} GBYTE<br>(${(shareValue/data[1]['OUSD'].last_gbyte_value).toFixed(2)} USD)`;
            document.getElementById("assets").innerHTML = `
                ${(reserveTotal).toFixed(2)} ${reserveTokenName} (${poolPercentage.toFixed(2)} %)<br>
                + ${growthTotal.toFixed(4)} ${t1OrInterestTokenName} (${(100 - poolPercentage).toFixed(2)} %)<br>
                = ${totalPrice.toFixed(2)} GBYTE (${(totalPrice/data[1]['OUSD'].last_gbyte_value).toFixed(0)} USD)`;

            document.getElementById("actions").innerHTML = 'view only';
            if (!$('#arb option:selected').attr('rel').startsWith('SF')) {
                document.getElementById("actions").innerHTML = `
                <a href="obyte:${key1[0]}?asset=${encodeURIComponent(reserveAsset)}"><button class="button is-small is-primary">add ${reserveTokenName}</button></a>
                <a href="obyte:${key1[0]}?asset=${encodeURIComponent(t1OrInterestAsset)}"><button class="button is-small is-primary">add ${t1OrInterestTokenName}</button></a>
                <a href="obyte:${key1[0]}?asset=${encodeURIComponent(data[2].shares_asset)}"><button class="button is-small is-primary">withdraw both</button></a>`;
            }
        }
        else {
            // if stable/interest arb
            var interestTokenName = $('#arb').val().split(',')[1];
            var stableTokenName = $('#arb').val().split(',')[2];
            var interestDecimals = $('#arb').val().split(',')[3] || 1000000000; // decimals of interest, stable and share token
            var interestTokenPrice = data[1][interestTokenName].last_gbyte_value;
            var stableTokenPrice = data[1][stableTokenName].last_gbyte_value;
            var stableAsset = data[1][stableTokenName].asset_id;
            var interestPending = data[0][key1] && data[0][key1][t1OrInterestAsset] ? data[0][key1][t1OrInterestAsset].pending / interestDecimals : 0;
            var interestConfirmed = data[0][key1] && data[0][key1][t1OrInterestAsset] ? data[0][key1][t1OrInterestAsset].stable / interestDecimals : 0;
            var interestTotal = interestPending + interestConfirmed;
            var stablePending = data[0][key1] && data[0][key1][stableAsset] ? data[0][key1][stableAsset].pending / interestDecimals : 0;
            var stableConfirmed = data[0][key1] && data[0][key1][stableAsset] ? data[0][key1][stableAsset].stable / interestDecimals : 0;
            var stableTotal = stablePending + stableConfirmed;
            var totalPrice = (interestTokenPrice * interestTotal) + (stableTokenPrice * stableTotal);
            var arbSupply = data[2].shares_supply / interestDecimals;
            var poolPercentage = (interestTokenPrice * interestTotal) / ((interestTokenPrice * interestTotal) + (stableTokenPrice * stableTotal)) * 100;
            var shareValue = arbSupply ? totalPrice / arbSupply : 0;

            document.getElementById("supply").innerHTML = `${arbSupply} <br>(<a href="https://explorer.obyte.org/#${key1[0]}" target="_blank">see on explorer</a>)`;
            document.getElementById("share_value").innerHTML = `${shareValue.toFixed(4)} GBYTE<br>(${(shareValue/data[1]['OUSD'].last_gbyte_value).toFixed(2)} USD)`;
            document.getElementById("assets").innerHTML = `${interestTotal.toFixed(2)} ${interestTokenName} (${poolPercentage.toFixed(2)} %)<br>`;
            document.getElementById("assets").innerHTML += stableTotal ? `+ ${stableTotal.toFixed(2)} ${stableTokenName} (${(100 - poolPercentage).toFixed(2)} %)<br>` : '';
            document.getElementById("assets").innerHTML += `= ${totalPrice.toFixed(2)} GBYTE (${(totalPrice/data[1]['OUSD'].last_gbyte_value).toFixed(0)} USD)`;
            document.getElementById("actions").innerHTML = `
            <a href="obyte:${key1[0]}?asset=${encodeURIComponent(t1OrInterestAsset)}"><button class="button is-small is-primary">add ${interestTokenName}</button></a>
            <a href="obyte:${key1[0]}?asset=${encodeURIComponent(data[2].shares_asset)}"><button class="button is-small is-primary">withdraw ${interestTokenName}</button></a>`;
        }
    });
}

function update() {
    $('#supply-arb-type').text($('#arb option:selected').attr('rel'));
    $('#supply-arb-type2').text($('#arb option:selected').attr('rel'));
    var address = $('#arb').val().split(',')[0];
    getAaBalances([address]);
}

$(document).ready(update);
$('#arb').on('change', update);

$('#actions').on('click', 'a', function(e) {
    if ($('#opener option:selected').val() === 'qr') {
        e.preventDefault();
        $('#qr-modal .modal-body').html('').qrcode({
            render: !!document.createElement('canvas').getContext ? 'canvas' : 'table',
            width: 420,
            height: 420,
            text: $(e.target).parent('a').attr('href')
        });
        $('#qr-modal').modal('show');
    }
});
