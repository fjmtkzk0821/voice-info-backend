import {isStringEmpty} from "../common";
import {SeiyuDocument} from "./seiyu";

class SeiyuSearchCriteria {
    name = "";
    gender = "";
    restric = "";
    possible = "";
    wish = "";
    hires = false;

    match(doc: SeiyuDocument): boolean {
      if (
        (!isStringEmpty(this.name) && !doc.name.includes(this.name)) ||
        (!isStringEmpty(this.restric) &&
          (doc.restric as any)[this.restric] === false) ||
        (!isStringEmpty(this.possible) &&
          !doc.possible.some(
              (p) => p.includes(this.possible) || p.includes(this.wish)
          )) ||
        (!isStringEmpty(this.wish) && !doc.wish.some(
            (p) => p.includes(this.possible) || p.includes(this.wish)
        ))
      ) {
        return false;
      }
      return true;
    }

    getDocCriteria(): Array<{c: string, o: any, v: any}> {
      const criteria: Array<{c: string, o: any, v: any}> = [];
      if (!isStringEmpty(this.gender)) {
        criteria.push({c: "gender", o: "==", v: this.gender});
      }
      if (!this.hires) {
        criteria.push({c: "hires", o: "==", v: true});
      }
      return criteria;
    }

    static fromObj(obj: any): SeiyuSearchCriteria {
      const criteria: any = new SeiyuSearchCriteria();
      for (const c of Object.getOwnPropertyNames(criteria)) {
        if (obj[c] != undefined) {
          criteria[c] = obj[c];
        }
      }
      return criteria;
    }
}

export {SeiyuSearchCriteria};
