/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description Retrieve
 */

import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { SafeExtract } from '@sudoo/extract';
import { getAccountByUsername } from "../controller/account";
import { getApplicationByKey } from "../controller/application";
import { IAccountModel } from "../model/account";
import { IApplicationModel } from "../model/application";
import { BrontosaurusRoute } from "./basic";

export type RetrieveRouteBody = {

    username: string;
    password: string;
    applicationKey: string;
};

export class RetrieveRoute extends BrontosaurusRoute {

    public readonly path: string = '/portal';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        this._retrieveHandler,
    ];

    private async _retrieveHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<RetrieveRouteBody> = SafeExtract.create(req.body);

        try {

            const account: IAccountModel = await getAccountByUsername(body.direct('username'));

            const application: IApplicationModel = await getApplicationByKey(body.direct('applicationKey'));
            res.agent
                .add('username', body.direct('username'))
                .add('password', body.direct('password'));
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    }
}
