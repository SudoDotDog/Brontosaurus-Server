/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Request
 */

import { SudooExpressRequest } from "@sudoo/express";

export const buildUserAgent = (request: SudooExpressRequest): string => {

    const userAgent: string | undefined =
        request.headers['user-agent']
        ?? request.headers['User-Agent']
        ?? request.headers['USER-AGENT'];

    const userAgentOverride: string | undefined = request.body.userAgentOverride;

    const parsedUserAgent: string = typeof userAgent === 'string'
        ? userAgent
        : '[EMPTY-USER-AGENT-HEADER]';

    const combinedUserAgent: string = typeof userAgentOverride === 'string'
        ? `${userAgentOverride} [${parsedUserAgent}]`
        : parsedUserAgent;

    return combinedUserAgent
};

export const buildIps = (request: SudooExpressRequest): string[] => {

    const ips: string[] = [...request.ips];
    const realIp: string | undefined =
        request.headers['x-real-ip']
        ?? request.headers['X-Real-IP']
        ?? request.headers['X-REAL-IP'];
    if (typeof realIp === 'string') {

        if (!ips.includes(realIp)) {
            ips.unshift(realIp);
        }
    }

    return ips;
};
