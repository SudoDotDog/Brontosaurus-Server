/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description Retrieve
 */

import { ISudooExpressRoute, ROUTE_MODE, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { SafeExtract } from '@sudoo/extract';
import { IApplicationModel } from "../model/application";
import { getApplicationByKey } from "../mutation/application";

export type RetrieveRouteBody = {

    username: string;
    password: string;
    applicationKey: string;
};

export const RetrieveRoute: ISudooExpressRoute = {

    path: '/retrieve',
    mode: ROUTE_MODE.POST,

    groups: [
        async (req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction) => {

            const body: SafeExtract<RetrieveRouteBody> = SafeExtract.create(req.body);

            try {
                const application: IApplicationModel = await getApplicationByKey(body.direct('applicationKey'));
                res.agent
                    .add('username', body.direct('username'))
                    .add('password', body.direct('password'));
            } catch (err) {
                res.agent.fail(400, err);
            } finally {
                next();
            }
        },
    ],

    onError: (code: number, error: Error) => {

        return {
            code: 500,
            message: 'hello',
        };
    },
};
