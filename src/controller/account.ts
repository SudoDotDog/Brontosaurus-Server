/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Mutation
 * @description Account
 */

import { ObjectID } from "bson";
import { AccountModel, IAccountModel } from "../model/account";

export const createUnsavedAccount = (username: string, password: string, infos: string[], groups: ObjectID[] = []): IAccountModel => {

    return new AccountModel({

        username,
        password,
        infos,
        groups,
    });
};

export const getAccountByUsername = async (username: string): Promise<IAccountModel> => {

    return await AccountModel.findOne({

        username,
    });
};
