/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Interface
 * @description Group
 */

export interface IGroupConfig {

    name: string;
}

export interface IGroup extends IGroupConfig {

    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
