/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Controller
 * @description Group
 */

import { ObjectID } from "bson";
import { GroupModel, IGroupModel } from "../model/group";

export const getGroupById = async (id: ObjectID): Promise<IGroupModel | null> =>
    await GroupModel.findOne({
        _id: id,
    });

export const getGroupByName = async (name: string): Promise<IGroupModel | null> =>
    await GroupModel.findOne({
        name,
    });


export const createUnsavedGroup = (name: string): IGroupModel =>
    new GroupModel({

        name,
    });

export const isGroupDuplicatedByName = async (name: string): Promise<boolean> => {
    const group: IGroupModel | null = await getGroupByName(name);
    return Boolean(group);
};

export const isGroupDuplicatedById = async (id: ObjectID): Promise<boolean> => {
    const group: IGroupModel | null = await getGroupById(id);
    return Boolean(group);
};
