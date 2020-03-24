import type {RouletteRoundStageChangedEventData} from "./Declarations/EventData/RouletteRoundStageChangedEventData";
import type {RouletteGameOptions} from "./Declarations/RouletteGameOptions";
import type {RouletteRoundStageDurations} from "./Declarations/RouletteRoundStageDurations";
import type {RouletteGameState} from "./Declarations/States/RouletteGameState";
import type {BeforeRouletteRoundStageChangeEventData} from "./Declarations/EventData/BeforeRouletteRoundStageChangeEventData";
import type {RouletteGameStoppedEventData} from "./Declarations/EventData/RouletteGameStoppedEventData";
import type {BeforeRouletteGameStopEventData} from "./Declarations/EventData/BeforeRouletteGameStopEventData";
import type {RouletteGameStartedEventData} from "./Declarations/EventData/RouletteGameStartedEventData";
import type {BeforeRouletteGameStartEventData} from "./Declarations/EventData/BeforeRouletteGameStartEventData";

import {ERouletteRoundStage} from "./Declarations/Enums/ERouletteRoundStage";
import {ERoundHashAlgorithm} from "./Declarations/Enums/ERoundHashAlgorithm";
import {ERouletteEventName} from "./Declarations/Enums/ERouletteEventName";

import {RoundNotFoundException} from "./Exceptions/RoundNotFoundException";

import {EventEmitter2} from 'eventemitter2';
import {RouletteRound} from "./RouletteRound";
import {v4 as uuidv4} from 'uuid';

export class RouletteGame extends EventEmitter2 {
  public static readonly DefaultRouletteRoundStageDurations: RouletteRoundStageDurations = {
    OpenForBettingDuration: 20000,
    ClosedForBettingInfoDuration: 3000,
    RollDuration: 7000,
    FinishedInfoDuration: 3000
  };
  public static readonly DefaultRouletteGameOptions: RouletteGameOptions = {
    AutoStartNewRound: true,
    AutoMakeNewRound: true,
    MaxHistoryItems: 10,
    MinLuckyNumber: 0,
    MaxLuckyNumber: 14,
    RoundSecretLength: 32,
    RoundHashAlgorithm: ERoundHashAlgorithm.SHA224,
    RoundStageDurations: RouletteGame.DefaultRouletteRoundStageDurations,
    ImmediatelyJumpToTheNextStageWhenTheGameStarts: false
  };

  #IsRunning: boolean;
  #IsTheRoundWaitingToEndTheGame: boolean;

  #Id: string;
  #Options: RouletteGameOptions;
  #CurrentRound: RouletteRound | null;
  #History: RouletteRound[];

  constructor(Options?: Partial<RouletteGameOptions>, Id?: string, LastGameState?: RouletteGameState | string) {
    super({wildcard: true});

    this.#Id = '';
    this.#IsRunning = false;
    this.#IsTheRoundWaitingToEndTheGame = false;
    this.#Options = {...RouletteGame.DefaultRouletteGameOptions, ...Options};
    this.#CurrentRound = null;
    this.#History = [];

    if (typeof LastGameState !== 'undefined') {
      this.LoadLastGameState(LastGameState);
    } else {
      this.#Id = uuidv4();
    }
  }


  public get Id(): string {
    return this.#Id;
  }

  public get IsRunning(): boolean {
    return this.#IsRunning;
  }

  public get IsTheRoundWaitingToEndTheGame(): boolean {
    return this.#IsTheRoundWaitingToEndTheGame;
  }

  public get Options(): RouletteGameOptions {
    return this.#Options;
  }

  public get CurrentRound(): RouletteRound | null {
    return this.#CurrentRound;
  }

  public get State(): RouletteGameState {
    return {
      GameId: this.Id,
      CurrentRound: this.#CurrentRound?.State ?? null,
      History: this.History.map(historyItem => {
        return {
          Hash: historyItem.Hash,
          RoundId: historyItem.Id,
          GameOptions: historyItem.Options,
          RoundStage: historyItem.Stage,
          Secret: historyItem.Secret,
          LuckyNumber: historyItem.LuckyNumber
        }
      })
    };
  }

  public get StateAsString(): string {
    return JSON.stringify(this.State);
  }

  public get History(): RouletteRound[] {
    return this.#History;
  }


  private LoadLastGameState(LastGameState: RouletteGameState | string) {
    let GameState: RouletteGameState;

    if (typeof LastGameState === 'string') {
      GameState = JSON.parse(LastGameState);
    } else {
      GameState = LastGameState;
    }

    this.#Id = GameState.GameId;
    this.#CurrentRound = new RouletteRound(this.Options, GameState.CurrentRound);
    this.#CurrentRound.on(ERouletteEventName.BeforeRoundStageChange, this.OnBeforeRoundStageChange.bind(this));
    this.#CurrentRound.on(ERouletteEventName.RoundStageChanged, this.OnRoundStageChanged.bind(this));

    this.AddToHistory(GameState.History.map(historyItem => new RouletteRound(this.Options, historyItem)));
  }

  private OnBeforeRoundStageChange(EventData: BeforeRouletteRoundStageChangeEventData) {
    this.TriggerBeforeRoundStageChangeEvent(EventData);
  }

  private OnRoundStageChanged(EventData: RouletteRoundStageChangedEventData) {
    this.TriggerRoundStageChangedEvent(EventData);

    if (this.IsRunning && !this.IsTheRoundWaitingToEndTheGame && this.Options.AutoMakeNewRound && EventData.Data.Round.IsFinishedOrCancelled) {
      this.MakeNewRound();

      if( this.Options.AutoStartNewRound ) {
        this.CurrentRound!.Start()
      }
    }

    if (this.IsTheRoundWaitingToEndTheGame && EventData.Data.Round.IsFinishedOrCancelled) {
      this.Stop();
    }
  }


  private TriggerBeforeGameStopEvent() {
    const EventName = ERouletteEventName.BeforeGameStop;

    const EventData: BeforeRouletteGameStopEventData = {
      Name: EventName,
      Data: {
        Session: this
      }
    };

    this.emit(EventName, EventData);
  }

  private TriggerGameStoppedEvent() {
    const EventName = ERouletteEventName.GameStopped;

    const EventData: RouletteGameStoppedEventData = {
      Name: EventName,
      Data: {
        Session: this
      }
    };

    this.emit(EventName, EventData);
  }

  private TriggerBeforeGameStartEvent() {
    const EventName = ERouletteEventName.BeforeGameStart;

    const EventData: BeforeRouletteGameStartEventData = {
      Name: EventName,
      Data: {
        Session: this
      }
    };

    this.emit(EventName, EventData);
  }

  private TriggerGameStartedEvent() {
    const EventName = ERouletteEventName.GameStarted;

    const EventData: RouletteGameStartedEventData = {
      Name: EventName,
      Data: {
        Session: this
      }
    };

    this.emit(EventName, EventData);
  }

  private TriggerBeforeRoundStageChangeEvent(EventData: BeforeRouletteRoundStageChangeEventData) {
    this.emit(ERouletteEventName.BeforeRoundStageChange, EventData);
  }

  private TriggerRoundStageChangedEvent(EventData: RouletteRoundStageChangedEventData) {
    this.emit(ERouletteEventName.RoundStageChanged, EventData);
  }


  public AddToHistory(Round: RouletteRound): void;
  public AddToHistory(Rounds: RouletteRound[]): void;
  public AddToHistory(Rounds: RouletteRound | RouletteRound[]) {
    let NewHistory: RouletteRound[];

    if (Rounds instanceof RouletteRound) {
      NewHistory = [...this.#History, Rounds];
    } else {
      NewHistory = [...this.#History, ...Rounds];
    }

    if (this.Options.MaxHistoryItems > 0 && NewHistory.length > this.Options.MaxHistoryItems) {
      NewHistory = NewHistory.slice(NewHistory.length - this.Options.MaxHistoryItems, NewHistory.length);
    }

    this.#History = NewHistory;
  }

  public MakeNewRound() {
    if (this.CurrentRound !== null) {
      if (this.CurrentRound.Stage !== ERouletteRoundStage.Finished) {
        this.CurrentRound.Cancel();
      }

      this.AddToHistory(this.CurrentRound);
    }

    const Round = new RouletteRound(this.Options);
    Round.on(ERouletteEventName.BeforeRoundStageChange, this.OnBeforeRoundStageChange.bind(this));
    Round.on(ERouletteEventName.RoundStageChanged, this.OnRoundStageChanged.bind(this));
    this.#CurrentRound = Round;
  }

  public SetOptions(NewOptions: Partial<RouletteGameOptions>) {
    this.#Options = {...RouletteGame.DefaultRouletteGameOptions, ...NewOptions};
  }

  public Start() {
    if (this.IsRunning) {
      return;
    }

    this.TriggerBeforeGameStartEvent();

    this.#IsRunning = true;

    if (this.CurrentRound === null && !this.Options.AutoMakeNewRound) {
      throw new RoundNotFoundException();
    } else if (this.Options.AutoMakeNewRound) {
      this.MakeNewRound();
    }

    if (this.Options.AutoStartNewRound) {
      this.CurrentRound!.Start();
    }

    this.TriggerGameStartedEvent();
  }

  public Stop(WaitForTheCurrentRoundToFinish: boolean = true) {
    if (!this.IsRunning) {
      return;
    }

    if (this.CurrentRound === null) {
      this.TriggerBeforeGameStopEvent();
      this.#IsRunning = false;
      this.TriggerGameStoppedEvent();
      return;
    }

    if (this.CurrentRound.IsFinishedOrCancelled || !WaitForTheCurrentRoundToFinish) {
      this.TriggerBeforeGameStopEvent();

      this.#IsTheRoundWaitingToEndTheGame = false;
      this.#IsRunning = false;

      if (!this.CurrentRound.IsFinishedOrCancelled) {
        this.CurrentRound.Cancel();
      }

      this.TriggerGameStoppedEvent();
    } else {
      this.#IsTheRoundWaitingToEndTheGame = true;
    }
  }
}
