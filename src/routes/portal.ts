/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Portal
 * @description Index
*/

import { ISudooExpressRoute, ROUTE_MODE, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";

export const PortalRoute: ISudooExpressRoute = {

    path: '/portal',
    mode: ROUTE_MODE.GET,

    groups: [
        (req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction) => {

            res.agent.add('hello', 'world');
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
