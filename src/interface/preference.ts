/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Interface
 * @description Preference
 */

export type Preferences = {

    register_info: {
        name: string;
        type: string;
    };
    prepared: boolean;
};

export interface IPreferenceConfig {

    name: string;
    value: any;
}

export interface IPreference extends IPreferenceConfig {

    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
