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
    readonly body: BaseAttemptBody;
};

export const saveAttemptByObjects = async (config: CreateAttemptConfig): Promise<IAttemptModel> => {

    const body: BaseAttemptBody = config.body;
    const attempt: IAttemptModel = createUnsavedAttempt({
        account: config.account._id,
        succeed: true,
        platform: body.platform,
        userAgent: body.userAgent,
        target: body.target,
        source: config.request.ip,
        proxySources: config.request.ips,
        application: config.application._id,
    });

    await attempt.save();

    return attempt;
};
