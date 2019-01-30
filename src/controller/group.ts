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

export const getGroupsByIds = async (ids: ObjectID[]): Promise<IGroupModel[]> =>
    await GroupModel.find({
        _id: {
            $in: ids,
        },
    });

export const getGroupByName = async (names: string): Promise<IGroupModel | null> =>
    await GroupModel.findOne({
        name,
    });

export const getGroupByNames = async (names: string[]): Promise<IGroupModel[]> =>
    await GroupModel.find({
        name: {
            $in: names,
        },
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

export const getTotalActiveGroupPages = async (limit: number): Promise<number> =>
    (await GroupModel.estimatedDocumentCount({
        active: true,
    })) / limit;

export const getSelectedActiveGroupsByPage = async (limit: number, page: number, keyword?: string): Promise<IGroupModel[]> => {

    if (keyword) {
        return await getActiveGroupsByPage(keyword, limit, page);
    }
    return await getAllActiveGroupsByPage(limit, page);
};

export const getActiveGroupsByPage = async (keyword: string, limit: number, page: number): Promise<IGroupModel[]> => {

    if (page < 0) {
        return [];
    }

    const regexp: RegExp = new RegExp(keyword, 'i');
    const groups: IGroupModel[] = await GroupModel.find({
        name: {
            $regex: regexp,
        },
        active: true,
    }).skip(page * limit).limit(limit).sort({ _id: -1 });
    return groups;
};

export const getAllActiveGroupsByPage = async (limit: number, page: number): Promise<IGroupModel[]> => {

    if (page < 0) {
        return [];
    }

    const groups: IGroupModel[] = await GroupModel.find({
        active: true,
    }).skip(page * limit).limit(limit).sort({ _id: -1 });
    return groups;
};
