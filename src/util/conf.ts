/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Conf
 */

export const hostPort: number = 9000;

export type BrontosaurusConfig = {

    database: string;
};

export const readConfigEnvironment = (): BrontosaurusConfig => {

    const database: string | undefined = process.env.BRONTOSAURUS_DB || process.env.BRONTOSAURUS_DATABASE;

    if (database) {
        return {
            database,
        };
    }

    console.log('Environment variable not found');
    process.exit();

    throw new Error('never');
};

export const isDevelopment = (): boolean => process.env.NODE_ENV === 'development';
