// SPDX-License-Identifier: MIT
// Copyright © 2024 Adevinta
// Copyright © 2025 Daniel Arthur Gallagher

declare module "@dagher/post-task" {
	/**
	 * Queues an arbitrary task to be scheduled for execution with the given
	 * priority.
	 *
	 * Allows the discrete and prioritised queuing of tasks which if run serially
	 * would block the main thread, but which do not have to be run immediately.
	 *
	 * @param task The callback to be executed.
	 * @param priority The priority of the task, following the
	 * Scheduler API.
	 * @returns A promise that resolves when the task is executed,
	 * in case it needs to be tracked.
	 */
	export default function postTask(
		task: () => void,
		priority: "background" | "user-visible" | "user-blocking",
	): Promise<void>;
}
