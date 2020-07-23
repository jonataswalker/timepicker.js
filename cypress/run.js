import waitOn from 'wait-on';
import cypress from 'cypress';

export default (port, openCypress) => {
  const baseUrl = `http://localhost:${port}`;
  const options = {
    resources: [baseUrl],
    // delay: 300, // initial delay in ms, default 0
    interval: 100, // poll interval in ms, default 250ms
    timeout: 3000, // timeout in ms, default Infinity

    validateStatus(status) {
      return status >= 200 && status < 300;
    },
  };

  const cypressConfig = {
    baseUrl,
    video: false,
    watchForFileChanges: true,
    viewportWidth: 1366,
    viewportHeight: 720,
    testFiles: '**/*.spec.js',
  };

  const cypressOptions = {
    headless: true,
    exit: true,
    config: cypressConfig,
    configFile: false,
    reporter: 'spec',
    // reporterOptions: {
    //   toConsole: true,
    // },
  };

  if (openCypress) {
    return Promise.resolve(() => waitOn(options))
      .then(() => cypress.open(cypressOptions))
      .catch((error) => {
        throw new Error(error);
      });
  }

  return new Promise((resolve, reject) => {
    waitOn(options)
      .then(() => cypress.run(cypressOptions))
      .then(resolve)
      .catch(reject);
  });
};
