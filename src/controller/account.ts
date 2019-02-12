/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Controller
 * @description Account
 */

import { Basics } from "@brontosaurus/definition";
import { ObjectID } from "bson";
import { AccountModel, IAccountModel } from "../model/account";
import { createSalt, garblePassword } from "../util/auth";
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

    const salt: string = createSalt();

    return new AccountModel({

        username,
        password: garblePassword(password, salt),
        infos: infoList,
        beacons: beaconList,
        salt,
        groups,
    });
};

export const getAccountByUsername = async (username: string): Promise<IAccountModel | null> =>
    await AccountModel.findOne({
        username,
    });

export const getAllAccounts = async (): Promise<IAccountModel[]> => AccountModel.find({});

export const getTotalAccountPages = async (limit: number): Promise<number> =>
    (await AccountModel.estimatedDocumentCount({})) / limit;

export const getTotalActiveAccountPages = async (limit: number): Promise<number> =>
    (await AccountModel.estimatedDocumentCount({
        active: true,
    })) / limit;

export const getSelectedActiveAccountsByPage = async (limit: number, page: number, keyword?: string): Promise<IAccountModel[]> => {

    if (keyword) {
        return await getActiveAccountsByPage(keyword, limit, page);
    }
    return await getAllActiveAccountsByPage(limit, page);
};

export const getActiveAccountsByPage = async (keyword: string, limit: number, page: number): Promise<IAccountModel[]> => {

    if (page < 0) {
        return [];
    }

    const regexp: RegExp = new RegExp(keyword, 'i');
    const accounts: IAccountModel[] = await AccountModel.find({
        username: {
            $regex: regexp,
        },
        active: true,
    }).skip(page * limit).limit(limit).sort({ _id: -1 });
    return accounts;
};

export const getAllActiveAccountsByPage = async (limit: number, page: number): Promise<IAccountModel[]> => {

    if (page < 0) {
        return [];
    }

    const accounts: IAccountModel[] = await AccountModel.find({
        active: true,
    }).skip(page * limit).limit(limit).sort({ _id: -1 });
    return accounts;
};

export const isAccountDuplicatedByUsername = async (username: string): Promise<boolean> => {
    const account: IAccountModel | null = await getAccountByUsername(username);
    return Boolean(account);
};
