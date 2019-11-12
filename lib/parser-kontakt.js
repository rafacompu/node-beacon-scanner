/* ------------------------------------------------------------------
* node-beacon-scanner - parser-kontakt.js
* ---------------------------------------------------------------- */
'use strict';

/* ------------------------------------------------------------------
* Constructor: BeaconParserKontakt()
* ---------------------------------------------------------------- */
const BeaconParserKontakt = function () {
    this._KONTAKT_SERVICE_UUID = 'fe6a';
};

/* ------------------------------------------------------------------
* Method: parse(peripheral)
* - peripheral: `Peripheral` object of the noble
* ---------------------------------------------------------------- */
BeaconParserKontakt.prototype.parse = function (peripheral) {
    let ad = peripheral.advertisement;
    // First things first... Get the service data
    let tlmdata = Array.from(ad.serviceData[0].data);

    if (tlmdata.length === 5) {
        return null;
    }

    let payload_identifier = tlmdata.shift();

    // Telemetry data starts with a number 3
    if (payload_identifier === 3) {
        /*/
        /*	This is a telemetry data
        /*  https://developer.kontakt.io/hardware/packets/telemetry
        /*/
        let groups = [];

        do {
            groups.push(tlmdata.splice(0, tlmdata.shift()));
        } while (tlmdata.length > 0);

        let accelerometer = {};
        let temperature = {};
        let battery = {};
        let movement_event = {};
        let utc_time = {};
        let identified_button_click = {};
        let health = {};

        // Now that everything is grouped, we can parse it
        groups.forEach(function (item, index) {
            let type = item.shift();
            switch (type) {
                case 1:
                    // System Health
                    const time = Buffer.from(item.slice(0, 4)).readUInt32LE()

                    // System Health group
                    health = {
                        time,
                        battery: item[4]
                    };
                    break;
                case 2:
                    break;
                case 3:
                    break;
                case 4:
                    break;
                case 5:
                    break;
                case 6:
                    // Raw Accelerometer
                    accelerometer = {
                        sensitivity: item[0],
                        xAxis: item[1],
                        yAxis: item[2],
                        zAxis: item[3]
                    };
                    break;
                case 11:
                    // Temperature
                    temperature = {
                        temperature: item[0]
                    };
                    break;
                case 17:
                    // Identifier Button Click
                    identified_button_click = {
                        button_click_counter: item[0],
                        second_since_last_button_click: Buffer.from(item.slice(1, 3)).readUInt16LE()
                    };
                    break;
                case 22:
                    movement_event = {
                        counter: item[0],
                        seconds_since_last_movement: Buffer.from(item.slice(1, 3)).readUInt16LE()
                    };
                    break;
            }
        });

        return {
            accelerometer: accelerometer,
            temperature: temperature,
            battery: battery,
            movement_event: movement_event,
            utc_time: utc_time,
            identified_button_click: identified_button_click,
            health: health
        }
    } else if (payload_identifier === 5) {
        let item = tlmdata;

        const location = {
            nominalTx: item[0],
            bleChannel: item[1],
            beaconIdentifier: item[2],
            beaconMoving: item[3]
        };

        return {
            location,
        }
    }

    return null;
};

module.exports = new BeaconParserKontakt();
