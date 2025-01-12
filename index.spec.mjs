import assert from "node:assert/strict";
import { test, suite, before, after } from "node:test";
import postTask from "./index.mjs";

suite("postTask", () => {
	const {
		queueMicrotask: queueMicrotaskOriginal,
		scheduler: schedulerOriginal,
	} = globalThis;

	suite("when neither the scheduler nor queueMicrotask are available", () => {
		before(() => {
			delete globalThis.queueMicrotask;
			delete globalThis.scheduler;
		});

		after(() => {
			globalThis.queueMicrotask = queueMicrotaskOriginal;
			globalThis.scheduler = schedulerOriginal;
		});

		test("all priorities should call back", (context) => {
			context.mock.timers.enable(["setTimeout"]);

			const callback = context.mock.fn();

			// Schedule all tasks synchronously: the loops will queue all three
			// tasks because there is no `await`.
			postTask(callback, "user-blocking");
			postTask(callback, "user-visible");
			postTask(callback, "background");

			assert.equal(callback.mock.calls.length, 0);

			// Allow the minimal tick to pass, which will enable both timeouts
			// with a 0ms delay to run, and not the third which has a minimum
			context.mock.timers.tick(0);
			assert.equal(callback.mock.calls.length, 2);

			// Allow the 150ms delay for the background task to pass.
			context.mock.timers.tick(150);
			assert.equal(callback.mock.calls.length, 3);
		});
	});

	suite("when `queueMicrotask` is available", () => {
		before(() => {
			delete globalThis.scheduler;
		});

		after(() => {
			globalThis.queueMicrotask = queueMicrotaskOriginal;
			globalThis.scheduler = schedulerOriginal;
		});

		test("all priorities should call back", async (context) => {
			context.mock.timers.enable(["setTimeout"]);

			const callback = context.mock.fn();

			// Schedule all tasks synchronously: the loops will queue all three
			// tasks because there is no `await`.
			postTask(callback, "user-blocking");
			postTask(callback, "user-visible");
			postTask(callback, "background");

			assert.equal(callback.mock.calls.length, 0);

			// Await for the resolution of a microtask: giving that control back to
			// the event loop results in it running _all_ microtasks, including the
			// queued one for the `"user-blocking"` task.
			await Promise.resolve();
			assert.equal(callback.mock.calls.length, 1);

			// Allow the minimal tick to pass, which will enable both timeouts
			// with a 0ms delay to run, and not the third which has a minimum
			context.mock.timers.tick(0);
			assert.equal(callback.mock.calls.length, 2);

			// Allow the 150ms delay for the background task to pass.
			context.mock.timers.tick(150);
			assert.equal(callback.mock.calls.length, 3);
		});
	});

	suite("when `scheduler` is available", async () => {
		after(() => {
			globalThis.scheduler = schedulerOriginal;
		});

		test("all priorities should be scheduled", async (context) => {
			// Mock the function which is to be called
			const mockSchedulerPostTask = context.mock.fn();
			globalThis.scheduler = { postTask: mockSchedulerPostTask };

			const noop = () => undefined;

			// Schedule all tasks synchronously
			postTask(noop, "user-blocking");
			postTask(noop, "user-visible");
			postTask(noop, "background");

			// Assert that the control flow correctly forwards the tasks:
			// the callback is handled by the scheduler, so asserting on the callback
			// would be testing the mock, and not useful.
			assert.equal(mockSchedulerPostTask.mock.calls.length, 3);
			assert.deepEqual(mockSchedulerPostTask.mock.calls[0].arguments, [
				noop,
				{
					priority: "user-blocking",
				},
			]);
			assert.deepEqual(mockSchedulerPostTask.mock.calls[1].arguments, [
				noop,
				{
					priority: "user-visible",
				},
			]);
			assert.deepEqual(mockSchedulerPostTask.mock.calls[2].arguments, [
				noop,
				{
					priority: "background",
				},
			]);
		});
	});
});
