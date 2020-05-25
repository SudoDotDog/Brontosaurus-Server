/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Attempt
 */

import { IAccountModel, IApplicationModel, IAttemptModel } from "@brontosaurus/db";
import { createUnsavedAttempt } from "@brontosaurus/db/controller/attempt";
import { SudooExpressRequest } from "@sudoo/express";
import { BaseAttemptBody } from "../routes/basic";

export type CreateAttemptConfig = {

    readonly account: IAccountModel;
    readonly application: IApplicationModel;
    readonly request: SudooExpressRequest;
} & BaseAttemptBody;

export const saveAttemptByObjects = async (config: CreateAttemptConfig): Promise<IAttemptModel> => {

    const userAgent: string | undefined = config.request.headers['user-agent'];
    const userAgentOverride: string | undefined = config.request.body.userAgentOverride;

    const parsedUserAgent: string = typeof userAgent === 'string'
        ? userAgent
        : '[EMPTY-USER-AGENT-HEADER]';

    const combinedUserAgent: string = typeof userAgentOverride === 'string'
        ? `${userAgentOverride}(${parsedUserAgent})`
        : parsedUserAgent;

    const attempt: IAttemptModel = createUnsavedAttempt({
        account: config.account._id,
        succeed: true,
        platform: config.platform,
        userAgent: combinedUserAgent,
        target: config.target,
        source: config.request.ip,
        proxySources: config.request.ips,
        application: config.application._id,
    });

    await attempt.save();

    return attempt;
};
