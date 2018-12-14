/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Model
 * @description Account
*/

import { Document, model, Model, Schema } from "mongoose";
import { IAccount } from "../interface/account";

const AccountSchema: Schema = new Schema({

    active: {
        type: Boolean,
        required: true,
        default: true,
    },
    username: {
        type: String,
        required: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
    },
    infos: {
        type: [{
            name: String,
            value: String,
        }],
        required: true,
        default: [],
    },
    permissions: {
        type: [Schema.Types.ObjectId],
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
}

export const AccountModel: Model<IAccountModel> = model<IAccountModel>('Account', AccountSchema);
