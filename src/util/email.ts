/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Email
 */

export const compareEmail = (left?: string, right?: string): boolean => {

    if (typeof left !== 'string'
        || typeof right !== 'string') {
        return false;
    }

    const leftSplited: string[] = left.split('+');
    const rightSplited: string[] = right.split('+');

    if (leftSplited.length === 1
        && rightSplited.length === 1) {
        return left.toLowerCase() === right.toLowerCase();
    }

    if (typeof leftSplited[0] !== 'string'
        || typeof rightSplited[0] !== 'string') {
        return false;
    }

    return leftSplited[0].toLowerCase() === rightSplited[0].toLowerCase();
};
