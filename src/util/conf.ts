/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Conf
 */

import { SudooLog } from "@sudoo/log";
import { TimeBuilder } from "@sudoo/magic";

export const hostPort: number = 9000;
export const staticMaxAge: number = TimeBuilder.from({
    hour: 10,
}).inMilliseconds();

export type BrontosaurusConfig = {

    database: string;
};

export const getDatabaseLink = (): string | undefined => {

    const database: string | undefined = process.env.BRONTOSAURUS_DB || process.env.BRONTOSAURUS_DATABASE;
    return database;
};

export const readConfigEnvironment = (): BrontosaurusConfig => {

    const database: string | undefined = getDatabaseLink();
    if (database) {
        return {
            database,
        };
    }

    SudooLog.global.error('Database environment variable not found');
    process.exit();

    throw new Error('never');
};

export const isDevelopment = (): boolean => {

    return process.env.NODE_ENV === 'development';
};
