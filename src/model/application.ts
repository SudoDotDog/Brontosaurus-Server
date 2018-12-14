/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Database_Model
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
    name: {
        type: String,
        required: true,
    },
    key: {
        type: String,
        required: true,
        index: true,
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


export interface IApplicationModel extends IApplication, Document {
}

export const ApplicationModel: Model<IApplicationModel> = model<IApplicationModel>('Application', ApplicationSchema);
