import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { exec, spawn } from "child_process";
import { ReadableStream, WritableStream } from "stream/web";
import { Readable } from "stream";
import path from "path";

export type SynthesizeResponseData = {
  message: string;
};

export type SynthesizeRequestData = string;

const inputFilePath = "./externs/input.mls";

export async function POST(request: NextRequest) {
  if (!request.body) return NextResponse.error();
  try {
    const writeStream = fs.createWriteStream(inputFilePath);
    const writableStream = new WritableStream({
      write(chunk) {
        writeStream.write(chunk);
      },
    });

    await request.body.pipeTo(writableStream);

    // const program = spawn(`./externs/trio ${inputFilePath}`, { timeout:60000 * 2 });
    // return Readable.toWeb(program.stdout);

    console.log("Start synthesize input source");
    const result = await new Promise<string>((res, rej) => {
      exec(
        `./externs/trio ${inputFilePath}`,
        { timeout: 60000 * 2 },
        (err, stdout, stderr) => {
          console.error(
            "Synthesize error: ",
            err,
            "\nSynthesize stdout: ",
            stdout,
            "\nSynthesize stderr: ",
            stderr
          );
          if (err) {
            if (err.killed) return res("(* Yet. *)");
            else return res("(* Check your input format. *)");
          } else return res(stderr);
        }
      );
    });

    return new NextResponse(result);
  } catch (e) {
    return NextResponse.error();
  }
}
