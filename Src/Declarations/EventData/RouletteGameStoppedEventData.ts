import type {RouletteEventData} from './RouletteEventData';
import {RouletteGame} from "../../RouletteGame";

interface IRouletteGameStoppedEventData {
  Session: RouletteGame;
}

type RouletteGameStoppedEventData = RouletteEventData<IRouletteGameStoppedEventData>;

export type {RouletteGameStoppedEventData};
