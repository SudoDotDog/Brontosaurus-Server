/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description Retrieve
 */

import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { getAccountByUsername } from "../../controller/account";
import { getApplicationByKey } from "../../controller/application";
import { basicHook } from "../../handlers/hook";
import { IAccountModel } from "../../model/account";
import { IApplicationModel } from "../../model/application";
import { ERROR_CODE } from "../../util/error";
import { createToken } from '../../util/token';
import { BrontosaurusRoute } from "../basic";

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

        const body: SafeExtract<RetrieveRouteBody> = Safe.extract(req.body as RetrieveRouteBody, this._error(ERROR_CODE.REQUEST_DOES_MATCH_PATTERN));

        try {

            const account: IAccountModel | null = await getAccountByUsername(body.direct('username'));

            if (!account) {
                throw this._error(ERROR_CODE.PASSWORD_DOES_NOT_MATCH);
            }

            if (account.password !== body.direct('password')) {
                throw this._error(ERROR_CODE.PASSWORD_DOES_NOT_MATCH);
            }

            const application: IApplicationModel | null = await getApplicationByKey(body.direct('applicationKey'));

            if (!application) {
                throw this._error(ERROR_CODE.APPLICATION_KEY_NOT_FOUND);
            }

            const token: string = createToken(account.username, application);

            res.agent.add('token', token);
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    }
}
