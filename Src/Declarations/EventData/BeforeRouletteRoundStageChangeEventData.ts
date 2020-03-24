import type {RouletteRound} from "../../RouletteRound";
import type {RouletteEventData} from './RouletteEventData';

interface IBeforeRouletteRoundStageChangeEventData {
  Round: RouletteRound;
}

type BeforeRouletteRoundStageChangeEventData = RouletteEventData<IBeforeRouletteRoundStageChangeEventData>;

export type {BeforeRouletteRoundStageChangeEventData};
