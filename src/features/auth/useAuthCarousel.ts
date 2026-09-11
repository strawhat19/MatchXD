import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Easing, Platform, Animated, PanResponder, AccessibilityInfo, type LayoutChangeEvent, type ViewStyle } from 'react-native';

export const useAuthCarousel = (count: number, enabled: boolean) => {
  const position = useRef(1);
  const dragging = useRef(false);
  const settling = useRef(false);
  const generation = useRef(0);
  const animation = useRef<Animated.CompositeAnimation | null>(null);
  const [translation] = useState(() => new Animated.Value(0));
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const [grabbed, setGrabbed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReducedMotion(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener(`reduceMotionChanged`, setReducedMotion);
    return () => { mounted = false; subscription.remove(); };
  }, []);
  useEffect(() => () => { generation.current++; animation.current?.stop(); }, []);
  useEffect(() => {
    if (enabled) return;
    generation.current++;
    animation.current?.stop();
    dragging.current = false;
    settling.current = false;
    translation.setValue(-position.current * width);
  }, [enabled, width, translation]);

  const animateTo = useCallback((next: number) => {
    if (!width || settling.current) return;
    const operation = ++generation.current;
    settling.current = true;
    animation.current = Animated.timing(translation, { toValue: -next * width, duration: reducedMotion ? 0 : 420, easing: Easing.out(Easing.cubic), isInteraction: false, useNativeDriver: Platform.OS !== `web` });
    animation.current.start(({ finished }) => {
      if (operation !== generation.current) return;
      settling.current = false;
      if (!finished) { translation.setValue(-position.current * width); return; }
      const wrapped = next === 0 ? count : next === count + 1 ? 1 : next;
      position.current = wrapped;
      translation.setValue(-wrapped * width);
      setIndex(wrapped - 1);
    });
  }, [count, width, reducedMotion, translation]);
  useEffect(() => {
    if (!enabled || !width) return;
    const timer = setInterval(() => { if (!dragging.current && !settling.current) animateTo(position.current + 1); }, 7500);
    return () => clearInterval(timer);
  }, [enabled, width, animateTo]);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (!nextWidth) return;
    generation.current++;
    animation.current?.stop();
    dragging.current = false;
    settling.current = false;
    setGrabbed(false);
    translation.setValue(-position.current * nextWidth);
    setWidth(nextWidth);
  }, [translation]);
  const showSlide = useCallback((next: number) => {
    if (dragging.current || settling.current) return;
    const current = position.current - 1;
    if (next === current) return;
    animateTo(next < 0 ? 0 : next >= count ? count + 1 : next + 1);
  }, [count, animateTo]);
  // PanResponder stores these callbacks; gesture events read the refs after render.
  // eslint-disable-next-line react-hooks/refs
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gesture) => !settling.current && gesture.numberActiveTouches === 1 && Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.25,
    onPanResponderGrant: () => { dragging.current = true; setGrabbed(true); },
    onPanResponderMove: (_, gesture) => { if (dragging.current) translation.setValue(-position.current * width + Math.max(-width, Math.min(width, gesture.dx))); },
    onPanResponderRelease: (_, gesture) => {
      if (!dragging.current) return;
      dragging.current = false;
      setGrabbed(false);
      const advance = Math.abs(gesture.dx) > width * .18 || (Math.abs(gesture.dx) > 12 && Math.abs(gesture.vx) > .5);
      animateTo(position.current + (advance ? gesture.dx < 0 ? 1 : -1 : 0));
    },
    onPanResponderTerminate: () => { if (!dragging.current) return; dragging.current = false; setGrabbed(false); animateTo(position.current); },
    onPanResponderTerminationRequest: () => true,
  }), [width, animateTo, translation]);
  const webStyle = Platform.OS === `web` ? { cursor: grabbed ? `grabbing` : `grab`, touchAction: `pan-y`, userSelect: `none` } as unknown as ViewStyle : undefined;
  return { index, width, onLayout, showSlide, webStyle, reducedMotion, panHandlers: responder.panHandlers, railStyle: { width: width * (count + 2), flexDirection: `row` as const, transform: [{ translateX: translation }] } };
};
