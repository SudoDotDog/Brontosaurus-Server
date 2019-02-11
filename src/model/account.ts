/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Model
 * @description Account
 */

import { Basics } from "@brontosaurus/definition";
import { ObjectID } from "bson";
import { Document, model, Model, Schema } from "mongoose";
import { IAccount, INFOS_SPLITTER } from "../interface/account";
import { garblePassword } from "../util/auth";

const AccountSchema: Schema = new Schema({

    active: {
        type: Boolean,
        required: true,
        default: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
    },

    infos: {
        type: [String],
        required: true,
        default: [],
    },
    beacons: {
        type: [String],
        required: true,
        default: [],
    },
    groups: {
        type: [Schema.Types.ObjectId],
        required: true,
        default: [],
    },

    salt: {
        type: String,
        required: true,
    },

    avatar: {
        type: String,
    },
    history: {
        type: [String],
        required: true,
        default: [],
    },
}, {
        timestamps: {
            createdAt: true,
            updatedAt: true,
        },
    });


export interface IAccountModel extends IAccount, Document {
    readonly getInfoRecords: () => Record<string, Basics>;
    readonly getBeaconRecords: () => Record<string, Basics>;
    readonly pushHistory: (history: string) => IAccountModel;
    readonly addGroup: (id: ObjectID) => IAccountModel;
    readonly removeGroup: (id: ObjectID) => IAccountModel;
    readonly setPassword: (password: string) => IAccountModel;
    readonly verifyPassword: (password: string) => boolean;
}

AccountSchema.methods.getInfoRecords = function (this: IAccountModel): Record<string, Basics> {

    return this.infos.reduce((previous: Record<string, Basics>, current: string) => {
        const splited: string[] = current.split(INFOS_SPLITTER);
        if (splited.length === 2) {
            return {
                ...previous,
                [splited[0]]: splited[1],
            };
        }
        return previous;
    }, {} as Record<string, Basics>);
};

AccountSchema.methods.getBeaconRecords = function (this: IAccountModel): Record<string, Basics> {

    return this.beacons.reduce((previous: Record<string, Basics>, current: string) => {
        const splited: string[] = current.split(INFOS_SPLITTER);
        if (splited.length === 2) {
            return {
                ...previous,
                [splited[0]]: splited[1],
            };
        }
        return previous;
    }, {} as Record<string, Basics>);
};

AccountSchema.methods.pushHistory = function (this: IAccountModel, history: string): IAccountModel {

    this.history = [...this.history, history];

    return this;
};

AccountSchema.methods.addGroup = function (this: IAccountModel, id: ObjectID): IAccountModel {

    if (this.groups.some((group: ObjectID) => group.equals(id))) {
        return this;
    }

    this.groups = [...this.groups, id];

    return this;
};

AccountSchema.methods.removeGroup = function (this: IAccountModel, id: ObjectID): IAccountModel {

    this.groups = this.groups.reduce((previous: ObjectID[], current: ObjectID) => {

        if (current.equals(id)) {
            return previous;
        }
        return [...previous, current];
    }, [] as ObjectID[]);

    return this;
};

AccountSchema.methods.setPassword = function (this: IAccountModel, password: string): IAccountModel {

    const saltedPassword: string = garblePassword(password, this.salt);
    this.password = saltedPassword;

    return this;
};

AccountSchema.methods.verifyPassword = function (this: IAccountModel, password: string): boolean {

    const saltedPassword: string = garblePassword(password, this.salt);

    return this.password === saltedPassword;
};

export const AccountModel: Model<IAccountModel> = model<IAccountModel>('Account', AccountSchema);
