"use client";
import React, { useRef, useEffect, cloneElement } from 'react';
import { MouseEvent } from 'cedar-os';

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
  children: React.ReactElement<any>;
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

  const triggerMouseEvent = (eventType: string, clientX: number, clientY: number, button: number = 0) => {
    if (!elementRef.current) return;

    const mouseEvent = new window.MouseEvent(eventType, {
      bubbles: true,
      cancelable: true,
      clientX,
      clientY,
      button,
      buttons: button === 0 ? 1 : button === 2 ? 2 : 4, // Left, right, or middle button
    });

    elementRef.current.dispatchEvent(mouseEvent);
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
        // Trigger mousedown for hold behavior (like right-click and hold)
        const button = touchMapping.longPress === MouseEvent.RIGHT_CLICK ? 2 : 0;
        triggerMouseEvent('mousedown', touch.clientX, touch.clientY, button);

        // Also trigger contextmenu if it's a right-click mapping
        if (touchMapping.longPress === MouseEvent.RIGHT_CLICK) {
          triggerMouseEvent('contextmenu', touch.clientX, touch.clientY, button);
        }
      }, touchConfig.longPressDelay);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];

    // During long press, emit mousemove events to enable radial menu highlighting
    if (touchState.current.isLongPress) {
      triggerMouseEvent('mousemove', touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const endPos = { x: touch.clientX, y: touch.clientY };

    clearTimers();

    // If it was a long press, trigger mouseup to end the drag operation
    if (touchState.current.isLongPress) {
      const button = touchMapping.longPress === MouseEvent.RIGHT_CLICK ? 2 : 0;
      triggerMouseEvent('mouseup', touch.clientX, touch.clientY, button);
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
            triggerMouseEvent('click', touch.clientX, touch.clientY);
          }
          break;
        case 2:
          if (touchMapping.doubleTap) {
            const eventType = touchMapping.doubleTap === MouseEvent.DOUBLE_CLICK ? 'dblclick' : 'click';
            triggerMouseEvent(eventType, touch.clientX, touch.clientY);
          }
          break;
        case 3:
          if (touchMapping.tripleTap) {
            const eventType = 'click';
            const button = touchMapping.tripleTap === MouseEvent.MIDDLE_CLICK ? 1 : 0;
            triggerMouseEvent(eventType, touch.clientX, touch.clientY, button);
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
    ...children.props,
    ref: (ref: any) => {
      elementRef.current = ref;
      // If the child had a ref, preserve it
      const originalRef = (children as any).ref;
      if (typeof originalRef === 'function') {
        originalRef(ref);
      } else if (originalRef) {
        (originalRef as any).current = ref;
      }
    },
    onTouchStart: (e: React.TouchEvent) => {
      handleTouchStart(e);
      // Call original onTouchStart if it exists
      if ((children.props as any).onTouchStart) {
        (children.props as any).onTouchStart(e);
      }
    },
    onTouchMove: (e: React.TouchEvent) => {
      handleTouchMove(e);
      // Call original onTouchMove if it exists
      if ((children.props as any).onTouchMove) {
        (children.props as any).onTouchMove(e);
      }
    },
    onTouchEnd: (e: React.TouchEvent) => {
      handleTouchEnd(e);
      // Call original onTouchEnd if it exists
      if ((children.props as any).onTouchEnd) {
        (children.props as any).onTouchEnd(e);
      }
    },
    onTouchCancel: (e: React.TouchEvent) => {
      handleTouchCancel();
      // Call original onTouchCancel if it exists
      if ((children.props as any).onTouchCancel) {
        (children.props as any).onTouchCancel(e);
      }
    },
    style: {
      ...(children.props as any).style,
      touchAction: 'none', // Prevent default touch behaviors during drag
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

          // Trigger mousedown for long press start
          const button = touchMapping.longPress === MouseEvent.RIGHT_CLICK ? 2 : 0;
          e.currentTarget.dispatchEvent(new window.MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            clientX: touch.clientX,
            clientY: touch.clientY,
            button,
            buttons: button === 0 ? 1 : button === 2 ? 2 : 4,
          }));

          // Also trigger contextmenu if it's a right-click mapping
          if (touchMapping.longPress === MouseEvent.RIGHT_CLICK) {
            e.currentTarget.dispatchEvent(new window.MouseEvent('contextmenu', {
              bubbles: true,
              cancelable: true,
              clientX: touch.clientX,
              clientY: touch.clientY,
            }));
          }
        }, config.longPressDelay);
      }
    },

    onTouchMove: (e: React.TouchEvent) => {
      const touch = e.touches[0];

      // During long press, emit mousemove events to enable radial menu highlighting
      if (touchState.current.isLongPress) {
        e.currentTarget.dispatchEvent(new window.MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          clientX: touch.clientX,
          clientY: touch.clientY,
        }));
      }
    },

    onTouchEnd: (e: React.TouchEvent) => {
      const touch = e.changedTouches[0];
      const endPos = { x: touch.clientX, y: touch.clientY };

      clearTimers();

      if (touchState.current.isLongPress) {
        // Trigger mouseup to end the drag operation
        const button = touchMapping.longPress === MouseEvent.RIGHT_CLICK ? 2 : 0;
        e.currentTarget.dispatchEvent(new window.MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          clientX: touch.clientX,
          clientY: touch.clientY,
          button,
          buttons: button === 0 ? 1 : button === 2 ? 2 : 4,
        }));
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
          e.currentTarget.dispatchEvent(new window.MouseEvent('dblclick', {
            bubbles: true,
            cancelable: true,
            clientX: touch.clientX,
            clientY: touch.clientY,
          }));
        } else if (tapCount === 3 && touchMapping.tripleTap) {
          // Trigger middle-click or custom event for triple tap
          e.currentTarget.dispatchEvent(new window.MouseEvent('click', {
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
