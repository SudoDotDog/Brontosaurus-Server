/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Error
 */

import { Connor, ErrorCreationFunction } from 'connor';

export enum NOT_MATCH_REASON {

    ACCOUNT_NOT_FOUND = "ACCOUNT_NOT_FOUND",
    NAMESPACE_NOT_FOUND = "NAMESPACE_NOT_FOUND",
    NAMESPACE_NOT_MATCHED = "NAMESPACE_NOT_MATCHED",
    PASSWORD_NOT_MATCHED = "PASSWORD_NOT_MATCHED",
}

export const buildNotMatchReason = (reason: NOT_MATCH_REASON, username: string, namespace: string): string => {

    return `Reason: ${reason}, username: "${username}", namespace: "${namespace}"`;
};

export enum ERROR_CODE {

    INACTIVE_ACCOUNT = 4000,
    PASSWORD_DOES_NOT_MATCH = 4001,
    TWO_FA_DOES_NOT_MATCH = 4002,
    OUT_OF_ATTEMPT = 4003,
    TOKEN_INVALID = 4106,
    TOKEN_EXPIRED = 4107,
    APPLICATION_HAS_NO_PORTAL_ACCESS = 4108,
    TOKEN_DOES_NOT_MATCH = 4109,

    INVALID_USERNAME = 4110,
    INVALID_PASSWORD = 4111,
    INVALID_COMMON_NAME = 4112,
    WIRED_PASSWORD = 4113,
    EMAIL_DOES_NOT_MATCH = 4114,
    ACCOUNT_NAMESPACE_NOT_MATCH = 4115,

    APPLICATION_KEY_NOT_FOUND = 4120,
    APPLICATION_GROUP_NOT_FULFILLED = 4121,
    UNTRUSTED_REDIRECTION = 4122,

    ACCOUNT_MINT_NOT_VALID = 4130,
    APPLICATION_INACTIVE = 4131,

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
    NAMESPACE_NOT_FOUND = 6204,

    NEED_CONFIG_MAILER = 7000,
    EMAIL_SEND_FAILED = 7001,

    INTERNAL_ERROR = 8000,
}

export const MODULE_NAME = 'Brontosaurus-Server';
export const ERROR_LIST: Record<ERROR_CODE, string> = {

    [ERROR_CODE.INACTIVE_ACCOUNT]: 'Account: "{}", namespace: "{}" is not active',
    [ERROR_CODE.PASSWORD_DOES_NOT_MATCH]: 'Username and password not match; Username: "{}", namespace: "{}"',
    [ERROR_CODE.TWO_FA_DOES_NOT_MATCH]: 'TwoFA not match; Username: "{}", namespace: "{}"',
    [ERROR_CODE.OUT_OF_ATTEMPT]: 'No attempt left; Username: "{}", namespace: "{}"',
    [ERROR_CODE.TOKEN_INVALID]: 'Token invalid',
    [ERROR_CODE.TOKEN_EXPIRED]: 'Token expired',
    [ERROR_CODE.APPLICATION_HAS_NO_PORTAL_ACCESS]: 'Application has no Portal Access',
    [ERROR_CODE.TOKEN_DOES_NOT_MATCH]: 'Username and token not match, username: "{}", namespace: "{}"',

    [ERROR_CODE.INVALID_USERNAME]: 'Invalid username, reason: "{}"',
    [ERROR_CODE.INVALID_PASSWORD]: 'Invalid password, reason: "{}"',
    [ERROR_CODE.INVALID_COMMON_NAME]: 'Invalid common name, reason: "{}"',
    [ERROR_CODE.WIRED_PASSWORD]: 'Wired password, reason: "{}"',
    [ERROR_CODE.EMAIL_DOES_NOT_MATCH]: 'Username and email not match',
    [ERROR_CODE.ACCOUNT_NAMESPACE_NOT_MATCH]: 'Account and namespace not match, account: "{}", namespace: "{}"',

    [ERROR_CODE.APPLICATION_KEY_NOT_FOUND]: 'Application key not found',
    [ERROR_CODE.APPLICATION_GROUP_NOT_FULFILLED]: 'Application group not fulfilled',
    [ERROR_CODE.UNTRUSTED_REDIRECTION]: 'Untrusted Redirection',

    [ERROR_CODE.ACCOUNT_MINT_NOT_VALID]: 'Account mint not valid',
    [ERROR_CODE.APPLICATION_INACTIVE]: 'Application is not active',

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
    [ERROR_CODE.NAMESPACE_NOT_FOUND]: 'Namespace: "{}" not found',

    [ERROR_CODE.NEED_CONFIG_MAILER]: 'Mailer need to be config',
    [ERROR_CODE.EMAIL_SEND_FAILED]: 'Email send failed: "{}"',

    [ERROR_CODE.INTERNAL_ERROR]: 'Internal Error',
};

export const registerConnor = (): Connor => Connor.dictionary(MODULE_NAME, ERROR_LIST);
export const getErrorCreationFunction = (): ErrorCreationFunction => Connor.getErrorCreator(MODULE_NAME);
