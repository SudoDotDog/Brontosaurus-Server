/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Mutation
 * @description Account
*/

import { ObjectID } from "bson";
import { AccountInfo } from "../interface/account";
import { AccountModel, IAccountModel } from "../model/account";

export const createAccount = (username: string, password: string, infos: AccountInfo[], permissions: ObjectID[] = []): IAccountModel => {

    return new AccountModel({

        username,
        password,
        infos,
        permissions,
    });
};
