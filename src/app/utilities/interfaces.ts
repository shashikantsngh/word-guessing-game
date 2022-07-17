export enum correctness {
  fullCorrect = 1,
  halfCorrect = 2,
  incorrect = 3,
}

export interface kbCorrectness {
  letter: string;
  correctness: correctness;
}

export enum gameNumber {
  null = 0,
  first = 1,
  second = 2,
  third = 3,
}
