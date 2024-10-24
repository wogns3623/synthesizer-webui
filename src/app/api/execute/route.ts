import { exec } from "child_process";
import { NextRequest, NextResponse } from "next/server";

export type ExecuteResponseData = {
  message: string;
};

export type ExecuteRequestData = {
  output: string;
};

export async function POST(request: NextRequest) {
  const { output } = (await request.json()) as ExecuteRequestData;

  // const cp = exec(`ocaml_exec "${output}"`, {});
  // cp.

  return NextResponse.json<ExecuteResponseData>({
    message: "> execute result: " + output,
  });
}
