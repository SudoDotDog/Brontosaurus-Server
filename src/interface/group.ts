/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Interface
 * @description Group
 */

export enum INTERNAL_USER_GROUP {

    SUPER_ADMIN = 'BRONTOSAURUS_SUPER_ADMIN',
    SELF_CONTROL = 'BRONTOSAURUS_SELF_CONTROL',
}

export interface IGroupConfig {

    name: string;
}

export interface IGroup extends IGroupConfig {

    active: boolean;
    createdAt: Date;
    updatedAt: Date;

    history: string[];
}
