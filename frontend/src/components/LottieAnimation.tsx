import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import lottie, { AnimationItem } from "lottie-web";
import animationData from "../assets/animation/face-animation.json";

const LottieAnimation = forwardRef((props, ref) => {
  const animationContainer = useRef<HTMLDivElement>(null);
  const animationInstance = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (animationContainer.current) {
      animationInstance.current = lottie.loadAnimation({
        container: animationContainer.current,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData,
      });
    }

    return () => {
      animationInstance.current?.destroy();
    };
  }, []);

  const playPart = (
    startFrame: number,
    endFrame: number,
    step2?: boolean,
    greenColor?: boolean
  ) => {
    if (animationContainer.current) {
      animationContainer.current.style.transform = step2
        ? "scale(1.2)"
        : "scale(1)";
      animationContainer.current.style.transition = "transform 0.3s ease";

      animationContainer.current.style.filter = greenColor
        ? "hue-rotate(-60deg)"
        : "none";
      if (step2) {
        animationContainer.current?.classList.add("pulse");
      } else {
        animationContainer.current?.classList.remove("pulse");
      }
    }

    animationInstance.current?.playSegments([startFrame, endFrame], true);
  };

  const handleStep2 = () => {
    playPart(75, 84, true);
  };

  const handleStep3 = () => {
    playPart(107, 150, false);
  };

  const handleReverse2 = () => {
    playPart(83, 70);
  };

  // Expose methods to the parent
  useImperativeHandle(ref, () => ({
    handleStep2,
    handleStep3,
    handleReverse2,
  }));

  return (
    <div>
      <div
        ref={animationContainer}
        style={{ width: 100, height: 100, transition: "transform 0.3s ease" }}
        className="m-4"
      ></div>
    </div>
  );
});

export default LottieAnimation;
