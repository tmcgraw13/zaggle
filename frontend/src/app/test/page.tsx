"use client";

import FetchDataButton from "@/components/FetchDataButton";
import PixiComponent from "@/components/PixiComponent";
import PlayerGrid from "@/components/PlayerGrid";

export default function Test() {
  return (
    <>
      <FetchDataButton />
      <br />
      <PixiComponent />
      <br />
      <PlayerGrid />
    </>
  );
}
