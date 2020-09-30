declare module "@civic/simple-cache" {
  type Opts = {
    ttl: numbber;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function cache<T>(fn: (...args: Array<any>) => T, opts: Opts): typeof fn;
  export = cache;
}
