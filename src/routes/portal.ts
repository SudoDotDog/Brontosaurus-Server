/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description Portal
 */

import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { BrontosaurusRoute } from "./basic";

export type PortalRouteBody = {

    username: string;
    password: string;
};

export class PortalRoute extends BrontosaurusRoute {

    public readonly path: string = '/portal';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        this._portalHandler.bind(this),
    ];

    private async _portalHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<PortalRouteBody> = Safe.extract(req.body as PortalRouteBody);

        try {
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
