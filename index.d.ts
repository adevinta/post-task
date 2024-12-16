declare module "post-task" {
	/**
	 * Queues an arbitrary task to be executed in the browser, with the given priority.
	 * Allows breaking up the work of potentially long-running tasks to avoid blocking the main thread.
	 */
	export default function postTask(
		task: () => void,
		priority: "background" | "user-visible" | "user-blocking",
	): Promise<void>;
}
