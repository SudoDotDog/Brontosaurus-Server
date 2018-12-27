/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description Retrieve
 */

import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { getAccountByUsername } from "../../../controller/account";
import { getApplicationByKey } from "../../../controller/application";
import { IAccountModel } from "../../../model/account";
import { IApplicationModel } from "../../../model/application";
import { ERROR_CODE } from "../../../util/error";
import { createToken } from '../../../util/token';
import { BrontosaurusRoute } from "../../basic";
import { basicHook } from "../../../handlers/hook";

export type RetrieveRouteBody = {

    username: string;
    password: string;
    applicationKey: string;
};

export class RetrieveRoute extends BrontosaurusRoute {

    public readonly path: string = '/retrieve';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(this._retrieveHandler.bind(this), '/retrieve - Retrieve', true),
    ];

    private async _retrieveHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<RetrieveRouteBody> = Safe.extract(req.body as RetrieveRouteBody);

        try {

            const account: IAccountModel = Safe.value(await getAccountByUsername(body.direct('username'))).safe();

            if (account.password !== body.direct('password')) {
                throw this._error(ERROR_CODE.PASSWORD_DOES_NOT_MATCH);
            }

            const application: IApplicationModel = Safe.value(await getApplicationByKey(body.direct('applicationKey'))).safe();
            const token: string = createToken(account.username, application);

            res.agent.add('token', token);
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    }
}
