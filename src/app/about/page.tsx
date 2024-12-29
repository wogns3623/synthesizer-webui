import Link from "next/link";

export default function About() {
  return (
    <div className="flex w-screen flex-col bg-neutral-800">
      <header className="flex h-12 justify-between bg-neutral-700 px-4 text-white">
        <section className="flex">
          <Link href="/" className="mr-4 flex items-center">
            <h1 className="text-3xl font-semibold">Trio</h1>
          </Link>
        </section>

        <section className="flex">
          <Link
            href="/about"
            className="flex items-center px-4 hover:bg-neutral-600"
          >
            <p>about</p>
          </Link>
        </section>
      </header>

      <section className="h-[calc(100vh-3rem)] w-[64rem] self-center px-4 py-4">
        <section className="mb-8">
          <h2 className="mb-2 text-4xl font-semibold">Paper</h2>

          <div>
            <p className="mb-4">
              Trio is a tool for synthesizing recursive functional programs from
              input-output examples.
            </p>

            <p className="mb-4">
              It takes as input
              <ol className="list-inside list-decimal pl-4">
                <li>Custom data types</li>
                <li>Operators that may be used by a solution</li>
                <li>
                  A type signature for the solution to be synthesized and a set
                  of input-output examples
                </li>
              </ol>
              and produces a recursive functional program that satisfies the
              input-output examples.
            </p>

            <p className="mb-4">
              A formal exposition of the system can be found in our{" "}
              <Link
                href="https://dl.acm.org/doi/10.1145/3571263"
                className="text-blue-600 underline visited:text-purple-600 hover:text-blue-800"
              >
                POPL 23 publication, Inductive Synthesis of Structurally
                Recursive Programs from Non-recursive Expressions.
              </Link>
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-4xl font-semibold">Source Code</h2>

          <p>
            Source code is available on{" "}
            <Link
              href="https://github.com/pslhy/trio"
              className="text-blue-600 underline visited:text-purple-600 hover:text-blue-800"
            >
              GitHub.
            </Link>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-4xl font-semibold">Contact</h2>
          <p>Email: woosuk at hanyang.ac.kr</p>
        </section>
      </section>
    </div>
  );
}
