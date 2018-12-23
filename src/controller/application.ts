/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Controller
 * @description Application
 */

import { ApplicationModel, IApplicationModel } from "../model/application";

export const createUnsavedApplication = (name: string, key: string, expire: number, secret: string): IApplicationModel =>
    new ApplicationModel({

        key,
        name,

        expire,
        secret,

        groups: [],
    });

export const getApplicationByKey = async (key: string): Promise<IApplicationModel | null> =>
    await ApplicationModel.findOne({
        key,
    });
