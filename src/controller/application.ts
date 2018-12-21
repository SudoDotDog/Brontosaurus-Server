/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Mutation
 * @description Application
 */

import { Safe, SafeValue } from "@sudoo/extract";
import Connor from "connor";
import { ApplicationModel, IApplicationModel } from "../model/application";
import { ERROR_CODE, MODULE_NAME } from "../util/error";

export const createUnsavedApplication = (name: string, key: string, token: string): IApplicationModel => {

    return new ApplicationModel({

        key,
        name,
        token,
    });
};

export const getApplicationByKey = async (key: string): Promise<IApplicationModel> => {

    const safeApplication: SafeValue<IApplicationModel> = Safe.value(
        await ApplicationModel.findOne({
            key,
        }),
        Connor.getErrorCreator(MODULE_NAME)(ERROR_CODE.APPLICATION_NOT_FOUND, key),
    );

    return safeApplication.safe();
};
