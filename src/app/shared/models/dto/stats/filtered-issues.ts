import { PtItem } from '../../../../core/models/domain';

export interface ItemsForMonts {
  closed: PtItem[];
  open: PtItem[];
}

export interface FilteredIssues {
  catagories: [];
  items: ItemsForMonts[];
}
