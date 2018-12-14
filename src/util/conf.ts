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

        return JSON.parse(Fs.readFileSync(Path.join(__dirname, '..', '..', 'brontosaurus.conf'), 'utf8'));
    } catch (err) {

        console.log('Config file not exist');
        process.exit();
    }

    throw new Error('never');
};
