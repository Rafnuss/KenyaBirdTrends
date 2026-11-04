import { describe, expect, it } from "vitest";

import { cleanName } from "../src/utils/names";

describe("cleanName", () => {
  it.each([
    ["James Apolloh ~Freelance Tour Guide", "James Apolloh"],
    ["Ouma Oluoko https://oluokos.com", "Ouma Oluoko"],
    ["Mwangi Gitau |ConQuest Adventures Ltd", "Mwangi Gitau"],
    ["Cisticola Tours (www.cisticolatours.com)", "Cisticola Tours"],
    ["John Gitiri (Freelance Birding Guide)", "John Gitiri"],
    ["JAMES MBURU _ Freelance Tour Guide", "James Mburu"],
    ["Korir Lenard Tour Guide", "Korir Lenard"],
    ["Niall Perrins-bustardsbirding.co.za", "Niall Perrins"],
    ["isaac kilusu", "Isaac Kilusu"],
    ["mr morgan njue", "Mr Morgan Njue"],
    ["KEVIN MUCHIRI", "Kevin Muchiri"],
    ["MR AFJ SCHLEMMER", "Mr AFJ Schlemmer"],
    ["KZN CRANE FOUNDATION", "KZN Crane Foundation"],
    ["Peter  Steward", "Peter Steward"],
    ["Ms H Douglas-Dufresne", "Ms H Douglas-Dufresne"],
    ["Salma Mazrui-Watt", "Salma Mazrui-Watt"],
    ["Jean-Louis Carlo", "Jean-Louis Carlo"],
    ["obsr1234567", "obsr1234567"],
  ])("%s -> %s", (raw, clean) => {
    expect(cleanName(raw)).toBe(clean);
  });
});
