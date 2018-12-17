/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Mutation
 * @description Application
 */

import { ApplicationModel, IApplicationModel } from "../model/application";

export const getApplicationByKey = async (key: string): Promise<IApplicationModel> => {

    const application: IApplicationModel = await ApplicationModel.findOne({

        key,
    });

    return application;
};
