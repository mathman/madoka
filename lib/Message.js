
class Message {

    constructor() {
        
        this.init();
    }
    
    init() {
        
        this.completed = false;
        this.error = false;
        this.payloads = new Array();
        this.completePayload = new Array();
        this.completeMessage = new Array();
    }
    
    messageCompleted() {
        
        return this.completed;
    }
    
    getCompleteMessage() {
        
        return this.completeMessage;
    }
    
    pushBuffer(value) {
        
        this.payloads.push(Buffer.from(value));
        this.payloads.sort((a, b) => a[0] - b[0]);
        let state = this.checkMessage();
        if (state == 1) {
            
            console.log("Message is complete");
            this.completeMessage = this.decode();
            this.completed = true;
            console.log("Message decoded");
        }
        return state;
    }
    
    checkMessage() {
    
        if (this.payloads.length <= 0) {
        
            return 0;
        }
        
        if (this.payloads[0].length < 2) {
            
            return 0;
        }
        
        let expectedChunks = Math.trunc(this.payloads[0][1] / 19) + (this.payloads[0][1] % 19 > 0 ? 1 : 0);
        if (expectedChunks != this.payloads.length) {
            
            return 0;
        }
        let expected = 0;
        for (const payload of this.payloads) {
            
            if (payload.length < 2) {
                return 0;
            }
            
            if (payload[0] != expected++) {
                return -1;
            }
        }
        return 1;
    }
    
    decode() {
    
        for (let i = 0; i < this.payloads.length; i++) {
        
            if (i > 0) {
            
                this.payloads[i] = this.payloads[i].slice(1);
            }
            else {
            
                this.payloads[i] = this.payloads[i].slice(2);
            }
        }
        this.completePayload = Buffer.concat(this.payloads);
    
        let madokaFunction = parseInt(this.completePayload[0].toString(16) + this.completePayload[1].toString(16) + this.completePayload[2].toString(16), 16);
        switch (madokaFunction) {
        
            // GetGeneralInfo()
            case 0:
                return this.decodeGeneralInfo();
            // GetSettingStatus()
            case 32:
                return this.decodeSettingStatus();
            // GetOperationMode()
            case 48:
                return this.decodeOperationMode();
            // GetSetpoint()
            case 64:
                return this.decodeSetpoint();
            // GetFanSpeed()
            case 80:
                return this.decodeFanSpeed();
            // GetSensorInformation()
            case 272:
                return this.decodeSensorInformation();
            // GetMaintenanceInformation()
            case 304:
                return this.decodeMaintenanceInformation();
            default:
                return "error";
        }
    }
    
    decodeMaintenanceInformation() {
        
        let messsage = new Array();
        let functionSplitted = this.splitFunction();
        functionSplitted.forEach(func => {
            
            if (func.function === 69) {
                
                messsage.push({name: 'indoorTemperature', value: (func.hex[0] + '.' + func.hex[1] + '.' + func.hex[2])});
            }
            else if (func.function === 70) {
                
                messsage.push({name: 'outdoorTemperature', value: (func.hex[0] + '.' + func.hex[1])});
            }
        });
        return messsage;
    }
    
    decodeSensorInformation() {
        
        let messsage = new Array();
        let functionSplitted = this.splitFunction();
        functionSplitted.forEach(func => {
            
            if (func.function === 64) {
                
                messsage.push({name: 'indoorTemperature', value: func.value});
            }
            else if (func.function === 65) {
                
                let value = func.value;
                if (value == -1) {
                    
                    value = null;
                } else {
                    
                    if (value < 0) {
                        
                        value = ((value + 256) - 128) * -1;
                    }
                }
                messsage.push({name: 'outdoorTemperature', value: value});
            }
        });
        return messsage;
    }
    
    decodeGeneralInfo() {
        
        let messsage = new Array();
        let functionSplitted = this.splitFunction();
        functionSplitted.forEach(func => {
            
            switch (func.function) {
                
                case 16:
                    messsage.push({name: 'majorControlOperations', value: func.value});
                    break;
                case 17:
                    messsage.push({name: 'majorFunctionsSupported', value: func.value});
                    break;
                case 18:
                    messsage.push({name: 'majorSystemFunctions', value: func.value});
                    break;
                case 19:
                    messsage.push({name: 'majorConfigurationSettings', value: func.value});
                    break;
                case 64:
                    messsage.push({name: 'apiVersion', value: func.value});
                    break;
            }
        });
        return messsage;
    }
    
    decodeSettingStatus() {
        
        let messsage = new Array();
        let functionSplitted = this.splitFunction();
        functionSplitted.forEach(func => {
            
            if (func.function === 32) {
                
                messsage.push({name: 'turnedOn', value: func.value});
            }
        });
        return messsage;
    }
    
    decodeOperationMode() {
        
        let messsage = new Array();
        let functionSplitted = this.splitFunction();
        functionSplitted.forEach(func => {
            
            if (func.function === 31) {
                
                messsage.push({name: 'autoCoolHeat', value: func.value});
            }
            else if (func.function === 32) {
                
                messsage.push({name: 'currentMode', value: func.value});
            }
        });
        return messsage;
    }
    
    decodeSetpoint() {
        
        let messsage = new Array();
        let functionSplitted = this.splitFunction();
        functionSplitted.forEach(func => {
            
            switch (func.function) {
                
                case 32:
                    messsage.push({name: 'coolingSetpoint', value: (func.value/128.)});
                    break;
                case 33:
                    messsage.push({name: 'heatingSetpoint', value: (func.value/128.)});
                    break;
                case 48:
                    messsage.push({name: 'setpointRangeEnabled', value: func.value});
                    break;
                case 49:
                    messsage.push({name: 'setpointMode', value: func.value});
                    break;
                case 50:
                    messsage.push({name: 'minimumSetpointDifferential', value: func.value});
                    break;
                case 160:
                    messsage.push({name: 'minCoolingSetpointLowerLimit', value: func.value});
                    break;
                case 161:
                    messsage.push({name: 'minHeatingSetpointLowerLimit', value: func.value});
                    break;
                case 162:
                    messsage.push({name: 'coolingSetpointLowerLimit', value: (func.value/128.0)});
                    break;
                case 163:
                    messsage.push({name: 'heatingSetpointLowerLimit', value: (func.value/128.0)});
                    break;
                case 164:
                    messsage.push({name: 'coolingSetpointLowerLimitSymbol', value: func.value});
                    break;
                case 165:
                    messsage.push({name: 'heatingSetpointLowerLimitSymbol', value: func.value});
                    break;
                case 176:
                    messsage.push({name: 'maxCoolingSetpointUpperLimit', value: func.value});
                    break;
                case 177:
                    messsage.push({name: 'maxHeatingSetpointUpperLimit', value: func.value});
                    break;
                case 178:
                    messsage.push({name: 'coolingSetpointUpperLimit', value: (func.value/128.0)});
                    break;
                case 179:
                    messsage.push({name: 'heatingSetpointUpperLimit', value: (func.value/128.0)});
                    break;
                case 180:
                    messsage.push({name: 'coolingSetpointUpperLimitSymbol', value: func.value});
                    break;
                case 181:
                    messsage.push({name: 'heatingSetpointUpperLimitSymbol', value: func.value});
                    break;
            }
        });
        return messsage;
    }
    
    decodeFanSpeed() {
        
        let messsage = new Array();
        let functionSplitted = this.splitFunction();
        functionSplitted.forEach(func => {
            
            if (func.function === 32) {
                
                messsage.push({name: 'coolingFanSpeed', value: func.value});
            }
            else if (func.function === 33) {
                
                messsage.push({name: 'heatingFanSpeed', value: func.value});
            }
        });
        return messsage;
    }
    
    splitFunction() {
        
        let functionSplitted = new Array();
        for (let i = 3; i < this.completePayload.length;) {
            
            if (this.completePayload[i] <= 0 || this.completePayload[i+1] <= 0 || this.completePayload[i+1] > 16) {
                
                i++;
                continue;
            }
            let stringValue = '';
            let hexArray = new Array();
            for (let j = (i+2); j < (i+2+this.completePayload[i+1]);j++) {
                
                let stringByte = this.completePayload[j].toString(16);
                if (stringByte.length <= 1) {
                    
                    stringByte = '0' + stringByte;
                }
                stringValue = stringValue + stringByte;
                hexArray.push(stringByte);
            }
            
            functionSplitted.push({function: this.completePayload[i], value: parseInt(stringValue, 16), hex: hexArray});
            i = i + this.completePayload[i+1] + 2;
        }
        return functionSplitted;
    }

}

module.exports = Message;