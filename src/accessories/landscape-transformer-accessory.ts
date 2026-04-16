import { CharacteristicValue, PlatformAccessory } from 'homebridge';
import { FunctionCharacteristic } from '../models/function-characteristic';
import { HubspacePlatform } from '../platform';
import { isNullOrUndefined } from '../utils';
import { HubspaceAccessory } from './hubspace-accessory';

export class LandscapeTransformerAccessory extends HubspaceAccessory{

    /**
     * Creates a new instance of the accessory
     * @param platform Hubspace platform
     * @param accessory Platform accessory
     */
    constructor(platform: HubspacePlatform, accessory: PlatformAccessory) {
        super(platform, accessory, platform.Service.Switch);

        this.configureZone();
    }

    private configureZone(): void{
        if(!this.supportsCharacteristic(FunctionCharacteristic.Toggle)){
            this.log.warn(`${this.device.name}: Device does not support toggle function`);
            return;
        }

        this.service.getCharacteristic(this.platform.Characteristic.On)
            .onGet(this.getState.bind(this))
            .onSet(this.setState.bind(this));
    }

    private async getState(): Promise<CharacteristicValue>{
        const func = this.getFunctionForCharacteristics(FunctionCharacteristic.Toggle);
        const value = await this.deviceService.getValueAsBoolean(this.device.deviceId, func);

        if(isNullOrUndefined(value)){
            this.setNotResponding();
        }

        this.log.debug(`${this.device.name}: Triggered GET State: ${value}`);
        return value!;
    }

    private async setState(value: CharacteristicValue): Promise<void>{
        const func = this.getFunctionForCharacteristics(FunctionCharacteristic.Toggle);
        this.log.debug(`${this.device.name}: Triggered SET State: ${value}`);
        await this.deviceService.setValue(this.device.deviceId, func, value);
        this.service.updateCharacteristic(this.platform.Characteristic.On, value);
    }

}
