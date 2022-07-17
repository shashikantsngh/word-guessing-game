import { Component, OnInit } from '@angular/core';
import { Subscription, forkJoin, combineLatestWith } from 'rxjs';

import { EmitterService } from 'src/app/services/emitter.service';
import { CommonService } from 'src/app/services/common.service';
import {
  correctness,
  gameNumber,
  kbCorrectness,
} from 'src/app/utilities/interfaces';
@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.scss'],
})
export class KeyboardComponent implements OnInit {
  private subscriptions: Subscription[] = [];
  private readonly KB_STYLE_ARRAY: string = 'kbStyle';
  private gameNo: gameNumber = gameNumber.null;
  public keyboardArray = [
    {
      row: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    },
    {
      row: ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    },
    {
      row: ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<- BACK'],
    },
  ];

  public styleArray: any = {};
  constructor(
    private emitterService: EmitterService,
    public commonService: CommonService
  ) {
    // subscribe to get the :gameNo from activated route
    this.subscriptions.push(
      this.emitterService.pageNumberCtrlItem$.subscribe((res: gameNumber) => {
        this.gameNo = res;

        // load keyboard styles from localStorage
        let myKBStyle = localStorage.getItem(this.getKBStyleKey());
        if (myKBStyle) {
          let savedKB = JSON.parse(myKBStyle);
          let keys = Object.entries(savedKB);
          let correctType: correctness;
          for (let key of keys) {
            // convert string to kb object
            if (
              this.commonService.correctnessToString(correctness.fullCorrect) ==
              key[1]
            ) {
              correctType = correctness.fullCorrect;
            } else if (
              this.commonService.correctnessToString(correctness.halfCorrect) ==
              key[1]
            ) {
              correctType = correctness.halfCorrect;
            } else if (
              this.commonService.correctnessToString(correctness.incorrect) ==
              key[1]
            ) {
              correctType = correctness.incorrect;
            } else {
              correctType = correctness.incorrect;
            }

            // create the temp object
            let tempkbCorrectness: kbCorrectness = {
              letter: key[0],
              correctness: correctType,
            };

            this.emitterService.loadKBCorrectnessCtrl(tempkbCorrectness);
          }
        }
      })
    );

    // subscribe to the kb correctness service
    this.subscriptions.push(
      this.emitterService.KBCorrectnessCtrlItem$.subscribe(
        (kbCor: kbCorrectness) => {
          if (
            kbCor.correctness === correctness.fullCorrect ||
            typeof this.styleArray[kbCor.letter] === 'undefined'
          ) {
            this.styleArray[kbCor.letter] =
              this.commonService.correctnessToString(kbCor.correctness);
          } else if (
            kbCor.correctness === correctness.halfCorrect &&
            this.styleArray[kbCor.letter] !=
              this.commonService.correctnessToString(correctness.fullCorrect)
          ) {
            this.styleArray[kbCor.letter] =
              this.commonService.correctnessToString(kbCor.correctness);
          }
          localStorage.setItem(
            this.getKBStyleKey(),
            JSON.stringify(this.styleArray)
          );
        }
      )
    );
  } // constructor

  ngOnInit(): void {} // ngOnInit

  keyboardHandler(letter: string) {
    // emit the letter to be handle on subscribe
    this.emitterService.loadKeyStrokeCtrl(letter);
  }

  // method that returns whether or the keyboard is even or odd
  getRowStyle(rowNum: number): string {
    let returnVal: string;
    if (rowNum % 2) {
      returnVal = 'oddKeyboard';
    } else {
      returnVal = 'evenKeyboard';
    }
    return returnVal;
  }

  ngOnDestroy() {
    for (let sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }

  getKBStyleKey() {
    return this.gameNo + this.KB_STYLE_ARRAY;
  }
}
