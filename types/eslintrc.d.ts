declare module "@eslint/eslintrc" {
    namespace Legacy {
        namespace ConfigArrayFactory {
            /** Check if a config file on a given directory exists or not.
             *
             * @param directoryPath The path to a directory.
             * @returns The path to the found config file. If not found then null. */
            function getPathToConfigFileInDirectory(directoryPath: string): string | null;
        }
    }
}
