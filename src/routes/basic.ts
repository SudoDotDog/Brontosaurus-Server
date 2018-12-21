/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description Basic
 */

import { ISudooExpressRoute, ROUTE_MODE, SudooExpressHandler } from "@sudoo/express";
import { LOG_LEVEL, SudooLog } from '@sudoo/log';
import { ErrorCreationFunction } from "connor";
import { getErrorCreationFunction } from "../util/error";

export abstract class BrontosaurusRoute implements ISudooExpressRoute {

    public abstract readonly path: string;
    public abstract readonly mode: ROUTE_MODE;
    public abstract readonly groups: SudooExpressHandler[];

    protected readonly _error: ErrorCreationFunction = getErrorCreationFunction();
    protected readonly _log: SudooLog = SudooLog.create(LOG_LEVEL.DEBUG);

    public onError(code: number, error: Error) {

        this._log.error(error as any);
        return {
            code: 500,
            message: 'hello',
        };
    }
}
