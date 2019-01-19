/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Model
 * @description Group
 */

import { Document, model, Model, Schema } from "mongoose";
import { IGroup } from "../interface/group";

const GroupSchema: Schema = new Schema({

    active: {
        type: Boolean,
        required: true,
        default: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
        index: true,
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


export interface IGroupModel extends IGroup, Document {
    pushHistory: (history: string) => IGroupModel;
}

GroupSchema.methods.pushHistory = function (this: IGroupModel, history: string): IGroupModel {

    this.history = [...this.history, history];

    return this;
};

export const GroupModel: Model<IGroupModel> = model<IGroupModel>('Group', GroupSchema);
