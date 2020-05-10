const Bluez = require('bluez');

const Message = require('./Message');

function delay(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

class Bluetooth {

    constructor() {
        this.address = null;
        this.bluetooth = new Bluez();
        this.device = null;
        this.notChar = null;
        this.writeChar = null;
        this.message = null;
        this.adapter = null;
    }
    
    getMessage() {
        
        return this.message;
    }
    
    async init() {
        
        // Register callback for new devices
        this.bluetooth.on('device', (address, props) => {
            // apply some filtering
            if (address !== this.address) return;
            this.handleDevice(address, props);
        });
    }

    async startBluetooth(address) {
        
        this.address = address;
        this.message = new Message();
        await this.bluetooth.init().then(async () => {
            // listen on first bluetooth adapter
            this.adapter = await this.bluetooth.getAdapter('hci0');
        });
    }
    
    async handleDevice(address, props) {
    
        console.log("Found new Device " + address + " " + props.Name);

        // Get the device interface
        this.device = await this.bluetooth.getDevice(address);
        if (props.Connected) {
        
            console.log("Device connected. Disconnect first");
            await this.device.Disconnect();
        }
        if (this.device === null) {
            
            console.error('Failed to get device');
            await this.closeConnection();
            return;
        }
        console.log("Connecting");
        // try normal connecting first. This might fail, so provide some backup methods
        await this.device.Connect().catch(()=>{
        
            // also directly connecting to the GATT profile fails for an unknown reason. Maybe a Bluez bug?
            return this.device.ConnectProfile("2141e110-213a-11e6-b67b-9e71128cae77");
        }).catch(() => { });
        
        if (!await this.device.Connected()) {
            
            console.error('Failed to connect');
            await this.closeConnection();
            return;
        }

        // wait until services are resolved
        for (let i = 0; !await this.device.ServicesResolved(); i++) {
        
            if (i > 100) {
            
                console.error("Service not resolved");
                await this.closeConnection();
                return;
            }
            await delay(50);
        }
        await delay(10);

        console.log("Connected");
        // get the Service
        const service = this.device.getService("2141e110-213a-11e6-b67b-9e71128cae77");
        if (!service) {
        
            console.error("No Service");
            await this.closeConnection();
            return;
        }
        else {
            this.notChar = service.getCharacteristic("2141e111-213a-11e6-b67b-9e71128cae77");
            if (!this.notChar) {
        
                console.error("No notify Characteristic");
                await this.closeConnection();
                return;
            }
            else {
        
                await this.handleComOld();
            }
            this.writeChar = service.getCharacteristic("2141e112-213a-11e6-b67b-9e71128cae77");
            if (!this.writeChar) {
        
                console.error("No write Characteristic");
                await this.closeConnection();
                return;
            }
        }
    }
    
    async handleComOld() {
        
        // get a notification socket
        await this.notChar.StartNotify().catch(() => { });
        this.notChar.on("notify", async (value) => {
        
            let state = this.message.pushBuffer(value);
            if (state == -1) {
                
                await this.closeConnection();
                process.exit(1);
            }
        });
    }
    
    async writeValue(value) {
        
        if (this.writeChar) {

            await this.writeChar.WriteValue([...Buffer.from(value)]);
        }
        console.log("packet sent");
    }
    
    async sendGetAllInfos() {
        
        if (await this.connected()) {
            let fanSpeed = null;
            let setpoint = null;
            let operationMode = null;
            let settingStatus = null;
            let sensorinformation = null;
            await this.writeValue([0x00, 0x06, 0x00, 0x00, 0x50, 0x00, 0x00]);
            await delay(1000);
            if (this.getMessage().messageCompleted()) {
            
               fanSpeed = this.getMessage().getCompleteMessage();
            }
            this.getMessage().init();
            await this.writeValue([0x00, 0x06, 0x00, 0x00, 0x40, 0x00, 0x00]);
            await delay(1000);
            if (this.getMessage().messageCompleted()) {
            
                setpoint = this.getMessage().getCompleteMessage();
            }
            this.getMessage().init();
            await this.writeValue([0x00, 0x06, 0x00, 0x00, 0x30, 0x00, 0x00]);
            await delay(1000);
            if (this.getMessage().messageCompleted()) {
            
               operationMode = this.getMessage().getCompleteMessage();
            }
            this.getMessage().init();
            await this.writeValue([0x00, 0x06, 0x00, 0x00, 0x20, 0x00, 0x00]);
            await delay(1000);
            if (this.getMessage().messageCompleted()) {
            
                settingStatus = this.getMessage().getCompleteMessage();
            }
            this.getMessage().init();
            await this.writeValue([0x00, 0x06, 0x00, 0x01, 0x10, 0x00, 0x00]);
            await delay(1000);
            if (this.getMessage().messageCompleted()) {
            
                sensorinformation = this.getMessage().getCompleteMessage();
            }
            await this.closeConnection();
            return {fanSpeed: fanSpeed, setpoint: setpoint, operationMode: operationMode, settingStatus: settingStatus, sensorinformation: sensorinformation};
        }
        return false;
    }
    
    async sendGetFanSpeed() {
        
        if (await this.connected()) {
            
            await this.writeValue([0x00, 0x06, 0x00, 0x00, 0x50, 0x00, 0x00]);
        }
        await delay(1000);
        await this.closeConnection();
        if (this.getMessage().messageCompleted()) {
            
            return this.getMessage().getCompleteMessage();
        }
        else {
            
            return false;
        }
    }
    
    async sendSetHeatFanSpeed(value) {
        
        if (await this.connected()) {
            
			let byteBuffer = Buffer.alloc(1);
			byteBuffer.writeInt8(Number(value));
            await this.writeValue([0x00, 0x07, 0x00, 0x40, 0x50, 0x21, 0x01, '0x' + byteBuffer[0].toString(16)]);
			await this.closeConnection();
			return true;
        }
        else {
            
			await this.closeConnection();
            return false;
        }
    }
    
    async sendSetColdFanSpeed(value) {
        
        if (await this.connected()) {
            
			let byteBuffer = Buffer.alloc(1);
			byteBuffer.writeInt8(Number(value));
            await this.writeValue([0x00, 0x07, 0x00, 0x40, 0x50, 0x20, 0x01, '0x' + byteBuffer[0].toString(16)]);
			await this.closeConnection();
			return true;
        }
        else {
            
			await this.closeConnection();
            return false;
        }
    }
    
    async sendGetSetpoint() {
        
        if (await this.connected()) {
            
            await this.writeValue([0x00, 0x06, 0x00, 0x00, 0x40, 0x00, 0x00]);
        }
        await delay(1000);
        await this.closeConnection();
        if (this.getMessage().messageCompleted()) {
            
            return this.getMessage().getCompleteMessage();
        }
        else {
            
            return false;
        }
    }
	
	async sendSetHeatSetpoint(value) {
        
        if (await this.connected()) {
            
			let byteBuffer = Buffer.alloc(2);
			byteBuffer.writeInt16BE(Number(value)*128.0);
            await this.writeValue([0x00, 0x08, 0x00, 0x40, 0x40, 0x21, 0x02, '0x' + byteBuffer[0].toString(16), '0x' + byteBuffer[1].toString(16)]);
			await this.closeConnection();
			return true;
        }
        else {
            
			await this.closeConnection();
            return false;
        }
    }
	
	async sendSetColdSetpoint(value) {
        
        if (await this.connected()) {
            
			let byteBuffer = Buffer.alloc(2);
			byteBuffer.writeInt16BE(Number(value)*128.0);
            await this.writeValue([0x00, 0x08, 0x00, 0x40, 0x40, 0x21, 0x02, '0x' + byteBuffer[0].toString(16), '0x' + byteBuffer[1].toString(16)]);
			await this.closeConnection();
			return true;
        }
        else {
            
			await this.closeConnection();
            return false;
        }
    }
    
    async sendGetOperationMode() {
        
        if (await this.connected()) {
            
            await this.writeValue([0x00, 0x06, 0x00, 0x00, 0x30, 0x00, 0x00]);
        }
        await delay(1000);
        await this.closeConnection();
        if (this.getMessage().messageCompleted()) {
            
            return this.getMessage().getCompleteMessage();
        }
        else {
            
            return false;
        }
    }
    
    async sendSetOperationMode(value) {
        
        if (await this.connected()) {
            
			let byteBuffer = Buffer.alloc(1);
			byteBuffer.writeInt8(Number(value));
            await this.writeValue([0x00, 0x07, 0x00, 0x40, 0x30, 0x20, 0x01, '0x' + byteBuffer[0].toString(16)]);
			await this.closeConnection();
			return true;
        }
        else {
            
			await this.closeConnection();
            return false;
        }
    }
    
    async sendGetSettingStatus() {
        
        if (await this.connected()) {
            
            await this.writeValue([0x00, 0x06, 0x00, 0x00, 0x20, 0x00, 0x00]);
        }
        await delay(1000);
        await this.closeConnection();
        if (this.getMessage().messageCompleted()) {
            
            return this.getMessage().getCompleteMessage();
        }
        else {
            
            return false;
        }
    }
    
    async sendSetSettingStatus(value) {
        
        if (await this.connected()) {
            
			let byteBuffer = Buffer.alloc(1);
			byteBuffer.writeInt8(Number(value));
            await this.writeValue([0x00, 0x07, 0x00, 0x40, 0x20, 0x20, 0x01, '0x' + byteBuffer[0].toString(16)]);
			await this.closeConnection();
			return true;
        }
        else {
            
			await this.closeConnection();
            return false;
        }
    }
    
    async sendGetGeneralInfo() {
        
        if (await this.connected()) {
            
            await this.writeValue([0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00]);
        }
        await delay(1000);
        await this.closeConnection();
        if (this.getMessage().messageCompleted()) {
            
            return this.getMessage().getCompleteMessage();
        }
        else {
            
            return false;
        }
    }
    
    async sendGetSensorInformation() {
        
        if (await this.connected()) {
            
            await this.writeValue([0x00, 0x06, 0x00, 0x01, 0x10, 0x00, 0x00]);
        }
        await delay(1000);
        await this.closeConnection();
        if (this.getMessage().messageCompleted()) {
            
            return this.getMessage().getCompleteMessage();
        }
        else {
            
            return false;
        }
    }
    
    async sendGetMaintenanceInformation() {
        
        if (await this.connected()) {
            
            await this.writeValue([0x00, 0x06, 0x00, 0x01, 0x30, 0x00, 0x00]);
        }
        await delay(1000);
        await this.closeConnection();
        if (this.getMessage().messageCompleted()) {
            
            return this.getMessage().getCompleteMessage();
        }
        else {
            
            return false;
        }
    }
    
    async connected() {
        
        return (this.device && await this.device.Connected());
    }
    
    async closeConnection() {
    
        this.adapter = null;
        if (this.notChar) {
        
            await this.notChar.StopNotify().catch(() => { });
        }
        this.notChar = null;
        this.writeChar = null;
        if (this.device && await this.device.Connected()) {
        
            await this.device.Disconnect();
        }
        this.device = null;
        console.log("Connection closed");
    }
}

module.exports = Bluetooth;