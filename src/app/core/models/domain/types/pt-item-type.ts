export type PtItemType = 'PBI' | 'Bug' | 'Chore' | 'Impediment';

export class ItemType {
  public static imageResFromType(PtItemType: PtItemType) {
    switch (PtItemType) {
      case 'PBI':
        return 'assets/img/icon_pbi.png';
      case 'Bug':
        return 'assets/img/icon_bug.png';
        case 'Chore':
        return 'assets/img/icon_chore.png';
        case 'Impediment':
        return 'assets/img/icon_impediment.png';
        default:
            return ''
    }
  }
}
