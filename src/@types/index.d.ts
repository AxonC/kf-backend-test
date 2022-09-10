interface GenericDict<T> {
  [key: string]: T;
}

declare namespace API {
  interface Outage extends GenericDict<string> {
    id: string;
    begin: string;
    end: string;
  }

  interface OutageDetailed extends Outage {
    name: string;
  }

  interface Device extends GenericDict<string> {
    id: string;
    name: string;
  }

  interface SiteInformation extends GenericDict<string | Device[]> {
    id: string;
    name: string;
    devices: Device[];
  }
}
