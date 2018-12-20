/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Mutation
 * @description Application
 */

import { ApplicationModel, IApplicationModel } from "../model/application";
import { SafeValue, Safe } from "@sudoo/extract";

export const getApplicationByKey = async (key: string): Promise<IApplicationModel> => {

    const safeApplication: SafeValue<IApplicationModel> = Safe.value(
        await ApplicationModel.findOne({
            key,
        })
    );

    return safeApplication.safe();
};
