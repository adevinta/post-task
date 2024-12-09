declare module "post-task" {
	export default function postTask(
		task: () => void,
		priority: "background" | "user-visible" | "user-blocking",
	): Promise<void>;
}
