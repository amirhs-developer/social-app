

export class Helpers {

  public static convertFirstLetterToUppercase(str: string): string {
    // first convert string characters to lower case
    const valueString = str.toLowerCase();

    return valueString
      .split(' ')
      .map((value: string) => `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`)
      .join(' ');
  }

  public static convertToLowerCase(str: string) : string {
    return str.toLowerCase();
  }

  public static generateRandomIntegers(length: number): number {
    const characters = '0123456789';
    let result = ' ';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      result+= characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return parseInt(result , 10);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static parseJSON(prop: string): any {
    try {
      JSON.parse(prop);
    } catch (error) {
      return prop;
    }
  }

}
