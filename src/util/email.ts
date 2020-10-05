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

    const leftDomainSplited: string[] = left.split('@');
    const rightDomainSplited: string[] = right.split('@');

    if (leftDomainSplited.length !== 2
        || rightDomainSplited.length !== 2) {
        return false;
    }

    const leftPLusSplited: string[] = left.split('+');
    const rightPLusSplited: string[] = right.split('+');

    if (leftPLusSplited.length === 1
        && rightPLusSplited.length === 1) {
        return left.toLowerCase() === right.toLowerCase();
    }

    if (typeof leftPLusSplited[0] !== 'string'
        || typeof rightPLusSplited[0] !== 'string') {
        return false;
    }

    const leftRejoin: string = leftPLusSplited.length === 1
        ? left
        : leftPLusSplited[0] + '@' + leftDomainSplited[1];
    const rightRejoin: string = rightPLusSplited.length === 1
        ? right
        : rightPLusSplited[0] + '@' + rightDomainSplited[1];

    console.log(leftRejoin, rightRejoin);

    return leftRejoin.toLowerCase() === rightRejoin.toLowerCase();
};
