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
        unique: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        index: true,
    },
    secret: {
        type: String,
        required: true,
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


export interface IApplicationModel extends IApplication, Document {
    pushHistory: (history: string) => IApplicationModel;
}

ApplicationSchema.methods.pushHistory = function (this: IApplicationModel, history: string): IApplicationModel {

    this.history = [...this.history, history];

    return this;
};

export const ApplicationModel: Model<IApplicationModel> = model<IApplicationModel>('Application', ApplicationSchema);
