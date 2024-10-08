"use client";
import serverUrl from "@/utils/config";
import { useState } from "react";
import CreateGame from "./CreateGame";
import JoinGame from "./JoinGame";
import ButtonStandard from "@/components/ButtonStandard";

export default function GameDashboard() {
  const [showComponent, setShowComponent] = useState<"join" | null>(null);

  return (
    <div>
      <div style={{ display: "inline-flex", alignItems: "center" }}>
        <CreateGame />
        <ButtonStandard
          onButtonClick={() => setShowComponent("join")}
          buttonName={"Join Game"}
        />
      </div>
      <h1 className="text-2xl mb-4 text-center">
        Welcome to the Game!
      </h1>
      <p className="text-center">Server URL: {serverUrl}</p>

      <div className="mt-4">{showComponent === "join" && <JoinGame />}</div>
    </div>
  );
}
