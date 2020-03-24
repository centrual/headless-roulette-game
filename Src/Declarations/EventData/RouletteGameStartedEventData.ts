import type {RouletteEventData} from './RouletteEventData';
import {RouletteGame} from "../../RouletteGame";

interface IRouletteGameStartedEventData {
  Session: RouletteGame;
}

type RouletteGameStartedEventData = RouletteEventData<IRouletteGameStartedEventData>;

export type {RouletteGameStartedEventData};
