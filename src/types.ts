import firebase from 'firebase/app';

export interface JdenticonConfigMap {
  [themeName: string]: {
    replaceMode: string;
    lightness: {grayscale: [number, number]}
  }
};

export interface ThemeMap {
  [variableName: string]: string;
};

export interface RouteParams {
  teamId?: string;
}

export interface AdditionalUserInfo {
  identiconString: string;
  theme: string;
};

export interface TeamData {
  teamId: string;
  teamName: string;
}

export interface ListData {
  listId: string;
  title: string;
  order: number;
}

export interface ListItemData {
  itemId: string;
  text: string;
  checked: boolean;
  order: number;
  reactions: {
    [name: string]: { count: number; timestamp: number } | firebase.firestore.FieldValue;
  };
}

export interface TrackData {
  trackId: string;
  name: string;
  color: string;
  emoji: string;
  laneId: string;
}

export interface RoleData {
  roleId: string;
  name: string;
  color: string;
  emoji: string;
  laneId: string;
}

export interface LaneData {
  laneId: string;
  isLocked: boolean;
}

export interface PersonData {
  userId: string;
  laneId: string;
  isLocked: boolean;
  contextCount: number;
}

export interface TeamPlacements {
  tracks: {
    [userId: string]: {
      laneId: string;
    };
  };
  roles: {
    [userId: string]: {
      laneId: string;
    };
  };
  people: {
    [userId: string]: {
      laneId: string;
      isLocked: boolean;
    };
  };
  lanes: {
    [laneId: string]: {
      isLocked: boolean;
    };
  };
}

export interface TeamHistory {
  [timestamp: string]: TeamPlacements;
}
