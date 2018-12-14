/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Portal
 * @description Index
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

            res.agent
                .add('username', body.safe('username'))
                .add('password', body.safe('password'));
            next();
        },
    ],

    errorHandler: (code: number, error: Error) => {

        return {
            code: 500,
            message: 'hello',
        };
    },
};
