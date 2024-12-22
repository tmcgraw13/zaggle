"use client";

import FetchDataButton from "@/app/test/FetchDataButton";
import PixiComponent from "@/app/test/PixiComponent";
import PlayerGrid from "@/app/test/PlayerGrid";
import CountdownTimer from "@/components/CountdownTimer";
import AntComponent from "./AntComponent";

export default function Test() {
  return (
    <>
      <FetchDataButton />
      <br />
      <PixiComponent />
      <br />
      <AntComponent/>
      <br />
      <PlayerGrid />
      <br />
      <CountdownTimer startTime={undefined} />
      <a href="https://www.youtube.com/watch?v=k1eSUsaIugE"> The Bunny</a>
    </>
  );
}
