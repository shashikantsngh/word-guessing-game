import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { EmitterService } from 'src/app/services/emitter.service';
import { gameNumber } from 'src/app/utilities/interfaces';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {
  // the game/page that is selected
  gameNo: gameNumber = gameNumber.null;
  // so that gameNumber can be accessible in html
  gameNumberType = gameNumber;
  // the array of subscriptions
  subscriptions: Subscription[] = [];

  constructor(private emitterService: EmitterService) {
    this.subscriptions.push(
      this.emitterService.pageNumberCtrlItem$.subscribe((res: gameNumber) => {
        this.gameNo = res;
      })
    );
  }

  ngOnInit() {}
  ngOnDestroy() {
    // unsubscribe to subscriptions
    for (let sub of this.subscriptions) {
      sub?.unsubscribe();
    }
  }
}
