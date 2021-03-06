import { PV } from '../pv/PV';

export class PVWrapper {

    constructor(private pv: PV) {
    }

    getName() {
        return this.pv.name;
    }

    getValue() {
        return this.pv.value;
    }

    setValue(value: any) {
        this.pv.pvEngine.setValue(new Date(), this.pv.name, value);
    }
}
