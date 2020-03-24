import ExtendableError from "ts-error";

export class RoundNotFoundException extends ExtendableError {
  constructor() {
    super();

    this.message = 'No rounds were found to start.';
  }
}
