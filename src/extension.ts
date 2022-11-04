import { ClientRequest } from 'http';
import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';

export function activate(context:ExtensionContext){
    console.log("Activated "+context);
    let serverOptions: ServerOptions = {
        run : { command : "conjure",args:["lsp"]},
        debug: { command: "conjure", args: ["lsp"] }
    }

    // Options to control the language client
    let clientOptions: LanguageClientOptions = {
        documentSelector: [{scheme:'file',language:'essence'}],
    }
    let disposable = new LanguageClient ("Conjure Language Server",serverOptions,clientOptions,true);
    disposable.start()
    console.log("Setup done");
    
    context.subscriptions.push(disposable)
}