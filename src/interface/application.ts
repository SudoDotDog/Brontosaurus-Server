/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Interface
 * @description Application
 */

import { ObjectID } from "bson";

export enum INTERNAL_APPLICATION {

    RED = 'BRONTOSAURUS_RED',
}

export interface IApplicationConfig {

    avatar?: string;
    key: string;
    name: string;

    expire: number;
    secret: string;

    groups: ObjectID[];
}

export interface IApplication extends IApplicationConfig {

    active: boolean;
    createdAt: Date;
    updatedAt: Date;

    history: string[];
}
