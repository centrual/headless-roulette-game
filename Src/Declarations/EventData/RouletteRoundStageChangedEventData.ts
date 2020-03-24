import type {RouletteRound} from "../../RouletteRound";
import type {RouletteEventData} from './RouletteEventData';
import {ERouletteRoundStage} from "../Enums/ERouletteRoundStage";

interface IRouletteRoundStageChangedEventData {
  PreviousStage: ERouletteRoundStage;
  Round: RouletteRound;
}

type RouletteRoundStageChangedEventData = RouletteEventData<IRouletteRoundStageChangedEventData>;

export type {RouletteRoundStageChangedEventData};
