/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Red_Application
 * @description Single
 */

import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from "@sudoo/extract";
import { isString } from "util";
import { getApplicationByKey } from "../../../controller/application";
import { createAuthenticateHandler, createGroupVerifyHandler, createTokenHandler } from "../../../handlers/handlers";
import { basicHook } from "../../../handlers/hook";
import { INTERNAL_USER_GROUP } from "../../../interface/group";
import { IApplicationModel } from "../../../model/application";
import { Throwable_MapGroups } from "../../../util/auth";
import { ERROR_CODE } from "../../../util/error";
import { BrontosaurusRoute } from "../../basic";

export type SingleApplicationBody = {

    key: string;
};

export class SingleApplicationRoute extends BrontosaurusRoute {

    public readonly path: string = '/application/single';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(createTokenHandler(), '/application/single - TokenHandler'),
        basicHook.wrap(createAuthenticateHandler(), '/application/single - AuthenticateHandler'),
        basicHook.wrap(createGroupVerifyHandler([INTERNAL_USER_GROUP.SUPER_ADMIN], this._error), '/application/single - GroupVerifyHandler'),
        basicHook.wrap(this._singleApplicationHandler.bind(this), '/application/single - Single', true),
    ];

    private async _singleApplicationHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<SingleApplicationBody> = Safe.extract(req.body as SingleApplicationBody, this._error(ERROR_CODE.INSUFFICIENT_INFORMATION));

        try {

            const key: string = body.direct('key');
            if (!isString(key)) {
                throw this._error(ERROR_CODE.REQUEST_FORMAT_ERROR, 'key', 'string', (key as any).toString());
            }

            const application: IApplicationModel | null = await getApplicationByKey(key);
            if (!application) {
                throw this._error(ERROR_CODE.APPLICATION_KEY_NOT_FOUND, key);
            }

            const applicationGroups: string[] = await Throwable_MapGroups(application.groups);

            res.agent.add('application', {
                avatar: application.avatar,
                name: application.name,
                key: application.key,
                expire: application.expire,
                groups: applicationGroups,
            });
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    }
}
