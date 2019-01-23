/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Controller
 * @description Account
 * @package Unit Test
 */

import { expect } from 'chai';
import { getAllAccounts } from '../../../src/controller/account';
import { IAccountModel } from '../../../src/model/account';
import { Connector } from '../../mock/mongoose';

describe('Given {Accounts} Controllers', (): void => {

    const connector: Connector = Connector.create();

    connector.before();
    connector.verify();

    it('should be able to get all accounts', async (): Promise<void> => {

        const accounts: IAccountModel[] = await getAllAccounts();

        // tslint:disable-next-line
        expect(accounts).to.be.empty;
    }).timeout(connector.timeout);

    connector.after();
});
