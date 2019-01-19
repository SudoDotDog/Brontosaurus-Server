/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Controller
 * @description Account
 */

import { Basics } from "@brontosaurus/definition";
import { ObjectID } from "bson";
import { AccountModel, IAccountModel } from "../model/account";
import { parseInfo } from "../util/token";

export const createUnsavedAccount = (username: string, password: string, groups: ObjectID[] = [], infos: Record<string, Basics>): IAccountModel => {

    const infoList: string[] = parseInfo(infos);

    return new AccountModel({

        username,
        password,
        infos: infoList,
        groups,
    });
};

export const getAccountByUsername = async (username: string): Promise<IAccountModel | null> =>
    await AccountModel.findOne({
        username,
    });

export const getAllAccounts = async (): Promise<IAccountModel[]> => AccountModel.find({});

export const isAccountDuplicatedByUsername = async (username: string): Promise<boolean> => {
    const account: IAccountModel | null = await getAccountByUsername(username);
    return Boolean(account);
};
