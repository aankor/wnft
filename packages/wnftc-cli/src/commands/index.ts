import {Command} from 'commander';
import {installCreateRoot} from './createRoot';
import {installSetCollection} from './setCollection';
import {installCreateTree} from './createTree';
import {installMintWnft} from './mintWnft';
// import { installShow } from "./show";

export function installCommands(program: Command) {
  // installShow(program);
  installCreateRoot(program);
  installSetCollection(program);
  installCreateTree(program);
  installMintWnft(program);
}
