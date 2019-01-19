/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Model
 * @description Account
 */

import { Basics } from "@brontosaurus/definition";
import { ObjectID } from "bson";
import { Document, model, Model, Schema } from "mongoose";
import { IAccount, INFOS_SPLITTER } from "../interface/account";

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
    groups: {
        type: [Schema.Types.ObjectId],
        required: true,
        default: [],
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
    getInfoRecords: () => Record<string, Basics>;
    pushHistory: (history: string) => IAccountModel;
    addGroup: (id: ObjectID) => IAccountModel;
    removeGroup: (id: ObjectID) => IAccountModel;
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

export const AccountModel: Model<IAccountModel> = model<IAccountModel>('Account', AccountSchema);
