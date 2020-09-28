import { retryableProxy } from "./retryableProxy";

type AsyncFunction = () => Promise<boolean>;
const passAfter = (attempts: number): AsyncFunction => {
  let attemptsRemaining = attempts;

  return () => {
    if (attemptsRemaining <= 1) return Promise.resolve(true);

    attemptsRemaining--;

    return Promise.reject(new Error("Test Reject"));
  };
};

interface CountingFunction extends AsyncFunction {
  counter: number;
}

const count = (fn: AsyncFunction) => {
  const result: CountingFunction = function () {
    result.counter++;
    return fn();
  };
  result.counter = 0;
  return result;
};

describe("retryableProxy", () => {
  let reliableFunction: CountingFunction;
  let unreliableFunction: CountingFunction;
  let veryUnreliableFunction: CountingFunction;

  beforeEach(() => {
    reliableFunction = count(passAfter(1));
    unreliableFunction = count(passAfter(3));
    veryUnreliableFunction = count(passAfter(20));
  });

  it("should return immediately if the promise is resolved", async () => {
    const passFirstTime = retryableProxy(reliableFunction);

    await expect(passFirstTime()).resolves.toEqual(true);

    expect(reliableFunction.counter).toEqual(1);
  });

  it("should retry until the promise is resolved", async () => {
    const retryThreeTimes = retryableProxy(unreliableFunction, {
      intervalMS: 5,
    });

    await expect(retryThreeTimes()).resolves.toEqual(true);

    expect(unreliableFunction.counter).toEqual(3);
  });

  it("should fail after retrying max times", async () => {
    const retryFiveTimes = retryableProxy(veryUnreliableFunction, {
      intervalMS: 1,
    });

    await expect(retryFiveTimes()).rejects.toEqual(new Error("Test Reject"));

    expect(veryUnreliableFunction.counter).toEqual(10);
  });
});
