const byUsername = new Map([
    ["softwareventures", "Software Ventures Limited"],
    ["eccosolutions", "ecco solutions ltd"]
]);

/** A subset of ProjectOptions used by the guessCopyrightHolder function. */
export interface GuessCopyrightHolderOptions {
    readonly license?: {
        readonly copyrightHolder?: string;
    };
    readonly npmPackage?: {
        readonly scope?: string;
    };
    readonly gitHost?:
        | {
              readonly user?: string;
          }
        | object;
    readonly author?: {
        readonly name?: string;
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
