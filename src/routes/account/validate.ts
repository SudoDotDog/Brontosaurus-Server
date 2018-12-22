/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Account
 * @description Validate
 */

import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { getApplicationByKey } from "../../controller/application";
import { IApplicationModel } from "../../model/application";
import { Throwable_ValidateToken } from "../../util/auth";
import { BrontosaurusRoute } from "../basic";

export type AccountValidateRouteBody = {

    token: string;
    applicationKey: string;
};

export class AccountValidateRoute extends BrontosaurusRoute {

    public readonly path: string = '/account/validate';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        this._portalHandler.bind(this),
    ];

    private async _portalHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<AccountValidateRouteBody> = Safe.extract(req.body as AccountValidateRouteBody);

        try {

            const application: IApplicationModel = await getApplicationByKey(body.direct('applicationKey'));
            Throwable_ValidateToken(application.secret, application.expire, body.direct('token'));

            res.agent.add('validate', true);
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    }
}
