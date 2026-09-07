/**
 * Tests for the push scheduler.
 *
 * The arming rule is the important one here. `persist` rehydrates from
 * AsyncStorage asynchronously and applies it with `set()`, which changes synced
 * keys. If the scheduler reacted to that, a device holding less than the cloud
 * does would push a thin row over good data *before* the first pull ran, and
 * the pull would then merge against the row it had just clobbered.
 */

import { createSyncScheduler } from '../../lib/syncScheduler';

describe('createSyncScheduler', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const setup = (debounceMs = 1500) => {
    const push = jest.fn();
    return { push, scheduler: createSyncScheduler({ push, debounceMs }) };
  };

  it('starts disarmed', () => {
    const { scheduler } = setup();
    expect(scheduler.armed()).toBe(false);
  });

  it('ignores changes until armed — the rehydrate race', () => {
    const { push, scheduler } = setup();
    scheduler.note(false);
    scheduler.note(true); // not even an urgent one gets through
    jest.advanceTimersByTime(10_000);
    expect(push).not.toHaveBeenCalled();
  });

  it('ignores a flush until armed', () => {
    const { push, scheduler } = setup();
    scheduler.flush();
    expect(push).not.toHaveBeenCalled();
  });

  it('debounces an ordinary change', () => {
    const { push, scheduler } = setup();
    scheduler.arm();
    scheduler.note(false);
    expect(push).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1500);
    expect(push).toHaveBeenCalledTimes(1);
  });

  it('batches a burst into one push', () => {
    // Rating five cards in a row is one upload, not five.
    const { push, scheduler } = setup();
    scheduler.arm();
    for (let i = 0; i < 5; i++) {
      scheduler.note(false);
      jest.advanceTimersByTime(200);
    }
    expect(push).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1500);
    expect(push).toHaveBeenCalledTimes(1);
  });

  it('pushes an urgent change immediately', () => {
    // Subscription state costs money to get wrong.
    const { push, scheduler } = setup();
    scheduler.arm();
    scheduler.note(true);
    expect(push).toHaveBeenCalledTimes(1);
  });

  it('an urgent change absorbs a pending debounced one', () => {
    const { push, scheduler } = setup();
    scheduler.arm();
    scheduler.note(false);
    scheduler.note(true);
    jest.advanceTimersByTime(10_000);
    expect(push).toHaveBeenCalledTimes(1);
  });

  it('flush pushes a pending change now', () => {
    // App foregrounded with the debounce still owing.
    const { push, scheduler } = setup();
    scheduler.arm();
    scheduler.note(false);
    scheduler.flush();
    expect(push).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(10_000);
    expect(push).toHaveBeenCalledTimes(1); // the timer did not fire again
  });

  it('disarm drops a pending push', () => {
    // Sign-out clears every synced key. A push landing after that writes an
    // emptied row over the user's data — and after a deletion, recreates the
    // row that was just erased.
    const { push, scheduler } = setup();
    scheduler.arm();
    scheduler.note(false);
    scheduler.disarm();
    jest.advanceTimersByTime(10_000);
    expect(push).not.toHaveBeenCalled();
    expect(scheduler.armed()).toBe(false);
  });

  it('stays quiet after disarm, including for urgent changes', () => {
    const { push, scheduler } = setup();
    scheduler.arm();
    scheduler.disarm();
    scheduler.note(true);
    scheduler.flush();
    expect(push).not.toHaveBeenCalled();
  });

  it('can be re-armed after a sign-out and sign-in', () => {
    const { push, scheduler } = setup();
    scheduler.arm();
    scheduler.disarm();
    scheduler.arm();
    scheduler.note(false);
    jest.advanceTimersByTime(1500);
    expect(push).toHaveBeenCalledTimes(1);
  });

  it('arming twice does not double-push', () => {
    const { push, scheduler } = setup();
    scheduler.arm();
    scheduler.arm();
    scheduler.note(false);
    jest.advanceTimersByTime(1500);
    expect(push).toHaveBeenCalledTimes(1);
  });
});
