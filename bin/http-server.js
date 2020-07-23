import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import polka from 'polka';
import sirv from 'sirv';

const filename = fileURLToPath(import.meta.url);
const resolvePath = (file) => resolve(dirname(filename), file);
const publicPath = resolvePath('../public');

export default (port) => {
  return polka()
    .use(sirv(publicPath, { single: true }))
    .listen(port, (error) => {
      if (error) throw error;

      // eslint-disable-next-line no-console
      console.log(`> Running on localhost:${port}`);
    });
};
