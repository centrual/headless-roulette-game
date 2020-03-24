import {RouletteGame} from '../RouletteGame';
import {ERoundHashAlgorithm} from "../Declarations/Enums/ERoundHashAlgorithm";

describe("Roulette Game Tests", () => {

  describe("Has Not Saved State", () => {
    it("Should parse options parameter correctly", () => {
      const AutoStartNewRound = false,
        RoundHashAlgorithm = ERoundHashAlgorithm.SHA512,
        MinLuckyNumber = -30,
        MaxLuckyNumber = 30,
        RoundSecretLength = 64,
        MaxHistoryItems = 20,
        AutoMakeNewRound = true,
        RoundStageDurations = {
          OpenForBettingDuration: 25000,
          ClosedForBettingInfoDuration: 5000,
          RollDuration: 10000,
          FinishedInfoDuration: 3000
        };

      const game = new RouletteGame({
        AutoStartNewRound,
        RoundHashAlgorithm,
        MinLuckyNumber,
        MaxLuckyNumber,
        RoundSecretLength,
        MaxHistoryItems,
        RoundStageDurations
      });

      expect(game.Id.length).toBeGreaterThan(0);
      expect(game.Options.AutoMakeNewRound).toBe(AutoMakeNewRound);
      expect(game.Options.MinLuckyNumber).toBe(MinLuckyNumber);
      expect(game.Options.MaxLuckyNumber).toBe(MaxLuckyNumber);
      expect(game.Options.MaxHistoryItems).toBe(MaxHistoryItems);
      expect(game.Options.AutoStartNewRound).toBe(AutoStartNewRound);
      expect(game.Options.RoundSecretLength).toBe(RoundSecretLength);

      expect(game.Options.RoundStageDurations.OpenForBettingDuration).toBe(RoundStageDurations.OpenForBettingDuration);
      expect(game.Options.RoundStageDurations.ClosedForBettingInfoDuration).toBe(RoundStageDurations.ClosedForBettingInfoDuration);
      expect(game.Options.RoundStageDurations.RollDuration).toBe(RoundStageDurations.RollDuration);
      expect(game.Options.RoundStageDurations.FinishedInfoDuration).toBe(RoundStageDurations.FinishedInfoDuration);

      expect(game.CurrentRound!.Id.length).toBeGreaterThan(0);
      expect(game.CurrentRound!.Secret).toHaveLength(RoundSecretLength);
      expect(game.CurrentRound!.Hash).toHaveLength(512 / 4); // 4 bit = 1 byte
      expect(game.CurrentRound!.LuckyNumber).toBeGreaterThanOrEqual(MinLuckyNumber);
      expect(game.CurrentRound!.LuckyNumber).toBeLessThanOrEqual(MaxLuckyNumber);
    });

    it("Should events trigger at the right time", () => {

    });

    it("Should trigger cancel event at the right time", () => {

    });
  });

  describe("Has Saved State", () => {

  });
});
