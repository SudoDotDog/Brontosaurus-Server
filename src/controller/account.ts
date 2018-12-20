/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Mutation
 * @description Account
 */

import { Safe, SafeValue } from "@sudoo/extract";
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

    const safeAccount: SafeValue<IAccountModel> = Safe.value(
        await AccountModel.findOne({
            username,
        }),
    );

    return safeAccount.safe();
};
