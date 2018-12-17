/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Interface
 * @description Application
 */

export interface IApplicationConfig {

    key: string;
    name: string;
    token: string;
}

export interface IApplication extends IApplicationConfig {

    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
