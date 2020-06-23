/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Attempt
 */

import { AttemptController, IAccountModel, IApplicationModel, IAttemptModel } from "@brontosaurus/db";
import { SudooExpressRequest } from "@sudoo/express";
import { BaseAttemptBody } from "../routes/basic";
import { buildIps, buildUserAgent } from "./request";

export type CreateAttemptConfig = {

    readonly account: IAccountModel;
    readonly application: IApplicationModel;
    readonly request: SudooExpressRequest;
} & BaseAttemptBody;

export const saveAttemptByObjects = async (config: CreateAttemptConfig): Promise<IAttemptModel> => {

    const combinedUserAgent: string = buildUserAgent(config.request);
    const ips: string[] = buildIps(config.request);

    const attempt: IAttemptModel = AttemptController.createUnsavedAttempt({
        account: config.account._id,
        succeed: true,
        platform: config.platform,
        userAgent: combinedUserAgent,
        target: config.target,
        source: config.request.ip,
        proxySources: ips,
        application: config.application._id,
    });

    await attempt.save();

    return attempt;
};
