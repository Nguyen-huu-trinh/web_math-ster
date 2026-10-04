"use client";

import { useEffect, useState } from "react";

const GRACE_SECONDS = 30;

export function useFullscreenGrace(enabled: boolean, attemptId: string) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [submitFailed, setSubmitFailed] = useState(false);

  useEffect(() => {
    setSecondsLeft(null);
    setSubmitFailed(false);
    if (!enabled) return;

    let deadline: number | null = null;
    let timer: number | undefined;
    let expired = false;
    let stopped = false;

    function clearTimer() {
      if (timer !== undefined) window.clearInterval(timer);
      timer = undefined;
    }

    function expireIfDue() {
      if (deadline === null || Date.now() < deadline) return false;
      expired = true;
      deadline = null;
      clearTimer();
      setSecondsLeft(0);
      setSubmitFailed(false);
      window.dispatchEvent(new Event("force-submit"));
      return true;
    }

    function updateCountdown() {
      if (stopped || expired || deadline === null || expireIfDue()) return;
      setSecondsLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    }

    function handleFullscreenChange() {
      if (stopped || expired || expireIfDue()) return;
      if (document.fullscreenElement) {
        deadline = null;
        clearTimer();
        setSecondsLeft(null);
        return;
      }
      // Repeated browser events must not restart the grace period.
      if (deadline !== null) return;
      deadline = Date.now() + GRACE_SECONDS * 1000;
      setSecondsLeft(GRACE_SECONDS);
      setSubmitFailed(false);
      timer = window.setInterval(updateCountdown, 250);
    }

    function handleSubmitSuccess() {
      stopped = true;
      deadline = null;
      clearTimer();
      setSecondsLeft(null);
      setSubmitFailed(false);
    }

    function handleSubmitError() {
      if (expired && !stopped) setSubmitFailed(true);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    // Check the absolute deadline immediately after a throttled/background tab returns.
    document.addEventListener("visibilitychange", updateCountdown);
    window.addEventListener("focus", updateCountdown);
    window.addEventListener("submit-success", handleSubmitSuccess);
    window.addEventListener("submit-error", handleSubmitError);

    return () => {
      stopped = true;
      clearTimer();
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", updateCountdown);
      window.removeEventListener("focus", updateCountdown);
      window.removeEventListener("submit-success", handleSubmitSuccess);
      window.removeEventListener("submit-error", handleSubmitError);
    };
  }, [enabled, attemptId]);

  function retrySubmit() {
    if (secondsLeft !== 0 || !submitFailed) return;
    setSubmitFailed(false);
    window.dispatchEvent(new Event("force-submit"));
  }

  return { secondsLeft, submitFailed, retrySubmit };
}
