/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description Register
 */

import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe } from '@sudoo/extract';
import { SafeExtract } from "@sudoo/extract/dist/extract";
import { createUnsavedAccount } from "../../../controller/account";
import { IAccountModel } from "../../../model/account";
import { BrontosaurusRoute } from "../../../routes/basic";

export type RegisterRouteBody = {

    username: string;
    password: string;
    infos: string[];
};

export class RegisterRoute extends BrontosaurusRoute {

    public readonly path: string = '/register';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        this._registerHandler.bind(this),
    ];

    private async _registerHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<RegisterRouteBody> = Safe.extract(req.body as RegisterRouteBody);

        try {

            const username = body.direct('username');
            const password = body.direct('password');
            const infos = JSON.parse(body.direct('infos') as any as string);

            const account: IAccountModel = createUnsavedAccount(username, password, infos);

            await account.save();

            res.agent.add('account', account.id);
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    }
}
