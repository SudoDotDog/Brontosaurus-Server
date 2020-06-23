/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Reset
 */

import { IAccountModel, IApplicationModel, ResetController } from "@brontosaurus/db";
import { IResetModel } from "@brontosaurus/db/model/reset";
import { SudooExpressRequest } from "@sudoo/express";
import { BaseAttemptBody } from "../routes/basic";

export type CreateResetConfig = {

    readonly account: IAccountModel;
    readonly application: IApplicationModel;
    readonly request: SudooExpressRequest;
    readonly succeed: boolean;
    readonly emailUsed: string;
} & BaseAttemptBody;

export const saveResetByObjects = async (config: CreateResetConfig): Promise<IResetModel> => {

    const userAgent: string | undefined =
        config.request.headers['user-agent']
        ?? config.request.headers['User-Agent']
        ?? config.request.headers['USER-AGENT'];

    const userAgentOverride: string | undefined = config.request.body.userAgentOverride;

    const parsedUserAgent: string = typeof userAgent === 'string'
        ? userAgent
        : '[EMPTY-USER-AGENT-HEADER]';

    const combinedUserAgent: string = typeof userAgentOverride === 'string'
        ? `${userAgentOverride} [${parsedUserAgent}]`
        : parsedUserAgent;

    const ips: string[] = [...config.request.ips];
    const realIp: string | undefined =
        config.request.headers['x-real-ip']
        ?? config.request.headers['X-Real-IP']
        ?? config.request.headers['X-REAL-IP'];
    if (typeof realIp === 'string') {

        if (!ips.includes(realIp)) {
            ips.unshift(realIp);
        }
    }

    const reset: IResetModel = ResetController.createUnsavedReset({
        account: config.account._id,
        succeed: config.succeed,
        emailUsed: config.emailUsed,
        emailExpected: config.account.email ?? '[EMPTY]',
        platform: config.platform,
        userAgent: combinedUserAgent,
        target: config.target,
        source: config.request.ip,
        proxySources: ips,
        application: config.application._id,
    });

    await reset.save();

    return reset;
};
