#!/usr/bin/env bun

import { startServer } from "server";
import { getConfigFromPartial } from "server/config";

const config = getConfigFromPartial({});
startServer(config);
