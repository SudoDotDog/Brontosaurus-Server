/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Application
 * @description Create
 */

import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { createUnsavedApplication } from "../../controller/application";
import { IApplicationModel } from "../../model/application";
import { BrontosaurusRoute } from "../basic";

export type CreateApplicationRouteBody = {

    name: string;
    key: string;
    token: string;
};

export class CreateApplicationRoute extends BrontosaurusRoute {

    public readonly path: string = '/application/create';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        this._portalHandler,
    ];

    private async _portalHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<CreateApplicationRouteBody> = Safe.extract(req.body as CreateApplicationRouteBody);

        try {

            const application: IApplicationModel = createUnsavedApplication(
                body.direct('name'),
                body.direct('key'),
                body.direct('token'),
            );

            await application.save();
        } catch (err) {

            res.agent.fail(400, err);
        } finally {

            next();
        }
    }
}
