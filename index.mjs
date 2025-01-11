// SPDX-License-Identifier: MIT
// Copyright © 2024 Adevinta

/**
 * The priority of the task: these are the priorities of the Scheduler API.
 * @typedef {('background' | 'user-visible' | 'user-blocking')} SchedulerPriority
 *
 * The timeouts used for `setTimeout`, which define the minimum delay in
 * milliseconds before the callback will be executed.
 * @type {Record<SchedulerPriority, number>}
 */
const priorityCallbackDelays = Object.create(null, {
	/**
	 * A 150ms duration defines a "long task" for the Web Vitals.
	 * Waiting at least that long will give a better chance for long queues of
	 * work to be broken up.
	 *
	 * The task will then be scheduled as part of the next event loop, but
	 * ideally without directly adding to congestion if the CPU is busy.
	 */
	background: { value: 150 },
	/**
	 * User-visible tasks are scheduled immediately, and although this is the
	 * same timeout as for `"user-blocking"`, the fallback for that case will
	 * almost always schedule a microtask with the `queueMicrotask` function;
	 * while the 0ms timeout here will schedule a **macro**task which will run
	 * with a lower priority in the event loop.
	 */
	"user-visible": { value: 0 },
	/**
	 * User-blocking callbacks are scheduled immediately, mirroring the
	 * user-visible case as a fallback for the unlikely case that
	 * `queueMicrotask` is not available.
	 */
	"user-blocking": { value: 0 },
});

/**
 * Queues an arbitrary task to be scheduled for execution with the given
 * priority.
 *
 * Allows the discrete and prioritised queuing of tasks which if run serially
 * would block the main thread, but which do not have to be run immediately.
 *
 * @param {() => void} task The callback to be executed.
 * @param {SchedulerPriority} priority The priority of the task, following the
 * Scheduler API.
 * @returns {Promise<void>} A promise that resolves when the task is executed,
 * in case it needs to be tracked.
 */
const postTask = (task, priority) => {
	// Prefer to use the Scheduler API, if available.
	if ("scheduler" in globalThis) {
		return globalThis.scheduler.postTask(task, {
			priority,
		});
	}
	// Otherwise, if available and for user-blocking tasks,
	// use the native `queueMicrotask`.
	else if (priority === "user-blocking" && "queueMicrotask" in globalThis) {
		return new Promise((resolve) => {
			globalThis.queueMicrotask(() => {
				task();
				resolve();
			});
		});
	}
	// Otherwise, and always for the lower priorities on Node.js where the
	// Scheduler API is not available, set a timeout with the appropriate delay.
	else {
		return new Promise((resolve) => {
			globalThis.setTimeout(() => {
				task();
				resolve();
			}, priorityCallbackDelays[priority]);
		});
	}
};

export default postTask;
