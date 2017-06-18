'use strict';

/**
 * Count down semaphore until its zero.
 *
 * At this point resolve deferred with the result
 *
 * Semaphore is assumed to be a single item array
 * @param semaphore
 * @param deferred
 * @param result
 */
const countDownLatch = (semaphore, deferred, result) => {
  semaphore[0] -= 1;
  if (semaphore[0] === 0) {
    deferred.resolve(result);
  }
};

/**
 * Create a countDownLatch function based on given parameters
 * @param howMany
 * @param deferred
 * @param result
 * @returns {function(this:*)}
 */
const mkCountDownLatch = (howMany, deferred, result) => {
  return countDownLatch.bind(this, [howMany], deferred, result);
};

module.exports = {
  mkCountDownLatch : mkCountDownLatch
};
