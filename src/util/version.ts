/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Version
 */

export const getVersion = (): string => {

    if (process.env.RELEASE_VERSION) {
        return process.env.RELEASE_VERSION;
    }

    return 'LOCAL';
};
