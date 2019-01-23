/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Controller
 * @description Account
 */

import { Basics } from "@brontosaurus/definition";
import { ObjectID } from "bson";
import { AccountModel, IAccountModel } from "../model/account";
import { parseInfo } from "../util/token";

export const createUnsavedAccount = (
    username: string,
    password: string,
    groups: ObjectID[] = [],
    infos: Record<string, Basics> = {},
    beacons: Record<string, Basics> = {},
): IAccountModel => {

    const infoList: string[] = parseInfo(infos);
    const beaconList: string[] = parseInfo(beacons);

    return new AccountModel({

        username,
        password,
        infos: infoList,
        beacons: beaconList,
        groups,
    });
};

export const getAccountByUsername = async (username: string): Promise<IAccountModel | null> =>
    await AccountModel.findOne({
        username,
    });

export const getAllAccounts = async (): Promise<IAccountModel[]> => AccountModel.find({});

export const getTotalAccountPages = async (limit: number): Promise<number> => (await AccountModel.estimatedDocumentCount({})) / limit;

export const getAccountsByPage = async (limit: number, page: number): Promise<IAccountModel[]> => {

    if (page < 0) {
        return [];
    }

    const accounts: IAccountModel[] = await AccountModel.find({}).skip(page * limit).limit(limit).sort({ _id: -1 });
    return accounts;
};

export const isAccountDuplicatedByUsername = async (username: string): Promise<boolean> => {
    const account: IAccountModel | null = await getAccountByUsername(username);
    return Boolean(account);
};
