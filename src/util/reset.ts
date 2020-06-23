/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Reset
 */

import { IAccountModel, IApplicationModel, ResetController } from "@brontosaurus/db";
import { IResetModel } from "@brontosaurus/db/model/reset";
import { SudooExpressRequest } from "@sudoo/express";
import { BaseAttemptBody } from "../routes/basic";
import { buildIps, buildUserAgent } from "./request";

export type CreateResetConfig = {

    readonly account: IAccountModel;
    readonly application: IApplicationModel;
    readonly request: SudooExpressRequest;
    readonly succeed: boolean;
    readonly emailUsed: string;
} & BaseAttemptBody;

export const saveResetByObjects = async (config: CreateResetConfig): Promise<IResetModel> => {

    const combinedUserAgent: string = buildUserAgent(config.request);
    const ips: string[] = buildIps(config.request);

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
