# post-task

A pre-configured progressively-enhancement utility function based on the Scheduler API.

If the scheduler API is available, use it.
If not, but `requestIdleCallback` is, then use that. Otherwise set a timeout.

The Scheduler API relies on browser heuristics, while the fallbacks wait and
call back (in the case of `requestIdleCallback`, as soon as possible in idle time
and definitely at the timeout, for `setTimeout` only at the timeout).

If not in a browser environment, call back immediately.

The tasks all return a `Promise<void>` since the `scheduler.postTask` returns
one, but without any return value.

The API is preconfigured with defaults to schedule tasks, based on the
[`scheduler.postTask` API](https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/postTask).

This function is useful for breaking up chunks of work and freeing the main
thread, particularly important when focusing on the
[Interaction to Next Paint](https://web.dev/articles/inp)
web vital.

## Use

```js
import postTask from "post-task";

// ...
postTask(() => {
	trackEvent("something-happened");
}, "background");
```

## Formats

This package is equally available as ESM and CJS and has a single, default
export.
The code is identical between the formats except on the exporting itself.