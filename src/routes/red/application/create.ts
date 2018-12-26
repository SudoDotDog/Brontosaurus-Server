/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Application
 * @description Create
 */

import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { createUnsavedApplication } from "../../../controller/application";
import { createAuthenticateHandler, createGroupVerifyHandler, createTokenHandler } from "../../../handlers/handlers";
import { basicHook } from "../../../handlers/hook";
import { INTERNAL_USER_GROUP } from "../../../interface/group";
import { IApplicationModel } from "../../../model/application";
import { BrontosaurusRoute } from "../../../routes/basic";
import { ERROR_CODE } from "../../../util/error";

export type CreateApplicationRouteBody = {

    name: string;
    key: string;
    expire: number;
    token: string;
};

export class CreateApplicationRoute extends BrontosaurusRoute {

    public readonly path: string = '/application/create';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(createTokenHandler(), '/application/create - TokenHandler'),
        basicHook.wrap(createAuthenticateHandler(), '/application/create - AuthenticateHandler'),
        basicHook.wrap(createGroupVerifyHandler([INTERNAL_USER_GROUP.SUPER_ADMIN], this._error), '/application/create - GroupVerifyHandler'),
        basicHook.wrap(this._applicationCreateHandler.bind(this), '/application/create - Create', true),
    ];

    private async _applicationCreateHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<CreateApplicationRouteBody> = Safe.extract(req.body as CreateApplicationRouteBody, this._error(ERROR_CODE.INSUFFICIENT_INFORMATION));

        try {

            const application: IApplicationModel = createUnsavedApplication(
                body.direct('name'),
                body.direct('key'),
                body.direct('expire'),
                body.direct('token'),
            );

            await application.save();
        } catch (err) {

            res.agent.fail(400, err);
        } finally {

            next();
        }
    }
}
