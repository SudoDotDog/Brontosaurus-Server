/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Database_Interface
 * @description Application
*/

import { ObjectID } from "bson";

export interface IApplicationConfig {

    key: string;
    name: string;
    token: string;
    permissions: ObjectID[];
}

export interface IApplication extends IApplicationConfig {

    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
