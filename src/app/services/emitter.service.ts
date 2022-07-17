import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { gameNumber, kbCorrectness } from '../utilities/interfaces';

@Injectable({
  providedIn: 'root',
})
export class EmitterService {
  // *************************************************************
  // subject
  private keyStrokeCtrl = new Subject<string>();
  // subscribe to subject to see when keyStrokeCtrl changes
  public keyStrokeCtrlItem$ = this.keyStrokeCtrl.asObservable();
  // call this method to change keyStroke
  public loadKeyStrokeCtrl(nextKeyStroke: string) {
    this.keyStrokeCtrl.next(nextKeyStroke);
  }
  // *************************************************************
  // subject
  private KBCorrectnessCtrl = new Subject<kbCorrectness>();
  // subscribe to subject to see when keyboard correctness changes
  public KBCorrectnessCtrlItem$ = this.KBCorrectnessCtrl.asObservable();
  // call this method to change the correctness (ie when enter is pressed)
  public loadKBCorrectnessCtrl(nextCorrectness: kbCorrectness) {
    this.KBCorrectnessCtrl.next(nextCorrectness);
  }
  // *************************************************************
  // subject
  private pageNumberCtrl = new Subject<gameNumber>();
  // subscribe to subject to see when gameNumber changes
  public pageNumberCtrlItem$ = this.pageNumberCtrl.asObservable();
  // call this method to change the gameNumber
  public loadpageNumberCtrl(nextCorrectness: gameNumber) {
    this.pageNumberCtrl.next(nextCorrectness);
  }
  // *************************************************************
  constructor() {}
}
