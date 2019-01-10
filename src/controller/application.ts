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
