/* ------------------------------------------------------------------
* node-beacon-scanner - parser-kontakt.js
* ---------------------------------------------------------------- */
'use strict';

/* ------------------------------------------------------------------
* Constructor: BeaconParserKontakt()
* ---------------------------------------------------------------- */
const BeaconParserKontakt = function() {
    this._KONTAKT_SERVICE_UUID = 'fe6a';
};

/* ------------------------------------------------------------------
* Method: parse(peripheral)
* - peripheral: `Peripheral` object of the noble
* ---------------------------------------------------------------- */
BeaconParserKontakt.prototype.parse = function(peripheral) {
    let ad = peripheral.advertisement;
    // First things first... Get the service data
    let tlmdata = Array.from(ad.serviceData[0].data);

    if (tlmdata.length === 5){
        return null;
    }

    let payload_identifier = tlmdata.shift();

    // Telemetry data starts with a number 3
    if (payload_identifier === 3){
        /*/
        /*	This is a telemetry data
        /*  https://developer.kontakt.io/hardware/packets/telemetry
        /*/
        let groups = [];

        do {
            groups.push(tlmdata.splice(0, tlmdata.shift()));
        } while (tlmdata.length > 0);

        console.log('We have everything');
        let accelerometer = {};
        let sensors = {};
        let health = {};

        // Now that everything is grouped, we can parse it
        groups.forEach(function (item, index) {
            let type = item.shift();
            switch (type) {
                case 2:
                    // Accelerometer group
                    accelerometer = {
                        sensitivity: item[0],
                        xAxis: item[1],
                        yAxis: item[2],
                        zAxis: item[3],
                        doubleTap: item[4],
                        doubleTapCont: item[5],
                        movement: item[6],
                        movementCont: item[7]
                    };
                    break;
                case 5:
                    // Sensor group
                    sensors = {
                        light: item[0],
                        temperature: item[1]
                    };
                    break;
                case 1:
                    // System Health group
                    health = {
                        time: item[0],
                        time2: item[1],
                        time3: item[2],
                        time4: item[3],
                        battery: item[4]
                    };
                    break;
            }
        });

        return {
            accelerometer: accelerometer,
            sensors: sensors,
            health: health
        }
    } else if (payload_identifier === 5){
        console.log('We have everything');
        let item = tlmdata;

        location = {
            nominalTx: item[0],
            bleChannel: item[1],
            beaconIdentifier: item[2],
            beaconMoving: item[3]
        };

        return {
            location: location
        }
    }
    return null;
};

module.exports = new BeaconParserKontakt();
