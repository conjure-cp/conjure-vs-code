import { ChildProcess, execSync } from 'child_process';
import { satisfies } from 'compare-versions';
import { ClientRequest } from 'http';
import * as path from 'path';
import { window } from 'vscode'
import { workspace, ExtensionContext } from 'vscode';

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';
import { vscode } from 'vscx';

export function activate(context: ExtensionContext) {
    tryStartLanguageServer(context);



}
function tryStartLanguageServer(context: ExtensionContext) {
    let conjureVersion = checkConjureVersion()
    if (conjureVersion === undefined) {
        window.showErrorMessage(`Couldn't launch Conjure, please check it is on PATH`);
        return
    }
    if (!satisfies(conjureVersion, ">=2.5.0")) {
        window.showErrorMessage(`The installed version of Conjure (${conjureVersion}) predates LSP support, plese update to use these features`)
        if (!vscode.workspace.getConfiguration("conjure").get("overrideVersionCheck", false)) {
            return
        }

    }
    window.showInformationMessage(`Found Conjure v${conjureVersion}`)
    let serverOptions: ServerOptions = {
        run: { command: "conjure", args: ["lsp"] },
        debug: { command: "conjure", args: ["lsp"] }
    }

    // Options to control the language client
    let clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'essence' }],
    }
    let disposable = new LanguageClient("Conjure Language Server", serverOptions, clientOptions, true);
    disposable.start()
    console.log("Setup done");

    context.subscriptions.push(disposable)
}
function checkConjureVersion(): string | undefined {
    try {
        let result = execSync("conjure --version", { timeout: 500, windowsHide: true, encoding: "utf-8" })
        let pattern = /Release version (\d+\.\d+\.\d+)/g
        if (!result.startsWith("Conjure: The Automated Constraint Modelling Tool")) {
            window.showWarningMessage("Found some conjure on they system but it's not the right one")
            console.error("This is not the conjure we were looking for...");
            return undefined
        }
        let match = pattern.exec(result)
        if (match == null) {
            window.showWarningMessage(`Couldn't get version number from : ${result}`)
            console.error(`Couldn't get version number from : ${result}`)
            return undefined
        }
        return match[1]

    } catch (error) {
        window.showErrorMessage(`Failed to start exectuable conjure. \n Got error ${error}`)
        console.error(`Got error : ${error}`)
        return undefined
    }

}
