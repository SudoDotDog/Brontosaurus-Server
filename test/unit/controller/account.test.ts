/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Controller
 * @description Account
 * @package Unit Test
 */

import { Connector } from '../../mock/mongoose';

describe('Given {Accounts} Controllers', (): void => {

    const connector: Connector = Connector.create();

    connector.before();
    connector.verify();

    connector.after();
});
