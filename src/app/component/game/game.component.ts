import { Component, Input, OnInit } from '@angular/core';
import { HostListener } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';

import { EmitterService } from 'src/app/services/emitter.service';
import { LoadWordsService } from 'src/app/services/load-words.service';
import { CommonService } from 'src/app/services/common.service';
import { StatisticsComponent } from '../statistics/statistics.component';
import { correctness, kbCorrectness } from 'src/app/utilities/interfaces';
import { ActivatedRoute } from '@angular/router';
import { gameNumber } from 'src/app/utilities/interfaces';

import {
  trigger,
  state,
  style,
  animate,
  transition,
  keyframes,
} from '@angular/animations';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  animations: [
    trigger('animateState', [
      state('shake', style({})),
      state('noShake', style({})),
      transition(
        'noShake => shake',
        animate(
          '250ms ease-in',
          keyframes([
            style({ transform: 'translate3d(-4%, 0, 0)', offset: 0.1 }),
            style({ transform: 'translate3d(4%, 0, 0)', offset: 0.2 }),
            style({ transform: 'translate3d(-4%, 0, 0)', offset: 0.3 }),
            style({ transform: 'translate3d(4%, 0, 0)', offset: 0.4 }),
            style({ transform: 'translate3d(-4%, 0, 0)', offset: 0.5 }),
            style({ transform: 'translate3d(4%, 0, 0)', offset: 0.6 }),
            style({ transform: 'translate3d(-4%, 0, 0)', offset: 0.7 }),
            style({ transform: 'translate3d(4%, 0, 0)', offset: 0.8 }),
            style({ transform: 'translate3d(-4%, 0, 0)', offset: 0.9 }),
          ])
        )
      ),
      transition('shake => noShake', animate('250ms ease-in')),
    ]),
  ],
})
export class GameComponent implements OnInit {
  @Input() passedWord: string = '';
  @Input() resetOnGameOver: boolean = true;

  private subscriptions: Subscription[] = [];
  public word: any = [];
  public array: any = [];
  public asciiPattern: string = '';
  public values: string = '';
  // the number of attempts made
  public wordCount: number = 0;
  // the number of letters typed
  public letterCount: number = 0;
  // the error message
  public errorMessage: string = '';
  // the answer to the wordle puzzle
  public wordleAnswer: string = '';
  // the state of the attempt
  public correctness = '';
  // state that manages if the game is over
  public isGameOver = false;
  // state that manages win/loss
  public gameWon = false;
  public wordleNumber: any;
  // object that holds all the wordle words
  public allWordleWords: any;
  // the gameNo from the route
  public gameNo: number = 0;

  private readonly LOCAL_STORAGE_ARRAY: string = 'arrays';
  private readonly LOCAL_STORAGE_WORDLE_ANSWER: string = 'wordleAnswer';
  private readonly LOCAL_STORAGE_GAME_STATE: string = 'gameState';
  private readonly LOCAL_STORAGE_STATS: string = 'stats';

  //setting values for number of words
  private readonly maxLetterCount: number = 5;
  private readonly maxWordCount: number = 6;
  constructor(
    private modalService: NgbModal,
    private wordleWord: LoadWordsService,
    private emitterService: EmitterService,
    public commonService: CommonService,
    private activatedRoute: ActivatedRoute,
    public datepipe: DatePipe
  ) {
    // get the page number from route
    this.gameNo = Number(this.activatedRoute.snapshot.paramMap.get('gameNo'));
    let emitValue: gameNumber;

    switch (Number(this.gameNo)) {
      case gameNumber.first: {
        emitValue = gameNumber.first;
        break;
      }
      case gameNumber.second: {
        emitValue = gameNumber.second;
        break;
      }
      case gameNumber.third: {
        emitValue = gameNumber.third;
        break;
      }
      default: {
        // value of 0
        emitValue = gameNumber.null;
      }
    }
    // if not 0, emit the value
    if (emitValue !== gameNumber.null) {
      this.commonService.delay(100).then(() => {
        this.emitterService.loadpageNumberCtrl(emitValue);
      });
    }

    this.LOCAL_STORAGE_ARRAY = emitValue + this.LOCAL_STORAGE_ARRAY;
    this.LOCAL_STORAGE_WORDLE_ANSWER =
      emitValue + this.LOCAL_STORAGE_WORDLE_ANSWER;
    this.LOCAL_STORAGE_GAME_STATE = emitValue + this.LOCAL_STORAGE_GAME_STATE;
  }

  ngOnDestroy() {
    for (let sub of this.subscriptions) {
      sub?.unsubscribe();
    }
  }
  ngOnInit(): void {
    this.getRandomWordle();

    // subscribe to keypresses on virtual keyboard
    this.subscriptions.push(
      this.emitterService.keyStrokeCtrlItem$.subscribe((keyStroke: string) => {
        if (keyStroke?.length === 1 && !this.isGameOver) {
          this.setErrorMessage('');
          this.array[this.wordCount].shakeState = 'noShake';
          this.insertValue(keyStroke);
        } else if (keyStroke === 'ENTER') {
          this.handleEnter();
        } else if (keyStroke === '<- BACK') {
          this.setErrorMessage('');
          this.array[this.wordCount].shakeState = 'noShake';
          this.handleBackspace();
        }
      })
    );
    // check if array is store in local storage
    let myArrayString = localStorage.getItem(this.LOCAL_STORAGE_ARRAY);
    if (myArrayString) {
      // restore it
      this.array = JSON.parse(myArrayString);
      // reinitialize letterCount
      this.wordCount = 0;
      for (let element of this.array) {
        // check if the letter is occupied, if it is, increment wordCount
        // if (element.word[this.maxLetterCount - 1].correctness !== '') {
        if (element.word[this.maxLetterCount - 1].correctness !== '') {
          ++this.wordCount;
        }

        if (this.wordCount === this.maxWordCount && this.resetOnGameOver) {
          this.wordCount = 0;
          this.clearLocalStorage();
          this.getRandomWordle();
        } else if (this.wordCount === this.maxWordCount) {
          this.isGameOver = true;

          
        }
      }
    } else {
      //setup the array for first time
      for (var i = 0; i < 6; i++) {
        //setup the array and get uuids for each element
        this.word = [];
        for (var j = 0; j < 5; j++) {
          this.word.push({ letter: '', key: uuidv4(), correctness: '' });
        }
        this.array.push({ word: this.word, shakeState: 'noShake' });
      }
    }

    // restore game state

    if (localStorage.getItem(this.LOCAL_STORAGE_GAME_STATE)) {
      let gameData = JSON.parse(
        localStorage.getItem(this.LOCAL_STORAGE_GAME_STATE) ?? ''
      );
      this.gameWon = gameData?.gameWon;
      this.isGameOver = gameData?.isGameOver;
    }
  }

  /**
   * @name clearLocalStorage
   * @description handles clearing all the local storage
   */
  clearLocalStorage() {
    localStorage.removeItem(this.LOCAL_STORAGE_ARRAY);
    localStorage.removeItem(this.LOCAL_STORAGE_WORDLE_ANSWER);
    localStorage.clear();
  }

  /**
   * @name getRandomWordle
   * @description gets a random word from the word and
   */
  getRandomWordle() {
    if (this.passedWord !== '') {
      this.wordleAnswer = this.passedWord;
      localStorage.setItem(this.LOCAL_STORAGE_WORDLE_ANSWER, this.wordleAnswer);
    } else {
      // get all the wordle words
      this.allWordleWords = this.wordleWord.getWords();
      // check if there is a word already cached, otherwise get a random one
      let tempWordleAnswer = localStorage.getItem(
        this.LOCAL_STORAGE_WORDLE_ANSWER
      );
      if (tempWordleAnswer && tempWordleAnswer != '') {
        this.wordleAnswer = tempWordleAnswer;
      } else {
        this.wordleAnswer =
          this.allWordleWords[
            this.commonService.getRandomInt(this.allWordleWords.length)
          ].wordle.toUpperCase();
        localStorage.setItem(
          this.LOCAL_STORAGE_WORDLE_ANSWER,
          this.wordleAnswer
        );
      }
    }
  }

  /**
   * @name setErrorMessage
   * @description sets the error message on the screen
   * @param message the message that is to be displayed
   */
  setErrorMessage(message: string) {
    this.errorMessage = message;
  }

  //on keypressdown for the whole page
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    //check if game is over
    if (this.isGameOver) {
      return;
    }

    //ignores repeat and keys that are not letters
    if (!event.repeat && this.isLetter(event.key)) {
      //clears error messages
      if (this.errorMessage != '') {
        this.errorMessage = '';
        this.array[this.wordCount].shakeState = 'noShake';
      }

      //converts to upper case
      this.values = event.key.toUpperCase();
      //adds the value to the wordle square
      this.insertValue(this.values);
    }
    // check for backpsace
    else if (!event.repeat && event.key == 'Backspace') {
      this.errorMessage = '';
      this.array[this.wordCount].shakeState = 'noShake';
      this.handleBackspace();
    }
    // check for enter key
    else if (!event.repeat && event.key == 'Enter') {
      this.handleEnter();
    }
  }

  /**
   * @name insertValue
   * @description method that inserts the keystroke into the json object/array
   * @param letter the letter to be inserted
   */
  insertValue(letter: String) {
    if (this.letterCount < this.maxLetterCount) {
      this.array[Math.floor(this.wordCount)].word[this.letterCount].letter =
        letter;
      ++this.letterCount;
    }
  }

  /**
   * @name isLetter
   * @description method that checks if input is letters
   * @param str
   * @returns boolean: true if is a letter, false otherwise
   */
  isLetter = function (str: String) {
    return str.length === 1 && str.match(/[a-zA-Z]/i);
  };

  /**
   * @name handleBackspace
   * @description method that erases the last letter
   */
  handleBackspace() {
    //check for errors
    if (this.letterCount > 0) {
      --this.letterCount;
      // erase the last value and decrement
      this.array[Math.floor(this.wordCount)].word[this.letterCount].letter = '';
    }
  }

  /**
   * @name handleEnter
   * @desc validates word and lights up letters if is valid word
   */
  handleEnter() {
    //check if we have enough letters
    if (this.letterCount < this.maxLetterCount) {
      //handle not enough letters
      this.setErrorMessage('Not enough letters.');
      //set the shake to true
      this.array[this.wordCount].shakeState = 'shake';
    }
    //not working currently
    else if (this.wordCount == this.maxWordCount) {
      //lose the game
      this.setErrorMessage('You lose! Better luck next time!');
    }
    //try the word to see how many letters are correct
    else if (this.wordCount < this.maxWordCount) {
      //check if word is valid
      if (this.isValidWord()) {
        this.wordCount++;
        this.letterCount = 0;
      }
      //if word is invalid set error message
      else {
        this.setErrorMessage('Not in word list!');
        //set the shake to true
        this.array[this.wordCount].shakeState = 'shake';
      }
    }
  }

  /**
   * @name isValidWord
   * @description loops through wordle words to see if submitted word is valid
   * @returns boolean: true if is valid, false otherwise
   */
  isValidWord() {
    var foundWord = false;
    //construct the word from the array
    var theGuessWord = '';
    for (var i = 0; i < this.maxLetterCount; ++i) {
      //loop through array and concatenate
      theGuessWord = theGuessWord.concat(
        this.array[this.wordCount].word[i].letter
      );
    }
    for (let [key, value] of Object.entries(this.wordleWord.getWords())) {
      if (value.wordle.toString().toUpperCase() == theGuessWord.toUpperCase()) {
        foundWord = true;
        this.handleValidWord();
        break;
      }
    }
    return foundWord;
  }

  /**
   * @name handleValidWord
   * @description checks if the letters are in the right spot etc (ie yellow or green)
   */
  handleValidWord() {
    var correctLetters = 0;
    var hashmap: any = {};
    //count each letter in the theGuessWord
    for (var i = 0; i < this.maxLetterCount; ++i) {
      if (hashmap[this.wordleAnswer[i]] == null) {
        hashmap[this.wordleAnswer[i]] = 1;
      } else {
        hashmap[this.wordleAnswer[i]] += 1;
      }
    }
    //get all the fully correct answers
    for (var i = 0; i < this.maxLetterCount; i++) {
      if (this.array[this.wordCount].word[i].letter == this.wordleAnswer[i]) {
        hashmap[this.array[this.wordCount].word[i].letter] -= 1;
        this.array[this.wordCount].word[i].correctness =
          correctness.fullCorrect;
        // create the variable to be emitted
        this.emitKB(
          this.array[this.wordCount].word[i].letter,
          correctness.fullCorrect
        );

        ++correctLetters;
      } else {
        this.array[this.wordCount].word[i].correctness = correctness.incorrect;
        this.emitKB(
          this.array[this.wordCount].word[i].letter,
          correctness.incorrect
        );
      }
    }

    // check if we are fully correct
    if (correctLetters == this.maxLetterCount) {
      this.isGameOver = true;
      this.gameWon = true;

      this.updateStats(this.wordCount);
      this.openStatisticsComponent(true);
    } else {
      //partial answers
      for (var j = 0; j < this.maxLetterCount; ++j) {
        for (var i = 0; i < this.maxLetterCount; ++i) {
          if (
            this.array[this.wordCount].word[j].letter == this.wordleAnswer[i] &&
            hashmap[this.array[this.wordCount].word[j].letter] > 0 &&
            this.array[this.wordCount].word[j].correctness ==
              correctness.incorrect
          ) {
            hashmap[this.array[this.wordCount].word[j].letter] -= 1;
            this.array[this.wordCount].word[j].correctness =
              correctness.halfCorrect;

            this.emitKB(
              this.array[this.wordCount].word[j].letter,
              correctness.halfCorrect
            );
          }
        }
      }

      if (this.wordCount == this.maxWordCount - 1) {
        this.isGameOver = true;
        this.updateStats(this.wordCount + 1);
        
        this.openStatisticsComponent(false);
      }
    }
    // if game isn't over, store it in local storage
    // if (!this.isGameOver)
    {
      localStorage.setItem(
        this.LOCAL_STORAGE_ARRAY,
        JSON.stringify(this.array)
      );

      localStorage.setItem(
        this.LOCAL_STORAGE_GAME_STATE,
        JSON.stringify({
          isGameOver: this.isGameOver,
          gameWon: this.gameWon,
        })
      );
    }
  }

  /**
   * @name updateStats
   * @description updates the array of stats in localStorage
   * @param result the result of the last game (which will be stored)
   */
  updateStats(result: number) {
    // update the stats localstorage
    let tempStats = localStorage.getItem(this.LOCAL_STORAGE_STATS);
    let tempStatsArr = [];
    if (tempStats) {
      tempStatsArr = JSON.parse(tempStats);
    } else {
      // initialize the array
      for (let i = 0; i < this.maxWordCount + 1; ++i) {
        tempStatsArr[i] = 0;
      }
    }
    // push the current result into the array
    ++tempStatsArr[result];
    if (this.resetOnGameOver) {
      this.clearLocalStorage();
    }
    localStorage.setItem(
      this.LOCAL_STORAGE_STATS,
      JSON.stringify(tempStatsArr)
    );
  }

  /**
   * @name openStatisticsComponent
   * @description the modal/dialog that will open when the game is over
   * @param didWin boolean that passes if user won or not
   */
  openStatisticsComponent(didWin: boolean) {
    const modalRef = this.modalService.open(StatisticsComponent, {
      backdrop: false,
    });

    //get the game number for today
    let startDate = new Date('2021-06-19T11:59:59');
    let today = new Date();
    this.wordleNumber = Math.floor(
      (today.getTime() - startDate.getTime()) / 3600 / 24 / 1000
    );

    //create the ascii array that will be copied onclick
    this.asciiPattern += 'Wordle ' + this.wordleNumber + ' ';

    this.asciiPattern += this.wordCount + 1;
    this.asciiPattern += '/' + this.maxWordCount + '\n';
    for (var i = 0; i < this.wordCount + 1; ++i) {
      for (var j = 0; j < this.maxLetterCount; ++j) {
        if (this.array[i].word[j].correctness === correctness.fullCorrect) {
          this.asciiPattern += '🟩';
        } else if (
          this.array[i].word[j].correctness === correctness.halfCorrect
        ) {
          this.asciiPattern += '🟨';
        } else {
          this.asciiPattern += '⬜';
        }
      }
      this.asciiPattern += '\n';
    }

    //pass didWin to StatisticsComponent
    (<StatisticsComponent>modalRef.componentInstance).didWin = didWin;
    (<StatisticsComponent>modalRef.componentInstance).modalRef = modalRef;
    (<StatisticsComponent>modalRef.componentInstance).asciiPattern =
      this.asciiPattern;
  }

  emitKB(_letter: string, _correctness: correctness) {
    // create the variable to be emitted
    let myKBCorrectness: kbCorrectness = {
      letter: _letter,
      correctness: _correctness,
    };
    // emit the variable
    this.emitterService.loadKBCorrectnessCtrl(myKBCorrectness);
  }
}
