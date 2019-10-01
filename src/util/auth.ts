/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Auth
 */

import { Brontosaurus, BrontosaurusKey, BrontosaurusToken } from "@brontosaurus/core";
import { GroupController, IGroupModel } from "@brontosaurus/db";
import { IBrontosaurusBody, IBrontosaurusHeader } from "@brontosaurus/definition";
import { Safe } from "@sudoo/extract";
import { ObjectID } from "bson";
import { Connor, ErrorCreationFunction } from "connor";
import { createHash, Hash } from 'crypto';
import { isArray } from "util";
import { ERROR_CODE, MODULE_NAME } from "./error";
import { SafeToken } from "./token";

// tslint:disable-next-line: variable-name
export const Throwable_ValidateToken = (secret: BrontosaurusKey, expire: number, tokenString: string): IBrontosaurusBody => {

    const token: BrontosaurusToken = Brontosaurus.token(secret);
    const createError: ErrorCreationFunction = Connor.getErrorCreator(MODULE_NAME);

    if (!token.clock(tokenString, expire)) {
        throw createError(ERROR_CODE.TOKEN_EXPIRED);
    }

    if (!token.check(tokenString)) {
        throw createError(ERROR_CODE.TOKEN_INVALID);
    }

    const body: IBrontosaurusBody | null = token.body(tokenString);

    if (!body) {
        throw createError(ERROR_CODE.TOKEN_INVALID);
    }

    return body;
};

export const getPrincipleFromToken = (tokenString: string): SafeToken => {

    const createError: ErrorCreationFunction = Connor.getErrorCreator(MODULE_NAME);

    const header: IBrontosaurusHeader | null = Brontosaurus.decoupleHeader(tokenString);

    if (!header) {
        throw createError(ERROR_CODE.TOKEN_DOES_NOT_CONTAIN_HEADER);
    }

    const body: IBrontosaurusBody | null = Brontosaurus.decoupleBody(tokenString);

    if (!body) {
        throw createError(ERROR_CODE.TOKEN_DOES_NOT_CONTAIN_BODY);
    }

    return {
        header: Safe.object(header),
        body: Safe.object(body),
    };
};

export const parseBearerAuthorization = (auth: string | undefined): string | null => {

    if (!auth || auth.length <= 7) {
        return null;
    }

    const splited: string[] = auth.split(' ');
    if (splited.length !== 2) {
        return null;
    }

    const type: string = splited[0];

    if (type.toLowerCase() !== 'bearer') {
        return null;
    }

    const value: string = splited[1];
    return value;
};

// tslint:disable-next-line: variable-name
export const Throwable_GetBody = (token: string): IBrontosaurusBody => {

    const body: IBrontosaurusBody | null = Brontosaurus.decoupleBody(token);

    const createError: ErrorCreationFunction = Connor.getErrorCreator(MODULE_NAME);

    if (!body) {
        throw createError(ERROR_CODE.TOKEN_INVALID);
    }

    return body;
};

// tslint:disable-next-line: variable-name
export const Throwable_MapGroups = async (groups: ObjectID[]): Promise<string[]> => {

    const createError: ErrorCreationFunction = Connor.getErrorCreator(MODULE_NAME);

    const result: string[] = [];

    for (const group of groups) {

        const current: IGroupModel | null = await GroupController.getGroupById(group);

        if (!current) {
            throw createError(ERROR_CODE.GROUP_NOT_FOUND);
        }

        result.push(current.name);
    }

    return result;
};

// tslint:disable-next-line: variable-name
export const Throwable_GetGroupsByNames = async (groups: string[]): Promise<IGroupModel[]> => {

    const createError: ErrorCreationFunction = Connor.getErrorCreator(MODULE_NAME);

    const result: IGroupModel[] = [];

    for (const group of groups) {

        const current: IGroupModel | null = await GroupController.getGroupByName(group);

        if (!current) {
            throw createError(ERROR_CODE.GROUP_NOT_FOUND);
        }

        result.push(current);
    }

    return result;
};

export const compareGroups = (userGroups: string[], targetGroups: any): boolean => {

    if (!isArray(targetGroups)) {

        return false;
    }

    for (const need of targetGroups) {

        if (!userGroups.includes(need)) {
            return false;
        }
    }

    return true;
};

export const createSalt = (): string => Math.random().toString(36).substring(2, 9);
export const createMint = (): string => Math.random().toString(36).substring(2, 9);

export const garblePassword = (password: string, salt: string): string => {

    const salted: string = password + ':' + salt;
    const md5: Hash = createHash('md5').update(salted);

    return md5.digest('hex');
};
