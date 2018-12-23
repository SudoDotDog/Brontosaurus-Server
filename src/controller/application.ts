/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Mutation
 * @description Application
 */

import { ApplicationModel, IApplicationModel } from "../model/application";

export const createUnsavedApplication = (name: string, key: string, expire: number, secret: string): IApplicationModel => {

    return new ApplicationModel({

        key,
        name,

        expire,
        secret,

        groups: [],
    });
};

export const getApplicationByKey = async (key: string): Promise<IApplicationModel | null> =>
    await ApplicationModel.findOne({
        key,
    });
