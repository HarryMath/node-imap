export abstract class SearchBuilder {
  static buildOpponentCriteria(opponents: string[]): any {
    const opponentCondition = ["OR"];
    let nestedCondition = opponentCondition;
    const conditions = opponents.reduce((all, current) => ([...all, ["TO", current], ["FROM", current]]), []);

    for (let i = 0; i < conditions.length; i++) {
      let condition = conditions[i];
      if (nestedCondition.length < 2 || (nestedCondition.length === 2 && i === conditions.length - 1)) {
        nestedCondition.push(condition);
      }
      else {
        condition = ["OR", condition];
        nestedCondition.push(condition);
        nestedCondition = condition;
      }
    }

    return opponentCondition;
  }
}
