/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description Register
 */

import { _Map } from '@sudoo/bark';
import { ISudooExpressRoute, ROUTE_MODE, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { SafeExtract } from '@sudoo/extract';
import { AccountInfo } from "../interface/account";
import { IAccountModel } from "../model/account";
import { createAccount } from "../mutation/account";

export type RegisterRouteBody = {

    username: string;
    password: string;
    infos: {
        [key: string]: string;
    };
};

export const RegisterRoute: ISudooExpressRoute = {

    path: '/register',
    mode: ROUTE_MODE.POST,

    groups: [
        async (req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction) => {

            const body: SafeExtract<RegisterRouteBody> = SafeExtract.create(req.body);

            try {

                const username = body.direct('username');
                const password = body.direct('password');
                const infos = JSON.parse(body.direct('infos') as any as string);

                const parsed: AccountInfo[] = _Map.keys(infos).map((key: string) => ({
                    name: key,
                    value: infos[key],
                }));

                const account: IAccountModel = createAccount(username, password, parsed);

                await account.save();

                res.agent.add('account', account.id);
            } catch (err) {
                res.agent.fail(400, err);
            } finally {
                next();
            }
        },
    ],

    onError: (code: number, error: Error) => {

        return {
            code,
            message: error.message,
        };
    },
};
