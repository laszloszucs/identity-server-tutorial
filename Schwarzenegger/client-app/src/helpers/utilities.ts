export class Utilities {
  public static JsonTryParse(value: string) {
    try {
      return JSON.parse(value);
    } catch (e) {
      if (value === "undefined") {
        return void 0;
      }
      return value;
    }
  }
}
