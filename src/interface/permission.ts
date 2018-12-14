/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Database_Interface
 * @description Permission
*/

import { ObjectID } from "bson";

export interface IPermissionConfig {

    application: ObjectID;
    name: string;
    key: string;
}

export interface IPermission extends IPermissionConfig {

    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
