/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Email
 */

export const compareEmail = (left?: string, right?: string): boolean => {

    if (typeof left !== 'string' || typeof right !== 'string') {
        return false;
    }

    return left.toLowerCase() === right.toLowerCase();
};
