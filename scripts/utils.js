exports.wait = (interval) => new Promise((r) => setTimeout(r, interval));

exports.schedule = (taskName, interval, f) => {
  let running = true;
  (async () => {
    console.log(`Starting ${taskName} and polling every ${interval}ms`);
    while (running) {
      /* eslint-disable */
      try {
        await f();
      } catch (e) {
        console.error(
          `Error in ${taskName} poll. Continuing in ${interval}. %O`,
          e
        );
      }
      await wait(interval);
    }
    console.log(`Stopped ${taskName}`);
  })();
  return () => {
    console.log(`Stopping ${taskName}`);
    running = false;
  };
}

exports.airtableBatchUpdate = (taskName, interval, f) => {
  let running = true;
  (async () => {
    console.log(`Starting ${taskName} and polling every ${interval}ms`);
    while (running) {
      /* eslint-disable */
      try {
        await f();
      } catch (e) {
        console.error(
          `Error in ${taskName} poll. Continuing in ${interval}. %O`,
          e
        );
      }
      await wait(interval);
    }
    console.log(`Stopped ${taskName}`);
  })();
  return () => {
    console.log(`Stopping ${taskName}`);
    running = false;
  };
}