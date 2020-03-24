import type {RouletteEventData} from './RouletteEventData';
import {RouletteGame} from "../../RouletteGame";

interface IBeforeRouletteGameStartEventData {
  Session: RouletteGame;
}

type BeforeRouletteGameStartEventData = RouletteEventData<IBeforeRouletteGameStartEventData>;

export type {BeforeRouletteGameStartEventData};
