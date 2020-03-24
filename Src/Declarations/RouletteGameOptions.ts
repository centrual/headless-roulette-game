import {RouletteRoundStageDurations} from "./RouletteRoundStageDurations";
import {ERoundHashAlgorithm} from "./Enums/ERoundHashAlgorithm";

interface RouletteGameOptions {
  AutoStartNewRound: boolean;
  AutoMakeNewRound: boolean;
  MaxHistoryItems: number;
  MinLuckyNumber: number;
  MaxLuckyNumber: number;
  RoundHashAlgorithm: ERoundHashAlgorithm;
  RoundSecretLength: number;
  RoundStageDurations: RouletteRoundStageDurations;
  ImmediatelyJumpToTheNextStageWhenTheGameStarts: boolean;
}

export type {RouletteGameOptions};
