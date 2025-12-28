"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import "@/styles/not-found.css";

interface DoorState {
  isDragging: boolean;
  rotation: number;
  isManualControl: boolean;
}

const NotFoundPage: React.FC = () => {
  const [leftDoor, setLeftDoor] = useState<DoorState>({
    isDragging: false,
    rotation: 0,
    isManualControl: false,
  });

  const [rightDoor, setRightDoor] = useState<DoorState>({
    isDragging: false,
    rotation: 0,
    isManualControl: false,
  });

  const dragStartRef = useRef<{ x: number; rotation: number } | null>(null);
  const shelfRef = useRef<HTMLElement>(null);

  const handleDoorMouseDown = useCallback(
    (e: React.MouseEvent, door: "left" | "right") => {
      e.preventDefault();
      e.stopPropagation();

      const setState = door === "left" ? setLeftDoor : setRightDoor;
      const currentState = door === "left" ? leftDoor : rightDoor;

      // Get current rotation from computed style if animation is running
      let currentRotation = currentState.rotation;
      if (!currentState.isManualControl) {
        // Use approximate position based on animation timing to avoid jitter
        const now = performance.now();
        if (door === "left") {
          // Left door opens to -110deg after 1s
          currentRotation = -110;
        } else {
          // Right door opens to 120deg after 1.5s
          currentRotation = 120;
        }
      }

      setState((prev) => ({
        ...prev,
        isDragging: true,
        isManualControl: true,
        rotation: currentRotation,
      }));

      dragStartRef.current = {
        x: e.clientX,
        rotation: currentRotation,
      };
    },
    [leftDoor, rightDoor]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragStartRef.current) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      const rotationDelta = deltaX * 0.5; // Sensitivity
      const newRotation = Math.max(
        -120,
        Math.min(120, dragStartRef.current.rotation + rotationDelta)
      );

      if (leftDoor.isDragging) {
        setLeftDoor((prev) => ({ ...prev, rotation: -Math.abs(newRotation) }));
      }
      if (rightDoor.isDragging) {
        setRightDoor((prev) => ({ ...prev, rotation: Math.abs(newRotation) }));
      }
    },
    [leftDoor.isDragging, rightDoor.isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setLeftDoor((prev) => ({ ...prev, isDragging: false }));
    setRightDoor((prev) => ({ ...prev, isDragging: false }));
    dragStartRef.current = null;
  }, []);

  useEffect(() => {
    if (leftDoor.isDragging || rightDoor.isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [
    leftDoor.isDragging,
    rightDoor.isDragging,
    handleMouseMove,
    handleMouseUp,
  ]);

  const getDoorStyle = (door: "left" | "right") => {
    const state = door === "left" ? leftDoor : rightDoor;
    if (state.isManualControl) {
      return {
        transform: `rotateY(${state.rotation}deg)`,
        transformOrigin: door === "left" ? "0 0 0" : "100% 0 0",
      };
    }
    return {};
  };

  const getDoorClasses = (door: "left" | "right") => {
    const state = door === "left" ? leftDoor : rightDoor;
    let classes = `door ${door}`;
    if (state.isDragging) classes += " dragging";
    if (state.isManualControl) classes += " manual-control";
    return classes;
  };

  return (
    <>
      <div className="not-found-container">
        <nav className="shelf" ref={shelfRef}>
          <Link href="/" className="book home-page">
            Trang chủ
          </Link>
          <Link href="/dashboard" className="book about-us">
            Dashboard
          </Link>
          <Link href="/dashboard/student/practice" className="book contact">
            Luyện tập
          </Link>
          <Link href="/dashboard/leaderboard" className="book faq">
            Bảng xếp hạng
          </Link>

          <span className="book not-found"></span>

          <span
            className={getDoorClasses("left")}
            style={getDoorStyle("left")}
            onMouseDown={(e) => handleDoorMouseDown(e, "left")}
          ></span>
          <span
            className={getDoorClasses("right")}
            style={getDoorStyle("right")}
            onMouseDown={(e) => handleDoorMouseDown(e, "right")}
          ></span>
        </nav>

        <h1>Lỗi 404</h1>
        <p>Trang bạn đang tìm kiếm không thể được tìm thấy</p>
      </div>
    </>
  );
};

export default NotFoundPage;
