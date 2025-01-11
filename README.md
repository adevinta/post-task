# post-task

A pre-configured progressively-enhancement utility function based on the
[Scheduler API](https://developer.mozilla.org/en-US/docs/Web/API/Prioritized_Task_Scheduling_API).

If the Scheduler API is available, use it. Otherwise set a timeout as a
fallback.

The Scheduler API relies on browser heuristics, while the fallback waits and
calls back only after a certain time has passed.

The tasks all return a `Promise<void>` since the `scheduler.postTask` returns
one.

The interface re-exposes the values accepted for the
[`scheduler.postTask` API](https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/postTask)
and forwards them through when that API is available.

The fallbacks are configured as following:

| Priority          | Timeout delay (ms) |
| ----------------- | ------------------ |
| `"user-blocking"` | 0                  |
| `"user-visible"`  | 0                  |
| `"background"`    | 150                |

There is one exception: if a priority of `"user-blocking"` is passed, and the
Scheduler API is not available, the fallback will be
[`queueMicrotask`](https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask)
if that function
[is available, which it usually will be, including in Node.js](https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask#browser_compatibility).

This function is useful for breaking up chunks of work and allowing the event
loop to cycle, which is particularly important when focusing on the
[Interaction to Next Paint](https://web.dev/articles/inp)
web vital and of course the smooth interaction which it tries to measure.

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
