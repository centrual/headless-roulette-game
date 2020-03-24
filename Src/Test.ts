import {RouletteGame} from "./RouletteGame";
import {ERouletteEventName} from "./Declarations/Enums/ERouletteEventName";
import {ERouletteRoundStage} from "./Declarations/Enums/ERouletteRoundStage";

const Game = new RouletteGame();

Game.on(ERouletteEventName.BeforeGameStart, () => {
  console.log('Before Game Start');
})

Game.on(ERouletteEventName.GameStarted, () => {
  console.log('Game Started!');
});

Game.on(ERouletteEventName.BeforeGameStop, () => {
  console.log('Before Game Stop!');
});

Game.on(ERouletteEventName.GameStopped, () => {
  console.log('Game Stopped!');
});

Game.on(ERouletteEventName.RoundStageChanged, EventArgs => {
  let Yaz = '';

  switch(EventArgs.Data.Round.State.RoundStage) {
    case ERouletteRoundStage.Created:
      Yaz = 'Created';
      break;
    case ERouletteRoundStage.OpenedForBetting:
      Yaz = 'Opened For Betting..';
      break;
    case ERouletteRoundStage.ClosedForBetting:
      Yaz = 'Closed For Betting!';
      break;
    case ERouletteRoundStage.RollStarted:
      Yaz = 'Roll Started';
      break;
    case ERouletteRoundStage.RollEnded:
      Yaz = 'Roll Ended';
      break;
    case ERouletteRoundStage.Finished:
      Yaz = 'Round Finished!';
      break;
    case ERouletteRoundStage.Cancelled:
      Yaz = 'CANCELLED!';
      break;
  }

  console.log(Yaz);
})

Game.Start();
