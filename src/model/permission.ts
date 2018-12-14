/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Model
 * @description Permission
*/

import { Document, model, Model, Schema } from "mongoose";
import { IPermission } from "../interface/permission";

const PermissionSchema: Schema = new Schema({

    active: {
        type: Boolean,
        default: true,
    },
    application: {
        type: Schema.Types.ObjectId,
        required: true,
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
}, {
        timestamps: {
            createdAt: true,
            updatedAt: true,
        },
    });


export interface IPermissionModel extends IPermission, Document {
}

export const PermissionModel: Model<IPermissionModel> = model<IPermissionModel>('Permission', PermissionSchema);
