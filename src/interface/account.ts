/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Interface
 * @description Account
*/

import { ObjectID } from "bson";

export type AccountInfo = {

    name: string;
    value: string;
};

export interface IAccountConfig {

    username: string;
    password: string;
    infos: AccountInfo[];
    permissions: ObjectID[];
}

export interface IAccount extends IAccountConfig {

    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
