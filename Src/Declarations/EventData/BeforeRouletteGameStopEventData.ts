import type {RouletteEventData} from './RouletteEventData';
import {RouletteGame} from "../../RouletteGame";

interface IBeforeRouletteGameStopEventData {
  Session: RouletteGame;
}

type BeforeRouletteGameStopEventData = RouletteEventData<IBeforeRouletteGameStopEventData>;

export type {BeforeRouletteGameStopEventData};
