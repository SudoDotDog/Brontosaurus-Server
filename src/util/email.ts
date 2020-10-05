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

    const leftUser: string = leftDomainSplited[0];
    const rightUser: string = rightDomainSplited[0];

    const leftDomain: string = leftDomainSplited[1];
    const rightDomain: string = rightDomainSplited[1];

    const leftPLusSplited: string[] = leftUser.split('+');
    const rightPLusSplited: string[] = rightUser.split('+');

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
        : leftPLusSplited[0] + '@' + leftDomain;
    const rightRejoin: string = rightPLusSplited.length === 1
        ? right
        : rightPLusSplited[0] + '@' + rightDomain;

    return leftRejoin.toLowerCase() === rightRejoin.toLowerCase();
};
