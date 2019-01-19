/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Interface
 * @description Preference
 */

export type RegisterInfoType = 'string' | 'number';
export type RegisterInfo = {
    name: string;
    type: RegisterInfoType;
};

export type Preferences = {

    registerInfo: RegisterInfo;
    prepared: boolean;

    backgroundImages: string[];
    globalAvatar: string;
};

export interface IPreferenceConfig {

    name: string;
    value: any;
}

export interface IPreference extends IPreferenceConfig {

    active: boolean;
    createdAt: Date;
    updatedAt: Date;

    history: string[];
}
