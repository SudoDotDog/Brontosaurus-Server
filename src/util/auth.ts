/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Auth
 */

import { Brontosaurus, BrontosaurusToken } from "@brontosaurus/core";
import { IBrontosaurusBody, IBrontosaurusHeader } from "@brontosaurus/definition";
import { Safe } from "@sudoo/extract";
import { ObjectID } from "bson";
import Connor, { ErrorCreationFunction } from "connor";
import { isArray, isString } from "util";
import { getGroupById } from "../controller/group";
import { IGroupModel } from "../model/group";
import { ERROR_CODE, MODULE_NAME } from "./error";
import { SafeToken } from "./token";

export const Throwable_ValidateToken = (secret: string, expire: number, tokenString: string): true => {

    const token: BrontosaurusToken = Brontosaurus.token(secret);
    const createError: ErrorCreationFunction = Connor.getErrorCreator(MODULE_NAME);

    if (!token.clock(tokenString, expire)) {
        throw createError(ERROR_CODE.TOKEN_EXPIRED);
    }

    if (!token.check(tokenString)) {
        throw createError(ERROR_CODE.TOKEN_INVALID);
    }

    return true;
};

export const getPrincipleFromToken =  (tokenString: string): SafeToken => {

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


export const Throwable_GetBody = (token: string): IBrontosaurusBody => {

    const body: IBrontosaurusBody | null = Brontosaurus.decoupleBody(token);

    const createError: ErrorCreationFunction = Connor.getErrorCreator(MODULE_NAME);

    if (!body) {
        throw createError(ERROR_CODE.TOKEN_INVALID);
    }

    return body;
};

export const Throwable_MapGroups = async (groups: ObjectID[]): Promise<string[]> => {

    const createError: ErrorCreationFunction = Connor.getErrorCreator(MODULE_NAME);

    const result: string[] = [];

    for (const group of groups) {

        const current: IGroupModel | null = await getGroupById(group);

        if (!current) {
            throw createError(ERROR_CODE.GROUP_NOT_FOUND);
        }

        result.push(current.name);
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

