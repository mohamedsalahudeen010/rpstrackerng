import { Component, OnInit, OnDestroy } from '@angular/core';

import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import {
  KENDO_BUTTON,
  KENDO_BUTTONGROUP,
} from '@progress/kendo-angular-buttons';
import { DashboardService } from '../../services/dashboard.service';

import { ActiveIssuesComponent } from '../../components/active-issues/active-issues.component';
import { AsyncPipe } from '@angular/common';
import { Store } from '../../../../core/state/app-store';
import { DashboardFilter } from '../../../../shared/models/dto/stats/dashboard-filter';
import { StatusCounts } from '../../models';
import { DashboardRepository } from '../../repositories/dashboard.repository';
import { KENDO_COMBOBOX } from '@progress/kendo-angular-dropdowns';
import { PtUserService } from '../../../../core/services';
import { PtUser } from '../../../../core/models/domain';
import { FilteredIssues } from '../../../../shared/models/dto/stats/filtered-issues';
import { KENDO_CHART } from '@progress/kendo-angular-charts';
interface DateRange {
  dateStart: Date;
  dateEnd: Date;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.component.html',
  styleUrls: ['dashboard.page.component.css'],
  imports: [
    ActiveIssuesComponent,
    AsyncPipe,
    KENDO_BUTTON,
    KENDO_BUTTONGROUP,
    KENDO_COMBOBOX,
    KENDO_CHART,
  ],
  providers: [DashboardService, DashboardRepository],
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  private sub: Subscription | undefined;
  public filter: DashboardFilter = {};
  public filteredDateStart: Date | undefined;
  public filteredDateEnd: Date | undefined;

  public statusCounts$: BehaviorSubject<StatusCounts> =
    new BehaviorSubject<StatusCounts>({
      activeItemsCount: 0,
      closeRate: 0,
      closedItemsCount: 0,
      openItemsCount: 0,
    });

  public users$: Observable<PtUser[]>;

  public allIssues$: BehaviorSubject<FilteredIssues> =
    new BehaviorSubject<FilteredIssues>({
      catagories: [],
      items: [],
    });

  public catagories: Date[] = [];

  public itemsOpenByMonth: number[] = [];

  public itemsClosedByMonth: number[] = [];

  private get currentUserId() {
    if (this.store.value.currentUser) {
      return this.store.value.currentUser.id;
    } else {
      return undefined;
    }
  }

  constructor(
    private dashboardService: DashboardService,
    private userService: PtUserService,
    private store: Store
  ) {
    this.users$ = this.store.select<PtUser[]>('users');
  }

  public ngOnInit() {
    this.allIssues$.subscribe((issues: FilteredIssues) => {
      console.log(issues)
      this.catagories = issues.catagories?.map((date) => new Date(date));
      this.itemsOpenByMonth = [];
      this.itemsClosedByMonth = [];
      issues.items.forEach((element) => {
         console.log(issues)
        this.itemsOpenByMonth.push(element.open.length);
        this.itemsClosedByMonth.push(element.closed.length);
      });
    });
    this.refresh();
  }

  public openDropDown() {
    this.userService.fetchUsers();
  }

  public onComboChange(user: PtUser | undefined) {
    if (user) {
      this.filter.userId = user.id;
    } else {
      this.filter.userId = undefined;
    }
    this.refresh();
  }

  public onMonthRangeTap(months: number) {
    const range = this.getDateRange(months);
    this.filteredDateStart = range.dateStart;
    this.filteredDateEnd = range.dateEnd;
    this.filter = {
      userId: this.filter.userId,
      dateEnd: range.dateEnd,
      dateStart: range.dateStart,
    };
    this.refresh();
  }

  private refresh() {
    this.sub = this.dashboardService
      .getStatusCounts(this.filter)
      .subscribe((result) => {
        this.statusCounts$.next(result);
      });

      this.dashboardService.getFilteredIssues(this.filter).subscribe((issues:FilteredIssues)=>{
        this.allIssues$.next(issues)
      })
  }

  private getDateRange(months: number): DateRange {
    const now = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);
    return {
      dateStart: start,
      dateEnd: now,
    };
  }

  public ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
