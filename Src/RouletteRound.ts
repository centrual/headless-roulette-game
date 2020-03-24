import type {RouletteGameOptions} from "./Declarations/RouletteGameOptions";
import type {RouletteStageMapItem} from "./Declarations/RouletteStageMapItem";
import type {RouletteRoundState} from "./Declarations/States/RouletteRoundState";
import type {RouletteRoundStageChangedEventData} from "./Declarations/EventData/RouletteRoundStageChangedEventData";
import type {BeforeRouletteRoundStageChangeEventData} from "./Declarations/EventData/BeforeRouletteRoundStageChangeEventData";

import {ERouletteRoundStage} from "./Declarations/Enums/ERouletteRoundStage";
import {ERouletteEventName} from "./Declarations/Enums/ERouletteEventName";

import Crypto from 'crypto';
import {EventEmitter2} from 'eventemitter2';
import {SecureRNG} from "secure-rng/lib/secure-rng";
import {v4 as uuidv4} from 'uuid';
import Timeout = NodeJS.Timeout;

export class RouletteRound extends EventEmitter2 {
  public static readonly RoundStageMap: RouletteStageMapItem[] = [
    {Current: ERouletteRoundStage.Created, Next: ERouletteRoundStage.OpenedForBetting},
    {Current: ERouletteRoundStage.OpenedForBetting, Next: ERouletteRoundStage.ClosedForBetting},
    {Current: ERouletteRoundStage.ClosedForBetting, Next: ERouletteRoundStage.RollStarted},
    {Current: ERouletteRoundStage.RollStarted, Next: ERouletteRoundStage.RollEnded},
    {Current: ERouletteRoundStage.RollEnded, Next: ERouletteRoundStage.Finished}
  ];

  #Timer: Timeout | null;
  #StageStartedAt: number | null;
  #WhenTheStageWillEnd: number | null;

  #Id: string;
  #Options: RouletteGameOptions;
  #Stage: ERouletteRoundStage;

  #Hash: string;
  #Secret: string;
  #LuckyNumber: number;

  constructor(Options: RouletteGameOptions, State?: RouletteRoundState | null) {
    super({wildcard: true});

    this.#Timer = null;
    this.#StageStartedAt = null;
    this.#WhenTheStageWillEnd = null;

    this.#Id = '';
    this.#Options = Options;
    this.#Stage = ERouletteRoundStage.Created;

    this.#Hash = '';
    this.#Secret = '';
    this.#LuckyNumber = -1;

    if (typeof State !== 'undefined' && State !== null) {
      this.LoadState(State);
    } else {
      this.#Id = uuidv4();
      this.SetProvablyFairProperties();
    }
  }


  private get CurrentUnixTime(): number {
    return Math.floor(Date.now() / 1000);
  }


  public get Options(): RouletteGameOptions {
    return this.#Options;
  }

  public get Stage(): ERouletteRoundStage {
    return this.#Stage;
  }

  public get Id(): string {
    return this.#Id;
  }

  public get State(): RouletteRoundState {
    return {
      Hash: this.Hash,
      LuckyNumber: this.LuckyNumber,
      Secret: this.Secret,
      RoundStage: this.Stage,
      GameOptions: this.Options,
      RoundId: this.Id
    };
  }

  public get Hash(): string {
    return this.#Hash;
  }

  public get Secret(): string {
    return this.#Secret;
  }

  public get LuckyNumber(): number {
    return this.#LuckyNumber;
  }

  public get IsFinishedOrCancelled(): boolean {
    return [ERouletteRoundStage.Cancelled, ERouletteRoundStage.Finished].indexOf(this.Stage) > -1;
  }

  public get StageStartedAt(): number {
    if (this.#StageStartedAt === null) {
      return -1;
    }

    return this.#StageStartedAt;
  }

  public get WhenTheStageWillEnd(): number {
    if (this.#WhenTheStageWillEnd === null) {
      return -1;
    }

    return this.#WhenTheStageWillEnd;
  }

  public get DurationRemainingToEndOfTheStage(): number {
    if (this.WhenTheStageWillEnd === -1 || this.WhenTheStageWillEnd < this.CurrentUnixTime) {
      return 0;
    }

    return this.CurrentUnixTime - this.WhenTheStageWillEnd;
  }


  private SetProvablyFairProperties(Secret?: string, LuckyNumber?: number) {
    let LocalSecret: string;
    let LocalLuckyNumber: number;
    let LocalHash: string;

    if (typeof Secret !== 'undefined') {
      LocalSecret = Secret;
    } else {
      LocalSecret = SecureRNG.GenerateString(this.#Options.RoundSecretLength);
    }

    if (typeof LuckyNumber !== 'undefined') {
      LocalLuckyNumber = LuckyNumber;
    } else {
      LocalLuckyNumber = SecureRNG.GenerateInteger(this.#Options.MinLuckyNumber, this.#Options.MaxLuckyNumber);
    }

    LocalHash = Crypto.createHmac(this.#Options.RoundHashAlgorithm, LocalSecret).update(LocalLuckyNumber.toString()).digest("hex");

    this.#Hash = LocalHash;
    this.#Secret = LocalSecret;
    this.#LuckyNumber = LocalLuckyNumber;
  }

  private LoadState(State: RouletteRoundState) {
    this.#Id = State.RoundId;
    this.#Options = {...this.Options, ...State.GameOptions};
    this.#Stage = State.RoundStage;

    this.SetProvablyFairProperties(State.Secret, State.LuckyNumber);
  }

  private GetDurationOfStageMap(MapItem: RouletteStageMapItem): number {
    switch (MapItem.Next) {
      case ERouletteRoundStage.OpenedForBetting:
        return this.Options.RoundStageDurations.OpenForBettingDuration;
      case ERouletteRoundStage.ClosedForBetting:
        return this.Options.RoundStageDurations.ClosedForBettingInfoDuration;
      case ERouletteRoundStage.RollStarted:
        return this.Options.RoundStageDurations.RollDuration;
      case ERouletteRoundStage.RollEnded:
        return this.Options.RoundStageDurations.FinishedInfoDuration;
    }

    return 0;
  }

  private GetPreviousStage() {
    const FoundStage = RouletteRound.RoundStageMap.find(item => item.Next === this.Stage);

    if (typeof FoundStage === 'undefined') {
      return ERouletteRoundStage.Created;
    }

    return FoundStage.Current;
  }

  private CalculateWhenTheStageWillEnd(Duration: number): number {
    return Math.ceil((Date.now() + Duration) / 1000);
  }

  private CancelTimer() {
    if (this.#Timer !== null) {
      clearTimeout(this.#Timer);
      this.#Timer = null;
      this.#StageStartedAt = null;
      this.#WhenTheStageWillEnd = null;
    }
  }


  private TriggerBeforeRoundStageChangeEvent() {
    const EventName = ERouletteEventName.BeforeRoundStageChange;

    const EventData: BeforeRouletteRoundStageChangeEventData = {
      Name: EventName,
      Data: {
        Round: this
      }
    };

    this.emit(EventName, EventData);
  }

  private TriggerRoundStageChangedEvent(PreviousStage: ERouletteRoundStage) {
    const EventName = ERouletteEventName.RoundStageChanged;

    const EventData: RouletteRoundStageChangedEventData = {
      Name: EventName,
      Data: {
        PreviousStage,
        Round: this
      }
    };

    this.emit(EventName, EventData);
  }


  public Start() {
    if (this.Stage !== ERouletteRoundStage.Created && !this.IsFinishedOrCancelled && !this.Options.ImmediatelyJumpToTheNextStageWhenTheGameStarts) {
      this.#Stage = this.GetPreviousStage();
    }

    this.GoToNextState();
  }

  public GoToNextState() {
    const FoundStageMap = RouletteRound.RoundStageMap.find(item => item.Current === this.Stage);

    if (typeof FoundStageMap === 'undefined') {
      return;
    }

    const Duration = this.GetDurationOfStageMap(FoundStageMap);

    this.TriggerBeforeRoundStageChangeEvent();

    this.#StageStartedAt = this.CurrentUnixTime;
    this.#WhenTheStageWillEnd = this.CalculateWhenTheStageWillEnd(Duration);
    this.#Stage = FoundStageMap.Next;

    this.TriggerRoundStageChangedEvent(FoundStageMap.Current);

    if (Duration > 0) {
      this.CancelTimer();
      this.#Timer = setTimeout(this.GoToNextState.bind(this), Duration);
    } else {
      this.GoToNextState();
    }
  }

  public Cancel() {
    this.CancelTimer();

    this.TriggerBeforeRoundStageChangeEvent();

    const PreviousStage = this.#Stage;
    this.#Stage = ERouletteRoundStage.Cancelled;

    this.TriggerRoundStageChangedEvent(PreviousStage);
  }
}
