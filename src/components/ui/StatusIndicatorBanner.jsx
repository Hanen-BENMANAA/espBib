import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * StatusIndicatorBanner
 * - does NOT call parent setState during render
 * - calls onDismiss only from event handlers or useEffect (after render)
 * - supports autoHide with a timer
 */
const StatusIndicatorBanner = ({
  type = 'info',
  message = '',
  isVisible = false,
  onDismiss = () => {},
  autoHide = false,
  autoHideDelay = 5000,
  showProgress = false,
  actionLabel = '',
  onAction = () => {}
}) => {
  const [visible, setVisible] = useState(Boolean(isVisible));
  const [progress, setProgress] = useState(0);

  // sync prop -> local state (safe; does not call parent)
  useEffect(() => {
    setVisible(Boolean(isVisible));
  }, [isVisible]);

  // auto-hide effect: schedule onDismiss after delay (runs after render)
  useEffect(() => {
    if (!visible || !autoHide) {
      setProgress(0);
      return;
    }

    let start = Date.now();
    let rafId = null;
    let timerId = null;

    // progress updater using RAF for smooth progress bar if requested
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / autoHideDelay) * 100));
      setProgress(pct);
      if (pct < 100) {
        rafId = requestAnimationFrame(tick);
      }
    };

    // start tick and fallback timeout to ensure dismissal
    rafId = requestAnimationFrame(tick);
    timerId = setTimeout(() => {
      // call onDismiss after the timeout (safe - runs after render)
      setVisible(false);
      setProgress(100);
      try {
        onDismiss(); // parent will handle setShowBanner(false)
      } catch (e) {
        // swallow to avoid unhandled exceptions
        // parent should be robust to being called here
        // console.error('onDismiss error', e);
      }
    }, autoHideDelay);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (timerId) clearTimeout(timerId);
      setProgress(0);
    };
  }, [visible, autoHide, autoHideDelay, onDismiss]);

  // dismiss handler invoked by user action (click)
  const handleDismiss = useCallback(() => {
    setVisible(false); // update internal first (safe)
    try {
      onDismiss(); // run parent's handler (safe - invoked from event handler)
    } catch (e) {
      // ignore
    }
  }, [onDismiss]);

  const handleAction = useCallback(() => {
    try {
      onAction();
    } catch (e) {
      // ignore
    }
  }, [onAction]);

  if (!visible) return null;

  // basic styles: adapt to your design system
  const bg =
    type === 'success' ? 'bg-green-50 border-green-200' :
    type === 'error' ? 'bg-red-50 border-red-200' :
    type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
    'bg-blue-50 border-blue-200';

  return (
    <div className={`border px-4 py-3 rounded ${bg} relative`} role="status" aria-live="polite">
      <div className="flex items-start justify-between space-x-4">
        <div className="flex-1">
          <p className="text-sm text-foreground">{message}</p>
          {actionLabel && (
            <button
              onClick={handleAction}
              className="text-sm text-primary underline mt-2"
              type="button"
            >
              {actionLabel}
            </button>
          )}
        </div>

        <div className="flex items-start space-x-2">
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="text-muted-foreground hover:text-foreground"
            type="button"
          >
            ✕
          </button>
        </div>
      </div>

      {showProgress && (
        <div className="absolute left-0 right-0 bottom-0 h-1 bg-transparent mt-2">
          <div
            style={{ width: `${progress}%`, transition: 'width 120ms linear' }}
            className={`h-1 ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'}`}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};

StatusIndicatorBanner.propTypes = {
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  message: PropTypes.string,
  isVisible: PropTypes.bool,
  onDismiss: PropTypes.func,
  autoHide: PropTypes.bool,
  autoHideDelay: PropTypes.number,
  showProgress: PropTypes.bool,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func
};

export default StatusIndicatorBanner;