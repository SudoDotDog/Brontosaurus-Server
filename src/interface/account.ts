/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Interface
 * @description Account
 */

import { ObjectID } from "bson";

export const INFOS_SPLITTER = ':*:';

export interface IAccountConfig {

    username: string;
    password: string;

    infos: string[];
    groups: ObjectID[];
}

export interface IAccount extends IAccountConfig {

    active: boolean;
    history: string[];
    createdAt: Date;
    updatedAt: Date;

    avatar?: string;
}
