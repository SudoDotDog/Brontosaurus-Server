/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description Portal
 */

import { ISudooExpressRoute, ROUTE_MODE, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { SafeExtract } from '@sudoo/extract';

export type PortalRouteBody = {

    username: string;
    password: string;
};

export const PortalRoute: ISudooExpressRoute = {

    path: '/portal',
    mode: ROUTE_MODE.POST,

    groups: [
        (req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction) => {

            const body: SafeExtract<PortalRouteBody> = SafeExtract.create(req.body);

            try {
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