/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Error
 */

import Connor, { } from 'connor';

export enum ERROR_CODE {

    PASSWORD_DOES_NOT_MATCH = 4001,
    TOKEN_INVALID = 4106,
    TOKEN_EXPIRED = 4107,

    APPLICATION_KEY_NOT_FOUND = 4120,

    TOKEN_DOES_NOT_CONTAIN_INFORMATION = 4150,

    INSUFFICIENT_INFORMATION = 4500,
    INSUFFICIENT_SPECIFIC_INFORMATION = 4501,

    APPLICATION_NOT_FOUND = 6200,
    GROUP_NOT_FOUND = 6201,
    ACCOUNT_NOT_FOUND = 6202,

    DUPLICATE_ACCOUNT = 6250,
    DUPLICATE_APPLICATION = 6251,
    DUPLICATE_GROUP = 6252,

    NOT_ENOUGH_PERMISSION = 7001,
}

export const MODULE_NAME = 'Brontosaurus-Server';
export const ERROR_LIST = {

    [ERROR_CODE.PASSWORD_DOES_NOT_MATCH]: 'Username and password not match',
    [ERROR_CODE.TOKEN_INVALID]: 'Token invalid',
    [ERROR_CODE.TOKEN_EXPIRED]: 'Token expired',

    [ERROR_CODE.APPLICATION_KEY_NOT_FOUND]: 'Application key not found',

    [ERROR_CODE.TOKEN_DOES_NOT_CONTAIN_INFORMATION]: 'Token does not contain information: "{}"',

    [ERROR_CODE.INSUFFICIENT_INFORMATION]: 'Insufficient information',
    [ERROR_CODE.INSUFFICIENT_SPECIFIC_INFORMATION]: 'Insufficient information, need: "{}"',

    [ERROR_CODE.APPLICATION_NOT_FOUND]: 'Application: "{}" not found',
    [ERROR_CODE.GROUP_NOT_FOUND]: 'Group: "{}" not found',
    [ERROR_CODE.ACCOUNT_NOT_FOUND]: 'Account: "{}" not found',

    [ERROR_CODE.DUPLICATE_ACCOUNT]: 'Account: "{}" already exist',
    [ERROR_CODE.DUPLICATE_APPLICATION]: 'Application: "{}" already exist',
    [ERROR_CODE.DUPLICATE_GROUP]: 'Group: "{}" already exist',

    [ERROR_CODE.NOT_ENOUGH_PERMISSION]: 'Permission insufficient, need "{}"',
};

export const registerConnor = () => Connor.dictionary(MODULE_NAME, ERROR_LIST);
export const getErrorCreationFunction = () => Connor.getErrorCreator(MODULE_NAME);
