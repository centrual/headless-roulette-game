import {ERouletteRoundStage} from "../Enums/ERouletteRoundStage";
import {RouletteGameOptions} from "../RouletteGameOptions";

interface RouletteRoundState {
  GameOptions: RouletteGameOptions;
  RoundId: string;
  RoundStage: ERouletteRoundStage;
  Hash: string;
  Secret: string;
  LuckyNumber: number;
}

export type {RouletteRoundState};
