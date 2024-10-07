"use client";

import FetchDataButton from "@/app/test/FetchDataButton";
import PixiComponent from "@/app/test/PixiComponent";
import PlayerGrid from "@/app/test/PlayerGrid";
import CountdownTimer from "@/components/CountdownTimer";

export default function Test() {
  return (
    <>
      <FetchDataButton />
      <br />
      <PixiComponent />
      <br />
      <PlayerGrid />
      <br />
      <CountdownTimer />
    </>
  );
}
