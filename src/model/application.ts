/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Model
 * @description Application
 */

import { Document, model, Model, Schema } from "mongoose";
import { IApplication } from "../interface/application";

const ApplicationSchema: Schema = new Schema({

    active: {
        type: Boolean,
        required: true,
        default: true,
    },
    avatar: {
        type: String,
        default: null,
    },
    expire: {
        type: Number,
        required: true,
    },
    groups: {
        type: [Schema.Types.ObjectId],
        required: true,
        default: [],
    },
    key: {
        type: String,
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        index: true,
    },
    token: {
        type: String,
        required: true,
    },
}, {
        timestamps: {
            createdAt: true,
            updatedAt: true,
        },
    });


export interface IApplicationModel extends IApplication, Document {
}

export const ApplicationModel: Model<IApplicationModel> = model<IApplicationModel>('Application', ApplicationSchema);
