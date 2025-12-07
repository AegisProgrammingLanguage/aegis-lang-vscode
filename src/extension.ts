import * as path from 'path';
import * as fs from 'fs';
import { workspace, ExtensionContext } from 'vscode';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	Executable,
	TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	console.log('Activation de l\'extension Aegis (Bundled)...');

	// 1. Déterminer le nom du binaire selon l'OS
	const isWindows = process.platform === 'win32';
	const binaryName = isWindows ? 'aegis_lsp.exe' : 'aegis_lsp';

	// 2. Trouver le chemin ABSOLU vers le dossier 'bin' de l'extension
	const serverPath = context.asAbsolutePath(
		path.join('bin', binaryName)
	);

	console.log(`LSP Server Path: ${serverPath}`);

	// 3. (Linux/Mac) Donner les droits d'exécution si nécessaire
	if (!isWindows) {
		try {
			fs.chmodSync(serverPath, '755');
		} catch (e) {
			console.error(`Impossible de donner les droits d'exécution au binaire : ${e}`);
		}
	}

	// 4. Configuration du serveur
	const run: Executable = {
		command: serverPath, // On utilise le chemin interne
		transport: TransportKind.stdio,
	};

	const serverOptions: ServerOptions = {
		run,
		debug: run,
	};

	const clientOptions: LanguageClientOptions = {
		documentSelector: [{ scheme: 'file', language: 'aegis' }],
		synchronize: {
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	client = new LanguageClient(
		'aegisLsp',
		'Aegis Language Server',
		serverOptions,
		clientOptions
	);

	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
