// Compatibility shim for older libraries that use Dimensions.addEventListener/removeEventListener
// and for components that expect measureInWindow on refs. Import this file once at app startup.
import { Dimensions } from 'react-native';

// Polyfill for Dimensions.addEventListener/removeEventListener
// Newer RN returns remove function from addEventListener or uses addEventListener('change', handler)
// We'll create functions with the old API surface for backwards compatibility.

type Handler = ({ window, screen }: { window: any; screen: any }) => void;

if (!(Dimensions as any).__patchedByChatAppShim) {
  const originalAdd: any = (Dimensions as any).addEventListener;
  const originalRemove: any = (Dimensions as any).removeEventListener;

  try {
    // If addEventListener exists and returns a subscription, adapt it
    (Dimensions as any).addEventListener = (type: string, handler: Handler) => {
      if (typeof originalAdd === 'function') {
        // Some versions expect ('change', handler)
        const res = originalAdd(type, handler);
        // If originalAdd returns an object with remove(), return it, else return a compatible object
        if (res && typeof res.remove === 'function') {
          return res;
        }
        return {
          remove: () => {
            try {
              if (typeof originalRemove === 'function') {
                originalRemove(type, handler);
              }
            } catch (e) {
              // no-op
            }
          },
        };
      }

      // If originalAdd is not a function, try using the new API Dimensions.addEventListener which returns a subscription
      if ((Dimensions as any).addEventListener && typeof (Dimensions as any).addEventListener === 'function') {
        try {
          const sub = (Dimensions as any).addEventListener(type, handler);
          if (sub && typeof sub.remove === 'function') return sub;
        } catch (e) {
          // noop
        }
      }

      // Last-resort: nothing to do, return a dummy subscription
      return {
        remove: () => {},
      };
    };

    // Provide removeEventListener for libs that call it directly
    (Dimensions as any).removeEventListener = (type: string, handler: Handler) => {
      if (typeof originalRemove === 'function') {
        try {
          originalRemove(type, handler);
        } catch (e) {
          // no-op
        }
      } else {
        // Try the newer API (no-op if not available)
        try {
          const sub = (Dimensions as any).addEventListener && (Dimensions as any).addEventListener(type, handler);
          if (sub && typeof sub.remove === 'function') sub.remove();
        } catch (e) {
          // no-op
        }
      }
    };
  } catch (e) {
    // ignore shim errors
  }

  // mark patched so we don't patch twice
  (Dimensions as any).__patchedByChatAppShim = true;
}

// Also add a helper to guard measureInWindow usage.
// Some older libs call ref.measureInWindow(...) directly even when ref is undefined.
// We can't safely modify refs across the app, but we can attach a no-op function to
// UIManager or global helpers if needed. However, modifying component refs directly
// isn't possible here. We will instead export a helper that components could use.

export function safeMeasure(componentRef: any, callback: (...args: any[]) => void) {
  try {
    if (!componentRef) return;
    const fn = componentRef.measureInWindow || componentRef.measure;
    if (typeof fn === 'function') {
      fn.call(componentRef, (...args: any[]) => callback(...args));
    }
  } catch (e) {
    // swallow
  }
}

export default null;

// Install a global error handler to capture and log full JS stack traces for runtime errors.
// This helps us find where measureInWindow is being called on an undefined ref.
try {
  // ErrorUtils exists in React Native; guard for environments where it isn't present.
  const globalAny: any = global as any;
  if (globalAny.ErrorUtils && !globalAny.__chatapp_error_handler_installed) {
    const originalHandler = globalAny.ErrorUtils.getGlobalHandler && globalAny.ErrorUtils.getGlobalHandler();
    globalAny.ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
      try {
        // Print a helpful banner and the full stack
        console.error('\n=== ChatApp Global Error ===');
        console.error('Message:', error && error.message);
        console.error('Stack:', error && error.stack);
        console.error('isFatal:', !!isFatal);
        console.error('===========================\n');
      } catch (e) {
        // ignore
      }
      if (typeof originalHandler === 'function') {
        originalHandler(error, isFatal);
      }
    });
    globalAny.__chatapp_error_handler_installed = true;
  }
} catch (e) {
  // ignore
}
