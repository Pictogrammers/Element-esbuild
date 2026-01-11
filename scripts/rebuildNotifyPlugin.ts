const green = (text: string) => `\x1b[32m${text}\x1b[0m`;

export const rebuildNotifyPlugin = {
  name: 'rebuild-notify',
  setup(build: any) {
    build.onEnd((result: any) => {
      if (result.errors.length > 0) {
        console.error(`Build ended with ${result.errors.length} errors`);
      } else {
        console.log(green('Build succeeded!'));
      }
      // You can add logic here to restart a server, send a signal, etc.
    });
  },
};
