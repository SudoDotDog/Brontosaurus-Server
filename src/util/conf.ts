/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Conf
 */

import * as Fs from 'fs';
import * as Path from 'path';

export type BrontosaurusConfig = {

    host: string;
    database: string;
};

export const readConfigSync = (): BrontosaurusConfig => {

    try {

        const configPath: string = Path.join(__dirname, '..', '..', 'brontosaurus.conf');
        return JSON.parse(Fs.readFileSync(configPath, 'utf8'));
    } catch (err) {

        console.log('Config file not exist');
        process.exit();
    }

    throw new Error('never');
};

export const readConfigEnvironment = (): BrontosaurusConfig => {

    const host: string | undefined = process.env.BRONTOSAURUS_HOST;
    const database: string | undefined = process.env.BRONTOSAURUS_DATABASE;

    if (host && database) {
        return {
            host,
            database,
        };
    }

    console.log('Config file not exist');
    process.exit();

    throw new Error('never');
};

export const isDevelopment = (): boolean => process.env.NODE_ENV === 'development';
