/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Controller
 * @description Application
 */

import { IApplicationConfig } from "../interface/application";
import { ApplicationModel, IApplicationModel } from "../model/application";

export const createUnsavedApplication = (name: string, key: string, expire: number, secret: string, avatar?: string): IApplicationModel => {

    const config: IApplicationConfig = {
        avatar,
        key,
        name,
        expire,
        secret,
        groups: [],
    };

    return new ApplicationModel(config);
};

export const getApplicationByKey = async (key: string): Promise<IApplicationModel | null> =>
    await ApplicationModel.findOne({
        key,
    });

export const isApplicationDuplicatedByKey = async (key: string): Promise<boolean> => {
    const application: IApplicationModel | null = await getApplicationByKey(key);
    return Boolean(application);
};

export const getTotalActiveApplicationPages = async (limit: number): Promise<number> =>
    (await ApplicationModel.estimatedDocumentCount({
        active: true,
    })) / limit;

export const getSelectedActiveApplicationsByPage = async (limit: number, page: number, keyword?: string): Promise<IApplicationModel[]> => {

    if (keyword) {
        return await getActiveApplicationsByPage(keyword, limit, page);
    }
    return await getAllActiveApplicationsByPage(limit, page);
};

export const getActiveApplicationsByPage = async (keyword: string, limit: number, page: number): Promise<IApplicationModel[]> => {

    if (page < 0) {
        return [];
    }

    const regexp: RegExp = new RegExp(keyword, 'i');
    const applications: IApplicationModel[] = await ApplicationModel.find({
        name: {
            $regex: regexp,
        },
        active: true,
    }).skip(page * limit).limit(limit).sort({ _id: -1 });
    return applications;
};

export const getAllActiveApplicationsByPage = async (limit: number, page: number): Promise<IApplicationModel[]> => {

    if (page < 0) {
        return [];
    }

    const applications: IApplicationModel[] = await ApplicationModel.find({
        active: true,
    }).skip(page * limit).limit(limit).sort({ _id: -1 });
    return applications;
};
