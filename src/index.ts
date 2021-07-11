/**
 * @author WMXPY
 * @namespace Brontosaurus_Server
 * @description Index
 */

import { connect } from '@brontosaurus/db';
import { SudooExpress, SudooExpressApplication } from '@sudoo/express';
import { LOG_LEVEL, SudooLog } from '@sudoo/log';
import * as Mongoose from "mongoose";
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
import { BrontosaurusConfig, hostPort, isDevelopment, readConfigEnvironment, staticMaxAge } from './util/conf';
import { registerConnor } from './util/error';
import { getVersion } from './util/version';

const setting: SudooExpressApplication = SudooExpressApplication.create(
    'Brontosaurus',
    getVersion(),
);

if (isDevelopment()) {
    setting.allowCrossOrigin();
    SudooLog.global.setLevel(LOG_LEVEL.VERBOSE);
    SudooLog.global.showTime();
} else {
    SudooLog.global.setLevel(LOG_LEVEL.INFO);
}

setting.useBodyParser();
setting.useTrustProxy();
const app: SudooExpress = SudooExpress.create(setting);

const config: BrontosaurusConfig = readConfigEnvironment();

registerConnor();

const connection: Mongoose.Connection = connect(config.database, {
    connected: true,
    disconnected: true,
    error: true,
    reconnected: true,
    reconnectedFailed: true,
});

// Static
app.expressStatic(Path.join(__dirname, '..', 'public', 'portal'), {
    immutable: true,
    maxAge: staticMaxAge,
});

// Health
app.health('/health', () => {
    return connection.readyState >= 1;
});

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

app.host(hostPort);
SudooLog.global.info(`Hosting at port ${hostPort}`);
