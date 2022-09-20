const byUsername = new Map([
    ["softwareventures", "Software Ventures Limited"],
    ["eccosolutions", "ecco solutions ltd"]
]);

/** A subset of ProjectOptions used by the guessCopyrightHolder function. */
export interface GuessCopyrightHolderOptions {
    readonly license?:
        | undefined
        | {
              readonly copyrightHolder?: string | undefined;
          };
    readonly npmPackage?:
        | undefined
        | {
              readonly scope?: string | undefined;
          };
    readonly gitHost?:
        | {
              readonly user?: string | undefined;
          }
        | undefined
        | object;
    readonly author?:
        | undefined
        | {
              readonly name?: string | undefined;
          };
}

export function guessCopyrightHolder(options: GuessCopyrightHolderOptions): string | undefined {
    return (
        options.license?.copyrightHolder ??
        byUsername.get(options.npmPackage?.scope ?? "") ??
        (options.gitHost != null && "user" in options.gitHost
            ? byUsername.get(options.gitHost.user ?? "")
            : null) ??
        options.author?.name
    );
}
