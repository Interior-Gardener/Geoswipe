// client/src/utils/gestureBus.js
//
// In-page event bus for gesture and cursor events.
//
// Gesture detection now runs in this browser tab (see gestureClassifier.js and
// components/CameraCapture.jsx), so results no longer need a server round trip:
// webcam frame -> base64 -> WebSocket -> Node relay -> Python worker -> back
// again is gone entirely. Detection results are delivered straight to the
// components that consume them.
//
// The API deliberately mirrors the subset of the Socket.IO client surface the
// gesture components already used (`on`, `off`, `emit`, and `off(event)` to
// clear every handler for an event), so the consuming components change only
// where they obtain this object - their handler logic is untouched.
//
// SUBSCRIPTION SCOPING - the reason getGestureBus() hands out a new handle
// rather than one shared object:
//
// Each consumer used to create its OWN Socket.IO connection, so calling the
// bare `socket.off("cursor")` only detached that module's listeners. EarthThreeJS
// relies on exactly that - it clears "cursor"/"gesture" on setup to avoid
// duplicate listeners, and again on teardown. Against a single shared registry
// that same call would also detach GlobalGestureCursor and every GestureButton,
// which is precisely what happened: the cursor died the moment Explore mounted.
//
// So each handle keeps its own registry. `off(event)` clears only the handlers
// registered through that handle, while `emit` still reaches every handle -
// reproducing the old per-connection isolation without the connections.

// Every handle that currently has at least one subscription.
const activeScopes = new Set();

function createScope() {
  // event -> Set<handler>, private to this handle.
  const handlers = new Map();

  function on(event, handler) {
    if (typeof handler !== 'function') return;

    if (!handlers.has(event)) {
      handlers.set(event, new Set());
    }
    handlers.get(event).add(handler);

    // Re-register if this scope was reclaimed after going empty.
    activeScopes.add(scope);
  }

  /**
   * Remove one handler, or - when `handler` is omitted - every handler THIS
   * handle registered for the event. Other consumers are never affected.
   */
  function off(event, handler) {
    const forEvent = handlers.get(event);
    if (!forEvent) return;

    if (handler === undefined) {
      handlers.delete(event);
    } else {
      forEvent.delete(handler);
      if (forEvent.size === 0) {
        handlers.delete(event);
      }
    }

    // Drop the scope once it holds nothing, so handles belonging to unmounted
    // components do not accumulate for the life of the page.
    if (handlers.size === 0) {
      activeScopes.delete(scope);
    }
  }

  function emit(event, payload) {
    // Snapshot first: a handler may subscribe or unsubscribe while running,
    // and mutating a Set mid-iteration would skip or repeat handlers.
    const targets = [];
    activeScopes.forEach((candidate) => {
      const forEvent = candidate.handlers.get(event);
      if (forEvent) {
        forEvent.forEach((handler) => targets.push(handler));
      }
    });

    targets.forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        // One badly-behaved subscriber must not stop the others from getting
        // the event - a throw here would otherwise kill the whole frame loop.
        console.error(`[gestureBus] handler for "${event}" threw:`, error);
      }
    });
  }

  const scope = { handlers, on, off, emit };
  return scope;
}

/**
 * A subscription handle. Call it once per consumer (module or component
 * instance); handlers registered through it are isolated from every other
 * handle, but emitted events reach all of them.
 */
export function getGestureBus() {
  return createScope();
}

export default getGestureBus;
