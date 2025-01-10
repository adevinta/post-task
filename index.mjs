// SPDX-License-Identifier: MIT
// Copyright © 2024 Adevinta

/**
 * The priority of the task: these are the priorities of the Scheduler API.
 * @typedef {('background' | 'user-visible' | 'user-blocking')} SchedulerPriority
 *
 * The timeouts used for setTimeout, which define the minimum delay in
 * milliseconds before the microtask is executed.
 * @type {Record<SchedulerPriority, number>}
 */
const priorityCallbackDelays = Object.create(null, {
	/**
	 * 150ms is the threshold for a "long task" in Chrome. Waiting at least that
	 * long will give a better chance for long queues of work to be broken up.
	 * The task will then be scheduled as part of the next event loop, but
	 * ideally without directly adding to congestion if the CPU is busy.
	 */
	background: { value: 150, enumerable: true },
	/**
	 * The 10ms are arbitrary, chosen because it's an imperceptible delay.
	 * However this approximates a lower priority than `"user-blocking"`.
	 */
	"user-visible": { value: 10, enumerable: true },
	/**
	 * User-blocking callbacks are scheduled immediately.
	 */
	"user-blocking": { value: 0, enumerable: true },
});

/** @typedef {() => void} Task */

/**
 * Queues an arbitrary task to be executed in the browser, with the given
 * priority.
 *
 * Allows the discrete and prioritised queuing of tasks which if run serially
 * would block the main thread, but which do not have to be run immediately nor
 * in a fully-blocking way.
 *
 * @param {Task} task The callback to be executed.
 * @param {SchedulerPriority} priority The priority of the task, following the
 * Scheduler API.
 * @returns {Promise<void>} A promise that resolves when the task is executed,
 * in case it needs to be tracked.
 */
const postTask = (task, priority) => {
	// Prefer to use the Scheduler API, if available.
	if (typeof window !== "undefined" && "scheduler" in window) {
		return scheduler.postTask(task, {
			priority,
		});
	}
	// Otherwise, or on Node.js, set a timeout with the appropriate delay
	else {
		return new Promise((resolve) => {
			setTimeout(() => {
				task();
				resolve();
			}, priorityCallbackDelays[priority]);
		});
	}
};

export default postTask;
