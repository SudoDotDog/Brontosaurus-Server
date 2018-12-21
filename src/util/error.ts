/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Error
 */

import Connor, { } from 'connor';

export enum ERROR_CODE {

    PASSWORD_DOES_NOT_MATCH = 4001,
    TOKEN_INVALID = 4106,

    APPLICATION_NOT_FOUND = 6200,
}

export const MODULE_NAME = 'Brontosaurus-Server';
export const ERROR_LIST = {

    [ERROR_CODE.PASSWORD_DOES_NOT_MATCH]: 'Username and password not match',
    [ERROR_CODE.TOKEN_INVALID]: 'Token invalid',

    [ERROR_CODE.APPLICATION_NOT_FOUND]: 'Application: {} not found',
};

export const registerConnor = () => Connor.dictionary(MODULE_NAME, ERROR_LIST);
export const getErrorCreationFunction = () => Connor.getErrorCreator(MODULE_NAME);
