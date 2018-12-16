/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Mutation
 * @description Account
 */

import { ObjectID } from "bson";
import { AccountModel, IAccountModel } from "../model/account";

export const createAccount = (username: string, password: string, infos: string[], permissions: ObjectID[] = []): IAccountModel => {

    return new AccountModel({

        username,
        password,
        infos,
        permissions,
    });
};
