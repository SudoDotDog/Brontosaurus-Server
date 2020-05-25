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

    const attempt: IAttemptModel = createUnsavedAttempt({
        account: config.account._id,
        succeed: true,
        platform: config.platform,
        userAgent: config.userAgent,
        target: config.target,
        source: config.request.ip,
        proxySources: config.request.ips,
        application: config.application._id,
    });

    await attempt.save();

    return attempt;
};
