/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Error
 */

import { Connor } from 'connor';

export enum ERROR_CODE {

    PASSWORD_DOES_NOT_MATCH = 4001,
    TWO_FA_DOES_NOT_MATCH = 4002,
    OUT_OF_ATTEMPT = 4003,
    TOKEN_INVALID = 4106,
    TOKEN_EXPIRED = 4107,

    APPLICATION_KEY_NOT_FOUND = 4120,

    ACCOUNT_MINT_NOT_VALID = 4130,

    TOKEN_DOES_NOT_CONTAIN_INFORMATION = 4150,
    TOKEN_DOES_NOT_CONTAIN_HEADER = 4151,
    TOKEN_DOES_NOT_CONTAIN_BODY = 4152,

    INSUFFICIENT_INFORMATION = 4500,
    INSUFFICIENT_SPECIFIC_INFORMATION = 4501,

    REQUEST_DOES_MATCH_PATTERN = 5005,
    REQUEST_FORMAT_ERROR = 5006,

    APPLICATION_NOT_FOUND = 6200,
    GROUP_NOT_FOUND = 6201,
    ACCOUNT_NOT_FOUND = 6202,
    ORGANIZATION_NOT_FOUND = 6203,

    DUPLICATE_ACCOUNT = 6250,
    DUPLICATE_APPLICATION = 6251,
    DUPLICATE_GROUP = 6252,

    CANNOT_MODIFY_INTERNAL_GROUP = 6701,

    NOT_ENOUGH_PERMISSION = 7001,
    PERMISSION_USER_DOES_NOT_MATCH = 7002,

    INTERNAL_ERROR = 8000,
}

export const MODULE_NAME = 'Brontosaurus-Server';
export const ERROR_LIST: Record<ERROR_CODE, string> = {

    [ERROR_CODE.PASSWORD_DOES_NOT_MATCH]: 'Username and password not match',
    [ERROR_CODE.TWO_FA_DOES_NOT_MATCH]: 'TwoFA not match',
    [ERROR_CODE.OUT_OF_ATTEMPT]: 'Non attempt left',
    [ERROR_CODE.TOKEN_INVALID]: 'Token invalid',
    [ERROR_CODE.TOKEN_EXPIRED]: 'Token expired',

    [ERROR_CODE.APPLICATION_KEY_NOT_FOUND]: 'Application key not found',

    [ERROR_CODE.ACCOUNT_MINT_NOT_VALID]: 'Account mint not valid',

    [ERROR_CODE.TOKEN_DOES_NOT_CONTAIN_INFORMATION]: 'Token does not contain information: "{}"',
    [ERROR_CODE.TOKEN_DOES_NOT_CONTAIN_HEADER]: 'Token does not contain header',
    [ERROR_CODE.TOKEN_DOES_NOT_CONTAIN_BODY]: 'Token does not contain body',

    [ERROR_CODE.INSUFFICIENT_INFORMATION]: 'Insufficient information',
    [ERROR_CODE.INSUFFICIENT_SPECIFIC_INFORMATION]: 'Insufficient information, need: "{}"',

    [ERROR_CODE.REQUEST_DOES_MATCH_PATTERN]: 'Request does not match pattern',
    [ERROR_CODE.REQUEST_FORMAT_ERROR]: 'Request format error: "{}", should be: "{}", but: "{}"',

    [ERROR_CODE.APPLICATION_NOT_FOUND]: 'Application: "{}" not found',
    [ERROR_CODE.GROUP_NOT_FOUND]: 'Group: "{}" not found',
    [ERROR_CODE.ACCOUNT_NOT_FOUND]: 'Account: "{}" not found',
    [ERROR_CODE.ORGANIZATION_NOT_FOUND]: 'Organization: "{}" not found',

    [ERROR_CODE.DUPLICATE_ACCOUNT]: 'Account: "{}" already exist',
    [ERROR_CODE.DUPLICATE_APPLICATION]: 'Application: "{}" already exist',
    [ERROR_CODE.DUPLICATE_GROUP]: 'Group: "{}" already exist',

    [ERROR_CODE.CANNOT_MODIFY_INTERNAL_GROUP]: 'Internal group cannot be modify',

    [ERROR_CODE.NOT_ENOUGH_PERMISSION]: 'Permission insufficient, need "{}"',
    [ERROR_CODE.PERMISSION_USER_DOES_NOT_MATCH]: 'Permission user does not match between: "{}" and "{}"',

    [ERROR_CODE.INTERNAL_ERROR]: 'Internal Error',
};

export const registerConnor = () => Connor.dictionary(MODULE_NAME, ERROR_LIST);
export const getErrorCreationFunction = () => Connor.getErrorCreator(MODULE_NAME);
