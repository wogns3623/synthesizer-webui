import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { exec } from "child_process";

export type SynthesizeResponseData = {
  message: string;
};

export type SynthesizeRequestData = {
  input: string;
};

export async function POST(request: NextRequest) {
  const { input } = (await request.json()) as SynthesizeRequestData;

  // await fs.writeFile("./io/input.mls", input);

  // const result = await new Promise<string>((res, rej) => {
  //   exec(
  //     "./bidir_rec/main.native ./io/input.mls",
  //     { timeout: 60000 * 2 },
  //     (err, stdout, stderr) => {
  //       if (err) {
  //         console.error(err);
  //         if (err.killed) return res("(* Yet. *)");
  //         else return res("(* Check your input format. *)");
  //       } else return res(stderr);
  //     }
  //   );
  // });
  const result = input;

  return NextResponse.json<SynthesizeResponseData>({ message: result });
}
