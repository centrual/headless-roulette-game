import {RouletteRoundState} from "./RouletteRoundState";

interface RouletteGameState {
  GameId: string;
  CurrentRound: RouletteRoundState | null;
  History: RouletteRoundState[];
}

export type {RouletteGameState};
