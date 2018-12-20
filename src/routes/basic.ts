/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description Basic
 */

import { ISudooExpressRoute, ROUTE_MODE, SudooExpressHandler } from "@sudoo/express";
import { ErrorCreationFunction } from "connor";
import { getErrorCreationFunction } from "../util/error";

export abstract class BrontosaurusRoute implements ISudooExpressRoute {

    public abstract readonly path: string;
    public abstract readonly mode: ROUTE_MODE;
    public abstract readonly groups: SudooExpressHandler[];

    protected readonly _error: ErrorCreationFunction = getErrorCreationFunction();

    public onError(code: number, error: Error) {

        return {
            code: 500,
            message: 'hello',
        };
    }
}
