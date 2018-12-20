/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Mutation
 * @description Application
 */

import { Safe, SafeValue } from "@sudoo/extract";
import { ApplicationModel, IApplicationModel } from "../model/application";

export const getApplicationByKey = async (key: string): Promise<IApplicationModel> => {

    const safeApplication: SafeValue<IApplicationModel> = Safe.value(
        await ApplicationModel.findOne({
            key,
        }),
    );

    return safeApplication.safe();
};
