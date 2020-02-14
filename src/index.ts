/**
 * @author WMXPY
 * @namespace Brontosaurus_Server
 * @description Index
 */

import { connect } from '@brontosaurus/db';
import { SudooExpress, SudooExpressApplication } from '@sudoo/express';
import { LOG_LEVEL, SudooLog } from '@sudoo/log';
import * as Path from 'path';
import { ApplicationRoute } from './routes/portal/application';
import { LimboRoute } from './routes/portal/limbo';
import { RetrieveRoute } from './routes/portal/retrieve';
import { SimpleRoute } from './routes/portal/simple';
import { TwoFARoute } from './routes/portal/twoFA';
import { AccountValidateRoute } from './routes/portal/validate';
import { ResetFinishRoute } from './routes/reset/finish';
import { ResetResetRoute } from './routes/reset/reset';
import { ResetTemporaryRoute } from './routes/reset/temporary';
import { BrontosaurusConfig, isDevelopment, readConfigEnvironment } from './util/conf';
import { registerConnor } from './util/error';

const setting: SudooExpressApplication = SudooExpressApplication.create('Brontosaurus', '1');

if (isDevelopment()) {
    setting.allowCrossOrigin();
    SudooLog.global.level(LOG_LEVEL.VERBOSE);
    SudooLog.global.showTime();
} else {
    SudooLog.global.level(LOG_LEVEL.INFO);
}

setting.useBodyParser();
const app: SudooExpress = SudooExpress.create(setting);

const config: BrontosaurusConfig = readConfigEnvironment();

registerConnor();

connect(config.database, {
    connected: true,
    disconnected: true,
    error: true,
    reconnected: true,
    reconnectedFailed: true,
});

// Static
const tenHour: number = 36000000;
app.static(Path.join(__dirname, '..', 'public', 'portal'), {
    immutable: true,
    maxAge: tenHour,
});

// Health
app.health('/health');

// Portal
app.routes(
    new RetrieveRoute(),
    new LimboRoute(),
    new TwoFARoute(),
    new ApplicationRoute(),
    new SimpleRoute(),
    new AccountValidateRoute(),
    new ResetTemporaryRoute(),
    new ResetResetRoute(),
    new ResetFinishRoute(),
);

// tslint:disable-next-line: no-magic-numbers
app.host(8080);
SudooLog.global.critical('Hosting at 8080');
