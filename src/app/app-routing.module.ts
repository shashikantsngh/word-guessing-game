import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {StatisticsComponent} from "src/app/component/statistics/statistics.component";
import {NotfoundComponent} from "src/app/component/notfound/notfound.component";
import { SolverComponent } from './component/solver/solver.component';
import { GameWrapperComponent } from './component/game-wrapper/game-wrapper.component';

const routes: Routes = [
  {path: "", redirectTo: '/game/1', pathMatch: 'full' },
  {path: "game/:gameNo", component: GameWrapperComponent },
  {path: "solver", component: SolverComponent },
  {path: "statistics", component: StatisticsComponent },
  {path: '404', component: NotfoundComponent},
  {path: '**', component: NotfoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
