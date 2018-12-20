/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Error
 */

import Connor, {} from 'connor';

export enum ERROR_CODE {
  
    PASSWORD_DOES_NOT_MATCH = 4001,
} 

export const MODULE_NAME = 'Brontosaurus-Server';
export const ERROR_LIST = {

    [ERROR_CODE.PASSWORD_DOES_NOT_MATCH]: 'Username and password not match',
};

export const registerConnor = () => Connor.dictionary(MODULE_NAME, ERROR_LIST);
export const getErrorCreationFunction = () => Connor.getErrorCreator(MODULE_NAME);
