"use client";
import React, { useRef, useEffect, Children, cloneElement } from 'react';
import { MouseEvent, ActivationMode, ActivationConditions } from 'cedar-os';

// Touch gesture configuration
interface TouchGestureConfig {
  doubleTapDelay?: number;
  tripleTapDelay?: number;
  longPressDelay?: number;
  tapThreshold?: number; // Max movement allowed for tap
}

interface TouchGestureMapping {
  doubleTap?: MouseEvent;
  tripleTap?: MouseEvent;
  longPress?: MouseEvent;
  singleTap?: MouseEvent;
}

interface TouchEnabledWrapperProps {
  children: React.ReactElement;
  touchMapping?: TouchGestureMapping;
  touchConfig?: TouchGestureConfig;
}

interface TouchState {
  tapCount: number;
  startTime: number;
  startPos: { x: number; y: number };
  isLongPress: boolean;
}

export function TouchEnabledWrapper({
  children,
  touchMapping = {
    doubleTap: MouseEvent.DOUBLE_CLICK,
    longPress: MouseEvent.RIGHT_CLICK,
    tripleTap: MouseEvent.MIDDLE_CLICK,
  },
  touchConfig = {
    doubleTapDelay: 300,
    tripleTapDelay: 400,
    longPressDelay: 500,
    tapThreshold: 10
  }
}: TouchEnabledWrapperProps) {
  const touchState = useRef<TouchState>({
    tapCount: 0,
    startTime: 0,
    startPos: { x: 0, y: 0 },
    isLongPress: false
  });

  const tapTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLElement>(null);

  const clearTimers = () => {
    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
      tapTimer.current = null;
    }
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const resetTouchState = () => {
    touchState.current.tapCount = 0;
    touchState.current.isLongPress = false;
  };

  const triggerMouseEvent = (eventType: MouseEvent, originalEvent: TouchEvent | MouseEvent) => {
    if (!elementRef.current) return;

    // Create a synthetic mouse event that cedar-os can understand
    const syntheticEvent = new CustomEvent('cedar-touch-event', {
      detail: {
        mouseEvent: eventType,
        originalEvent,
        position: {
          x: 'touches' in originalEvent ? originalEvent.touches[0]?.clientX : (originalEvent as MouseEvent).clientX,
          y: 'touches' in originalEvent ? originalEvent.touches[0]?.clientY : (originalEvent as MouseEvent).clientY,
        }
      }
    });

    elementRef.current.dispatchEvent(syntheticEvent);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchState.current.startTime = Date.now();
    touchState.current.startPos = { x: touch.clientX, y: touch.clientY };
    touchState.current.isLongPress = false;
    touchState.current.tapCount++;

    clearTimers();

    // Start long press timer
    if (touchMapping.longPress) {
      longPressTimer.current = setTimeout(() => {
        touchState.current.isLongPress = true;
        triggerMouseEvent(touchMapping.longPress!, e.nativeEvent);
      }, touchConfig.longPressDelay);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const endPos = { x: touch.clientX, y: touch.clientY };

    clearTimers();

    // If it was a long press, don't process tap events
    if (touchState.current.isLongPress) {
      resetTouchState();
      return;
    }

    // Check if touch moved too much (not a tap)
    const deltaX = endPos.x - touchState.current.startPos.x;
    const deltaY = endPos.y - touchState.current.startPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > touchConfig.tapThreshold!) {
      resetTouchState();
      return;
    }

    // Handle tap events with delay to detect multiple taps
    const delay = touchState.current.tapCount <= 2 ? touchConfig.doubleTapDelay : touchConfig.tripleTapDelay;

    tapTimer.current = setTimeout(() => {
      switch (touchState.current.tapCount) {
        case 1:
          if (touchMapping.singleTap) {
            triggerMouseEvent(touchMapping.singleTap, e.nativeEvent);
          }
          break;
        case 2:
          if (touchMapping.doubleTap) {
            triggerMouseEvent(touchMapping.doubleTap, e.nativeEvent);
          }
          break;
        case 3:
          if (touchMapping.tripleTap) {
            triggerMouseEvent(touchMapping.tripleTap, e.nativeEvent);
          }
          break;
      }
      resetTouchState();
    }, delay);
  };

  const handleTouchCancel = () => {
    clearTimers();
    resetTouchState();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  // Clone the child element and add touch event handlers
  const childWithTouchHandlers = cloneElement(children, {
    ref: (ref: any) => {
      elementRef.current = ref;
      // If the child had a ref, preserve it
      if (typeof children.ref === 'function') {
        children.ref(ref);
      } else if (children.ref) {
        (children.ref as any).current = ref;
      }
    },
    onTouchStart: (e: React.TouchEvent) => {
      handleTouchStart(e);
      // Call original onTouchStart if it exists
      if (children.props.onTouchStart) {
        children.props.onTouchStart(e);
      }
    },
    onTouchEnd: (e: React.TouchEvent) => {
      handleTouchEnd(e);
      // Call original onTouchEnd if it exists
      if (children.props.onTouchEnd) {
        children.props.onTouchEnd(e);
      }
    },
    onTouchCancel: (e: React.TouchEvent) => {
      handleTouchCancel();
      // Call original onTouchCancel if it exists
      if (children.props.onTouchCancel) {
        children.props.onTouchCancel(e);
      }
    },
    style: {
      ...children.props.style,
      touchAction: 'manipulation', // Improve touch responsiveness
      userSelect: 'none', // Prevent text selection on touch
    }
  });

  return childWithTouchHandlers;
}

// Hook for easier integration with existing components
export function useTouchGestures(
  touchMapping: TouchGestureMapping = {
    doubleTap: MouseEvent.DOUBLE_CLICK,
    longPress: MouseEvent.RIGHT_CLICK,
  },
  touchConfig: TouchGestureConfig = {}
) {
  const touchState = useRef<TouchState>({
    tapCount: 0,
    startTime: 0,
    startPos: { x: 0, y: 0 },
    isLongPress: false
  });

  const tapTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const config = {
    doubleTapDelay: 300,
    tripleTapDelay: 400,
    longPressDelay: 500,
    tapThreshold: 10,
    ...touchConfig
  };

  const clearTimers = () => {
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    tapTimer.current = null;
    longPressTimer.current = null;
  };

  const resetTouchState = () => {
    touchState.current.tapCount = 0;
    touchState.current.isLongPress = false;
  };

  // Return event handlers that can be spread onto any element
  return {
    onTouchStart: (e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchState.current.startTime = Date.now();
      touchState.current.startPos = { x: touch.clientX, y: touch.clientY };
      touchState.current.isLongPress = false;
      touchState.current.tapCount++;

      clearTimers();

      if (touchMapping.longPress) {
        longPressTimer.current = setTimeout(() => {
          touchState.current.isLongPress = true;
          // Trigger a synthetic mouse event
          const syntheticMouseEvent = {
            ...e,
            button: touchMapping.longPress === MouseEvent.RIGHT_CLICK ? 2 : 0,
            type: touchMapping.longPress === MouseEvent.RIGHT_CLICK ? 'contextmenu' : 'click'
          };

          // Dispatch the appropriate event
          if (touchMapping.longPress === MouseEvent.RIGHT_CLICK) {
            e.currentTarget.dispatchEvent(new MouseEvent('contextmenu', {
              bubbles: true,
              cancelable: true,
              clientX: touch.clientX,
              clientY: touch.clientY,
            }));
          }
        }, config.longPressDelay);
      }
    },

    onTouchEnd: (e: React.TouchEvent) => {
      const touch = e.changedTouches[0];
      const endPos = { x: touch.clientX, y: touch.clientY };

      clearTimers();

      if (touchState.current.isLongPress) {
        resetTouchState();
        return;
      }

      // Check movement threshold
      const deltaX = endPos.x - touchState.current.startPos.x;
      const deltaY = endPos.y - touchState.current.startPos.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > config.tapThreshold) {
        resetTouchState();
        return;
      }

      // Handle taps
      const delay = touchState.current.tapCount <= 2 ? config.doubleTapDelay : config.tripleTapDelay;

      tapTimer.current = setTimeout(() => {
        const tapCount = touchState.current.tapCount;

        if (tapCount === 2 && touchMapping.doubleTap) {
          // Trigger double-click event
          e.currentTarget.dispatchEvent(new MouseEvent('dblclick', {
            bubbles: true,
            cancelable: true,
            clientX: touch.clientX,
            clientY: touch.clientY,
          }));
        } else if (tapCount === 3 && touchMapping.tripleTap) {
          // Trigger middle-click or custom event for triple tap
          e.currentTarget.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            clientX: touch.clientX,
            clientY: touch.clientY,
            button: 1, // Middle button
          }));
        }

        resetTouchState();
      }, delay);
    },

    onTouchCancel: () => {
      clearTimers();
      resetTouchState();
    },

    cleanup: () => {
      clearTimers();
      resetTouchState();
    }
  };
}

export default TouchEnabledWrapper;
