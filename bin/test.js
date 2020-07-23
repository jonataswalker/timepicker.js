#!/usr/bin/env node

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import prompts from 'prompts';
import run from 'npm-run-all';
import minimist from 'minimist';
import jetpack from 'fs-jetpack';

import runCypress from '../cypress/run.js';

import startServer from './http-server.js';

const filename = fileURLToPath(import.meta.url);
const resolvePath = (file) => resolve(dirname(filename), file);

const port = 5000;

const build = async () => {
  process.env.NODE_ENV = 'test';

  const buildResults = await run(['build'], {
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
  });

  if (buildResults[0].code !== 0) {
    throw new Error(`Building error`);
  }
};

const buildAndRun = async () => {
  const argument = minimist(process.argv.slice(2));
  const isPipeline = 'env' in argument;

  let polka;
  let openCypress = false;

  try {
    if (!isPipeline) {
      const response = await prompts({
        type: 'select',
        name: 'test',
        message: 'What do you like to do?',

        choices: [
          { title: 'Interfaces Tests', value: { action: 'open' } },
          { title: 'CLI Tests', value: { action: 'run' } },
        ],

        stdin: process.stdin,
        stdout: process.stdout,
        stderr: process.stderr,
      });

      openCypress = response.test.action === 'open';
    }

    await build();
    jetpack.copy(resolvePath('../dist/timepicker.js'), resolvePath('../public/timepicker.js'), {
      overwrite: true,
    });
    polka = startServer(port);

    const testResult = await runCypress(port, openCypress);

    if (testResult && testResult.totalFailed > 0) {
      throw new Error('Tests failed');
    }
  } catch (error) {
    throw new Error(error);
  } finally {
    polka && polka.server.close();
  }
};

buildAndRun().catch((error) => {
  console.trace(error);
  process.exit(1);
});
