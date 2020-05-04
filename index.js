const express = require('express');

const Bluetooth = require('./lib/Bluetooth');

function delay(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}
 
let webServer;
let bluetooth;
let inProgess = false;
const args = process.argv.slice(2);
const port = args[0];

(async () => {

    var app = express();
    
    bluetooth = new Bluetooth();
    
    bluetooth.init();
    
    app.get('/device/:devicemac/fanspeed', async function(req, res) {

        if (inProgess == false) {
            
            inProgess = true;
        }
        else {
            
            res.status(503);
            res.send('Error');
            return;
        }
        await bluetooth.startBluetooth(req.params.devicemac);
        await delay(6000);
        let message = await bluetooth.sendGetFanSpeed();
        if (!message) {
            
            res.status(504);
            res.send('Error');
        }
        else {
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(message));
        }
        inProgess = false;
    })
    .get('/device/:devicemac/fanspeed/heat/:value', async function(req, res) {

        if (inProgess == false) {
            
            inProgess = true;
        }
        else {
            
            res.status(503);
            res.send('Error');
            return;
        }
        await bluetooth.startBluetooth(req.params.devicemac);
        await delay(6000);
        let state = await bluetooth.sendSetHeatFanSpeed(req.params.value);
		if (!state) {
            
            res.status(504);
            res.send('Error');
        }
        else {
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify("success"));
        }
        inProgess = false;
    })
	.get('/device/:devicemac/fanspeed/cold/:value', async function(req, res) {

        if (inProgess == false) {
            
            inProgess = true;
        }
        else {
            
            res.status(503);
            res.send('Error');
            return;
        }
        await bluetooth.startBluetooth(req.params.devicemac);
        await delay(6000);
        let state = await bluetooth.sendSetColdFanSpeed(req.params.value);
		if (!state) {
            
            res.status(504);
            res.send('Error');
        }
        else {
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify("success"));
        }
        inProgess = false;
    })
    .get('/device/:devicemac/setpoint', async function(req, res) {

        if (inProgess == false) {
            
            inProgess = true;
        }
        else {
            
            res.status(503);
            res.send('Error');
            return;
        }
        await bluetooth.startBluetooth(req.params.devicemac);
        await delay(6000);
        let message = await bluetooth.sendGetSetpoint();
        if (!message) {
            
            res.status(504);
            res.send('Error');
        }
        else {
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(message));
        }
        inProgess = false;
    })
	.get('/device/:devicemac/setpoint/heat/:value', async function(req, res) {

        if (inProgess == false) {
            
            inProgess = true;
        }
        else {
            
            res.status(503);
            res.send('Error');
            return;
        }
        await bluetooth.startBluetooth(req.params.devicemac);
        await delay(6000);
        let state = await bluetooth.sendSetHeatSetpoint(req.params.value);
		if (!state) {
            
            res.status(504);
            res.send('Error');
        }
        else {
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify("success"));
        }
        inProgess = false;
    })
	.get('/device/:devicemac/setpoint/cold/:value', async function(req, res) {

        if (inProgess == false) {
            
            inProgess = true;
        }
        else {
            
            res.status(503);
            res.send('Error');
            return;
        }
        await bluetooth.startBluetooth(req.params.devicemac);
        await delay(6000);
        let state = await bluetooth.sendSetColdSetpoint(req.params.value);
		if (!state) {
            
            res.status(504);
            res.send('Error');
        }
        else {
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify("success"));
        }
        inProgess = false;
    })
    .get('/device/:devicemac/operationmode', async function(req, res) {

        if (inProgess == false) {
            
            inProgess = true;
        }
        else {
            
            res.status(503);
            res.send('Error');
            return;
        }
        await bluetooth.startBluetooth(req.params.devicemac);
        await delay(6000);
        let message = await bluetooth.sendGetOperationMode();
        if (!message) {
            
            res.status(504);
            res.send('Error');
        }
        else {
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(message));
        }
        inProgess = false;
    })
    .get('/device/:devicemac/operationmode/set/:value', async function(req, res) {

        if (inProgess == false) {
            
            inProgess = true;
        }
        else {
            
            res.status(503);
            res.send('Error');
            return;
        }
        await bluetooth.startBluetooth(req.params.devicemac);
        await delay(6000);
        let state = await bluetooth.sendSetOperationMode(req.params.value);
		if (!state) {
            
            res.status(504);
            res.send('Error');
        }
        else {
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify("success"));
        }
        inProgess = false;
    })
    .get('/device/:devicemac/settingstatus', async function(req, res) {

        if (inProgess == false) {
            
            inProgess = true;
        }
        else {
            
            res.status(503);
            res.send('Error');
            return;
        }
        await bluetooth.startBluetooth(req.params.devicemac);
        await delay(6000);
        let message = await bluetooth.sendGetSettingStatus();
        if (!message) {
            
            res.status(504);
            res.send('Error');
        }
        else {
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(message));
        }
        inProgess = false;
    })
    .get('/device/:devicemac/settingstatus/set/:value', async function(req, res) {

        if (inProgess == false) {
            
            inProgess = true;
        }
        else {
            
            res.status(503);
            res.send('Error');
            return;
        }
        await bluetooth.startBluetooth(req.params.devicemac);
        await delay(6000);
        let state = await bluetooth.sendSetSettingStatus(req.params.value);
		if (!state) {
            
            res.status(504);
            res.send('Error');
        }
        else {
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify("success"));
        }
        inProgess = false;
    })
    .get('/device/:devicemac/generalinfo', async function(req, res) {

        if (inProgess == false) {
            
            inProgess = true;
        }
        else {
            
            res.status(503);
            res.send('Error');
            return;
        }
        await bluetooth.startBluetooth(req.params.devicemac);
        await delay(6000);
        let message = await bluetooth.sendGetGeneralInfo();
        if (!message) {
            
            res.status(504);
            res.send('Error');
        }
        else {
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(message));
        }
        inProgess = false;
    })
    .get('/device/:devicemac/sensorinformation', async function(req, res) {

        if (inProgess == false) {
            
            inProgess = true;
        }
        else {
            
            res.status(503);
            res.send('Error');
            return;
        }
        await bluetooth.startBluetooth(req.params.devicemac);
        await delay(6000);
        let message = await bluetooth.sendGetSensorInformation();
        if (!message) {
            
            res.status(504);
            res.send('Error');
        }
        else {
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(message));
        }
        inProgess = false;
    })
    .get('/device/:devicemac/maintenanceinformation', async function(req, res) {

        if (inProgess == false) {
            
            inProgess = true;
        }
        else {
            
            res.status(503);
            res.send('Error');
            return;
        }
        await bluetooth.startBluetooth(req.params.devicemac);
        await delay(6000);
        let message = await bluetooth.sendGetMaintenanceInformation();
        if (!message) {
            
            res.status(504);
            res.send('Error');
        }
        else {
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(message));
        }
        inProgess = false;
    })
    .get('/stop', function(req, res) {
        process.exit(0);
    })
    .use(function(req, res, next){
        res.setHeader('Content-Type', 'text/plain');
        res.status(404).send('Page introuvable !');
    });

    webServer = app.listen(port, function () {
        
        console.log("Api started on port: " + port);
        console.log("Program started");
    })
})();

process.on("SIGINT", async () => {
    
    if (bluetooth) {
        
        bluetooth.closeConnection();
    }
    if (webServer) {
        
        webServer.close(() => {
            
            console.log('Http server closed.');
        });
    }
    process.removeAllListeners("SIGINT");
});