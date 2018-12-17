/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Interface
 * @description Account
 */

import { ObjectID } from "bson";

export interface IAccountConfig {

    username: string;
    password: string;
    infos: string[];
    groups: ObjectID[];
}

export interface IAccount extends IAccountConfig {

    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
